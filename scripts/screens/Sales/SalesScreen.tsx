import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
  GestureResponderEvent,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../../components/CustomButton';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  OrderPageScreen: { qrData: string };
};

type SalesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ResponseStatus = 'processing' | 'success' | 'error';

const { width, height } = Dimensions.get('window');

const SalesScreen: React.FC = () => {
  const navigation = useNavigation<SalesScreenNavigationProp>();
  const { t } = useTranslation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [responseStatus, setResponseStatus] = useState<ResponseStatus>('processing');
  const [responseMessage, setResponseMessage] = useState('');
  const slideAnim = useState(new Animated.Value(height))[0];

  // Shop QR Modal States
  const [showShopQRModal, setShowShopQRModal] = useState(false);
  const [saleValue, setSaleValue] = useState('');
  const [note, setNote] = useState('');
  const [shopQRLoading, setShopQRLoading] = useState(true);
  const shopQRSlideAnim = useState(new Animated.Value(height))[0];

  // Simulate API response
  const simulateAPIResponse = (): { success: boolean; message: string } => {
    const responses = [
      // Success responses
      { success: true, message: 'QR code verified successfully! Order is ready to proceed.' },
      { success: true, message: 'Payment gateway connected. Everything looks good!' },
      { success: true, message: 'Customer verified. Welcome to BNPL service!' },

      // Error responses
      { success: false, message: 'Invalid QR code format. Please check and try again.' },
      { success: false, message: 'This QR code has already been used. Please scan a new one.' },
      { success: false, message: 'QR code has expired. Please generate a new one.' },
      { success: false, message: 'Network error. Please check your connection and retry.' },
      { success: false, message: 'Server temporarily unavailable. Please try again later.' },
    ];

    // 70% success rate for demo
    const isSuccess = Math.random() > 0.3;
    const successResponses = responses.filter(r => r.success);
    const errorResponses = responses.filter(r => !r.success);

    if (isSuccess) {
      return successResponses[Math.floor(Math.random() * successResponses.length)];
    } else {
      return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (showProgressModal && responseStatus === 'processing') {
      // Animate modal in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Simple loading simulation (2 seconds)
      const timer = setTimeout(() => {
        const response = simulateAPIResponse();

        if (response.success) {
          // Directly navigate without showing success stage
          resetModalState();
          navigation.navigate('OrderPageScreen', { qrData: manualCode });
        } else {
          // Only show error stage
          setResponseMessage(response.message);
          setResponseStatus('error');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showProgressModal, responseStatus]);

  // Temp Modal Animation Effect
  useEffect(() => {
    if (showShopQRModal) {
      Animated.spring(shopQRSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [showShopQRModal]);

  const resetModalState = () => {
    setShowProgressModal(false);
    setResponseStatus('processing');
    setResponseMessage('');
    slideAnim.setValue(height);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('QR Code scanned:', data);
    setManualCode(data);

    // Check if the scanned QR contains "shop" - if so, show the shop QR modal
    if (data.toLowerCase().includes('shop')) {
      console.log('Shop QR detected, showing Process Sale modal');
      setShowShopQRModal(true);
      return;
    }

    // Auto continue when QR code is detected (for non-shop QRs)
    setTimeout(() => {
      setLoading(true);

      // Simulate brief loading then show progress modal
      setTimeout(() => {
        setLoading(false);
        setShowProgressModal(true);
        setResponseStatus('processing');
      }, 500);
    }, 100); // Small delay to update UI state
  };

  const handleSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert(t('sales.missingInformation'), t('sales.scanOrEnterLink'));
      return;
    }

    // Check if the manually entered code contains "shop" - if so, show the shop QR modal
    if (manualCode.toLowerCase().includes('shop')) {
      console.log('Shop URL detected in manual input, showing Process Sale modal');
      setShowShopQRModal(true);
      return;
    }

    setLoading(true);

    // Simulate brief loading then show progress modal
    setTimeout(() => {
      setLoading(false);
      setShowProgressModal(true);
      setResponseStatus('processing');
    }, 500);
  };

  const handleRetry = () => {
    // Reset for new QR scanning
    setScanned(false);
    setManualCode('');
    resetModalState();
  };

  const handleTryAgain = () => {
    // Retry with the same QR code
    setResponseStatus('processing');
    setResponseMessage('');
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      resetModalState();
    });
  };

  // Shop QR Modal Functions
  const handleShopQRButtonPress = () => {
    setShowShopQRModal(true);
  };

  const closeShopQRModal = () => {
    Animated.timing(shopQRSlideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowShopQRModal(false);
      setSaleValue('');
      setNote('');
      shopQRSlideAnim.setValue(height);
    });
  };

  const handleShopQRProceed = () => {
    // Basic validation
    if (!saleValue.trim()) {
      Alert.alert(t('sales.error'), t('sales.enterSaleValue'));
      return;
    }

    // Validate if sale value is a number
    const numericValue = parseFloat(saleValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert(t('sales.error'), t('sales.enterValidAmount'));
      return;
    }

    setShopQRLoading(true);

    // Simulate processing
    setTimeout(() => {
      setShopQRLoading(false);
      Alert.alert(
        t('sales.success'),
        `${t('sales.saleProcessedSuccessfully')}\n${t('sales.amount')}: $${numericValue.toFixed(2)}\n${t('sales.note')}: ${note || t('sales.noNoteProvided')}`,
        [
          {
            text: t('sales.ok'),
            onPress: () => {
              closeShopQRModal();
            }
          }
        ]
      );
    }, 1000);
  };

  const getStatusIcon = () => {
    switch (responseStatus) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={64} color="#2D5016" />;
      case 'error':
        return <Ionicons name="close-circle" size={64} color="#8B4513" />;
      default:
        return <ActivityIndicator size="large" color="#20222E" />;
    }
  };

  const getStatusColors = () => {
    switch (responseStatus) {
      case 'success':
        return {
          primary: '#2D5016',
          background: '#E8F5E8',
          border: '#E8F5E8'
        };
      case 'error':
        return {
          primary: '#8B4513',
          background: '#FFF4E6',
          border: '#FFF4E6'
        };
      default:
        return {
          primary: '#20222E',
          background: '#F8F9FA',
          border: '#E5E5E5'
        };
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>{t('sales.settingUpCamera')}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="camera-outline" size={64} color="#E5E5E7" />
        </View>
        <Text style={styles.permissionText}>{t('sales.cameraAccessNeeded')}</Text>
        <Text style={styles.permissionSubtext}>{t('sales.enableCameraPermissions')}</Text>
      </View>
    );
  }

  const statusColors = getStatusColors();

  function handleClose(event: GestureResponderEvent): void {
    closeModal();
  }

  return (
    <View style={styles.screenContainer}>
      {/* Header Section with Dark Theme */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('sales.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('sales.subtitle')}</Text>
        </View>
      </View>

      <View style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Input Section */}
          <View style={styles.section}>

              <View style={styles.scannerContainer}>
                <CameraView
                  style={styles.scanner}
                  facing="back"
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr", "pdf417", "aztec", "ean13", "ean8", "upc_e", "code128", "code39", "code93", "codabar", "itf14", "datamatrix"],
                  }}
                />

                {/* Scanner Overlay */}
                <View style={styles.overlay}>
                  <View style={styles.scannerFrame} />
                </View>

                {/* Scanner Status */}
                <View style={styles.scannerStatus}>

                  {scanned && (
                    <TouchableOpacity
                      style={styles.rescanButton}
                      onPress={() => setScanned(false)}
                    >
                      <Text style={styles.rescanButtonText}>{t('sales.scanAgain')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            

            {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('sales.or')}</Text>
                <View style={styles.dividerLine} />
              </View>

            <Text style={styles.helperText}>
              {manualCode.length > 0
                ? t('sales.readyToProcess', { count: manualCode.length })
                : t('sales.noCameraNoProblem')}
            </Text>

            {/* Manual Input with Inline Go Button */}
              <View style={styles.manualInputContainer}>
                <View style={styles.inputWithButtonWrapper}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="link" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder={t('sales.enterSalesCode')}
                      placeholderTextColor="#8E8E93"
                      value={manualCode}
                      onChangeText={setManualCode}
                      textAlignVertical="center"
                    />
                  </View>
                  
                  {/* Inline Go Button */}
                  <TouchableOpacity
                    style={[
                      styles.inlineGoButton,
                      (!manualCode.trim() || loading) && styles.inlineGoButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={!manualCode.trim() || loading}
                  >
                    <Text style={[
                      styles.inlineGoButtonText,
                      (!manualCode.trim() || loading) && styles.inlineGoButtonTextDisabled
                    ]}>
                      {loading ? "..." : t('sales.go')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
          </View>

          {/* Help Text */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>{t('sales.needHelp')}</Text>
              <Text style={styles.helpText}>
                {t('sales.helpPoint1')}{'\n'}
                {t('sales.helpPoint2')}{'\n'}
                {t('sales.helpPoint3')}
              </Text>
            </View>

          {/* Shop QR Button */}
            <TouchableOpacity style={styles.shopQRButton} onPress={handleShopQRButtonPress}>
              <Ionicons name="construct-outline" size={20} color="#fff" style={styles.shopQRButtonIcon} />
              <Text style={styles.shopQRButtonText}>{t('sales.processSaleManually')}</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Simplified Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent={true}
        animationType="fade"
        onRequestClose={responseStatus !== 'processing' ? closeModal : undefined}
      >
        <View style={styles.simpleModalOverlay}>
          {responseStatus === 'processing' ? (
            // Processing State - Only loading indicator
            <ActivityIndicator size="large" color="#ffffffff" />
          ) : (
            // Error State with modal container
            <View style={styles.simpleModalContainer}>
              <View style={styles.errorContent}>
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle-outline" size={32} color="#DC3545" />
                  <Text style={styles.errorMessage}>{responseMessage}</Text>
                </View>
                
                <View style={styles.simpleActionButtons}>
                  <TouchableOpacity
                    style={styles.simpleRetryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.simpleRetryText}>{t('sales.scanNew')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.simpleCloseButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.simpleCloseText}>{t('sales.close')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Shop QR Modal */}
      <Modal
        visible={showShopQRModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeShopQRModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.shopQRModalContainer,
              {
                transform: [{ translateY: shopQRSlideAnim }],
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.shopQRModalHeader}>
              <View style={styles.modalHandle} />
              <TouchableOpacity style={styles.closeButton} onPress={closeShopQRModal}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>

              <View style={styles.shopQRTitleSection}>
                <Text style={styles.shopQRHeaderTitle}>{t('sales.processSale')}</Text>
                <Text style={styles.shopQRSubText}>
                  {manualCode.toLowerCase().includes('shop')
                    ? t('sales.detected', { url: manualCode.length > 50 ? manualCode.substring(0, 50) + '...' : manualCode })
                    : t('sales.subtitle')
                  }
                </Text>
              </View>
            </View>

            {/* Temp Content */}
            <View style={styles.shopQRContent}>
              {/* Input Fields */}
              <View style={styles.shopQRInputSection}>
                <Text style={styles.shopQRLabel}>{t('sales.saleValue')}</Text>
                <View style={styles.shopQRInputWrapper}>
                  <Ionicons name="cash-outline" size={20} color="#bdbdbd" style={styles.shopQRInputIcon} />
                  <TextInput
                    style={styles.shopQRInput}
                    placeholder={t('sales.enterSaleAmount')}
                    value={saleValue}
                    onChangeText={setSaleValue}
                    keyboardType="numeric"
                    placeholderTextColor="#bdbdbd"
                  />
                </View>

                <Text style={styles.shopQRLabel}>{t('sales.note')}</Text>
                <View style={styles.shopQRInputWrapper}>
                  <TextInput
                    style={[styles.shopQRInput, styles.shopQRNoteInput]}
                    placeholder={t('sales.addSaleNote')}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor="#bdbdbd"
                  />
                </View>

                {/* Action Button - Moved here */}
                <TouchableOpacity
                  style={[styles.shopQRActionButton, shopQRLoading && styles.shopQRDisabledButton]}
                  onPress={handleShopQRProceed}
                  disabled={shopQRLoading}
                >
                  {shopQRLoading ? (
                    <Text style={styles.shopQRActionButtonText}>{t('sales.processing')}</Text>
                  ) : (
                    <Text style={styles.shopQRActionButtonText}>{t('sales.proceed')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  headerSection: {
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 20,
  },
  scannerContainer: {
    height: height * 0.3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
  },
  scanner: {
    flex: 1,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 180,
    height: 180,
    borderWidth: 3,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  scannerStatus: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  scannerStatusText: {
    color: '#20222E',
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    letterSpacing: -0.2,
    borderWidth: 1,
    borderColor: '#20222E',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rescanButton: {
    backgroundColor: '#20222E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#20222E',
    fontWeight: '600',
  },
  manualInputContainer: {
    marginTop: 8,
  },
  inputWithButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 12,
    elevation: 2,
    minHeight: 48, // Set same height as button
    maxHeight: 48, // Limit height to match button
  },
    inputIcon: {
    marginTop: 14, // Adjusted for better vertical alignment
    marginRight: 8,
    color: '#8E8E93',
  },
  textInput: {
    flex: 1,
    fontSize: 13, // Reduced from 15
    paddingVertical: 14, // Adjusted for better centering
    color: '#000',
    fontWeight: '500',
    minHeight: 48, // Match container height
    maxHeight: 48, // Prevent expansion
    textAlignVertical: 'center', // Center the text vertically
  },
  inlineGoButton: {
    backgroundColor: '#20222E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    height: 48, // Fixed height instead of maxHeight
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineGoButtonDisabled: {
    backgroundColor: '#8E8E93',
    elevation: 0,
    shadowOpacity: 0,
  },
  inlineGoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  inlineGoButtonTextDisabled: {
    color: '#fff',
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    letterSpacing: -0.1,
    fontWeight: '500',
  },
  helpSection: {
    backgroundColor: 'rgba(32, 34, 46, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(32, 34, 46, 0.1)',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20222E',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#20222E',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  permissionSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 34, 46, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    minHeight: height * 0.6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#20222E',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  closeButton: {
    padding: 8,
    marginLeft: 'auto',
    marginTop: 8,
    borderRadius: 20,
  },
  progressContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  progressAnimationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  progressInfo: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#20222E',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#20222E',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#20222E',
  },
  qrInfo: {
    width: '100%',
    backgroundColor: 'rgba(32, 34, 46, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(32, 34, 46, 0.1)',
  },
  qrInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qrInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },

  // Simplified Modal Styles
  simpleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  simpleModalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  processingContent: {
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#20222E',
    marginTop: 16,
  },
  errorContent: {
    alignItems: 'center',
    width: '100%',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginLeft: 12,
    textAlign: 'left',
  },
  simpleActionButtons: {
        flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  simpleRetryButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  simpleCloseButton: {
    backgroundColor: '#000000ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  simpleRetryText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  simpleCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },


  shopQRButton: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopQRButtonIcon: {
    marginRight: 8,
  },
  shopQRButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Shop QR Modal Styles
  shopQRModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    minHeight: height * 0.7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  shopQRModalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  shopQRTitleSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  shopQRHeaderTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  shopQRSubText: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  shopQRContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shopQRInputSection: {
    flex: 1,
    paddingTop: 20,
  },
  shopQRLabel: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    marginTop: 6,
    marginBottom: 10,
  },
  shopQRInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 12,
    elevation: 2,
    marginBottom: 8,
    minHeight: 48,
  },
  shopQRInputIcon: {
    marginRight: 10,
  },
  shopQRInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: '#000',
    fontWeight: '500',
  },
  shopQRNoteInput: {
    minHeight: 80,
    maxHeight: 120,
    paddingTop: 12,
  },
  shopQRActionButton: {
    backgroundColor: '#20222E',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20, // Add margin top instead of bottom
  },
  shopQRDisabledButton: {
    backgroundColor: '#8E8E93',
  },
  shopQRActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
});