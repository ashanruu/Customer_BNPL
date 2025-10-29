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
  BackHandler,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../../components/CustomButton';
import { useTranslation } from 'react-i18next';
import { callMobileApi } from '../../scripts/api';

type RootStackParamList = {
  OrderPageScreen: { 
    qrData?: string; 
    orderId?: string; 
    saleCode?: string; 
    merchantId?: string; 
    url?: string; 
  };
  OrderDetailsScreen: { order: any; screenType: string };
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

      // Process validation with actual API call
      const processValidation = async () => {
        try {
          // Validate URL format first
          const urlValidation = isValidSaleURL(manualCode);
          
          if (!urlValidation.isValid) {
            setResponseMessage('Invalid QR code format. Please scan a valid BNPL sale QR code.');
            setResponseStatus('error');
            return;
          }

          // Call API with extracted order ID
          const response = await ValidateSale(urlValidation.orderId!);
          
          if (response.success) {
            resetModalState();
            navigation.navigate('OrderPageScreen', { 
              qrData: manualCode,
              orderId: urlValidation.orderId,
              saleCode: urlValidation.orderId
            });
          } else {
            // Show error with backend message
            setResponseMessage(response.message);
            setResponseStatus('error');
          }
        } catch (error) {
          console.error('Validation error:', error);
          setResponseMessage('An unexpected error occurred. Please try again.');
          setResponseStatus('error');
        }
      };

      processValidation();
    }
  }, [showProgressModal, responseStatus]);

  // Handle hardware back button on SalesScreen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate back to previous screen or show exit dialog
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Show confirmation dialog when user tries to exit the app
          Alert.alert(
            t('dialogs.exitApp'),
            t('dialogs.exitAppMessage'),
            [
              {
                text: t('common.cancel'),
                onPress: () => null,
                style: 'cancel',
              },
              {
                text: t('dialogs.exit'),
                onPress: () => BackHandler.exitApp(),
              },
            ],
            { cancelable: false }
          );
        }
        return true; // Prevent default back action
      };

      // Add event listener for hardware back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function
      return () => backHandler.remove();
    }, [navigation, t])
  );

  const resetModalState = () => {
    setShowProgressModal(false);
    setResponseStatus('processing');
    setResponseMessage('');
    slideAnim.setValue(height);
    // Reset scanning state so user can scan again
    setScanned(false);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('QR Code scanned:', data);
    setManualCode(data);

    // Check if it's a valid BNPL sale URL
    const urlValidation = isValidSaleURL(data);
    
    if (!urlValidation.isValid) {
      Alert.alert(
        t('sales.error'), 
        'Invalid QR code format. Please scan a valid BNPL sale QR code.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset scanning state so user can scan again immediately
              setScanned(false);
              setManualCode('');
            }
          }
        ]
      );
      return;
    }

    // Auto continue with validation when valid QR code is detected
    setTimeout(() => {
      setLoading(true);

      // Brief loading then show progress modal for validation
      setTimeout(() => {
        setLoading(false);
        setShowProgressModal(true);
        setResponseStatus('processing');
      }, 500);
    }, 100);
  };

  const handleSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert(t('sales.missingInformation'), t('sales.scanOrEnterLink'));
      return;
    }

    // Validate the manually entered URL format
    const urlValidation = isValidSaleURL(manualCode.trim());
    
    if (!urlValidation.isValid) {
      Alert.alert(
        t('sales.error'), 
        'Invalid URL format. Please enter a valid BNPL sale.'
      );
      return;
    }

    setLoading(true);

    // Brief loading then show progress modal for validation
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
    // Retry with the same QR code without resetting scanned state
    setResponseStatus('processing');
    setResponseMessage('');
    setShowProgressModal(true);
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



  const ValidateSale = async (saleCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Validating sale with code:', saleCode);
      
      const response = await callMobileApi(
        'ValaidateSale',
        { saleCode: saleCode },
        'mobile-app-validate-sale',
        '',
        'customer'
      );

      console.log('ValidateSale API response:', response);

      // Check if the response indicates success (response format: {data: true, message: "success", statusCode: 200})
      if (response && response.statusCode === 200 && response.data === true) {
        return { success: true, message: response.message || 'Sale validated successfully' };
      } else {
        return { 
          success: false, 
          message: response?.message || response?.error || 'Invalid sale code. Please try again.' 
        };
      }
    } catch (error: any) {
      console.error('ValidateSale API Error:', error);
      console.log('Full error object:', JSON.stringify(error, null, 2));
      
      // Check for specific error messages from the API
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      // Extract error message from various possible locations
      const apiErrorData = error?.response?.data?.data || error?.response?.data || error?.data;
      const apiErrorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      
      // Check if the error is related to missing card
      if (typeof apiErrorData === 'string' && apiErrorData.includes("Customer didn't add a card")) {
        errorMessage = t('sales.addCardFirst') || 'Please add a payment card first before making a purchase. Go to Profile > Cards to add your card.';
      } else if (typeof apiErrorMessage === 'string' && apiErrorMessage.toLowerCase().includes('card')) {
        errorMessage = t('sales.addCardFirst') || 'Please add a payment card first before making a purchase. Go to Profile > Cards to add your card.';
      } else if (apiErrorMessage) {
        errorMessage = apiErrorMessage;
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // URL validation function for BNPL QR codes
  const isValidSaleURL = (url: string): { isValid: boolean; orderId?: string } => {
    try {
      // Pattern 1: https://merchant.bnpl.hexdive.com/sale/{orderId}
      const merchantPattern = /^https:\/\/merchant\.bnpl\.hexdive\.com\/sale\/(.+)$/;
      const merchantMatch = url.trim().match(merchantPattern);
      
      if (merchantMatch && merchantMatch[1]) {
        const orderId = merchantMatch[1].trim();
        console.log('Extracted order ID from merchant URL:', orderId);
        return { isValid: true, orderId: orderId };
      }
      
      // Pattern 2: https://bnplqr.hexdive.com/sale/{orderId} (legacy support)
      const bnplqrPattern = /^https:\/\/bnplqr\.hexdive\.com\/sale\/(.+)$/;
      const bnplqrMatch = url.trim().match(bnplqrPattern);
      
      if (bnplqrMatch && bnplqrMatch[1]) {
        const orderId = bnplqrMatch[1].trim();
        console.log('Extracted order ID from bnplqr URL:', orderId);
        return { isValid: true, orderId: orderId };
      }
      
      console.log('URL does not match expected patterns:', url);
      return { isValid: false };
    } catch (error) {
      console.error('URL validation error:', error);
      return { isValid: false };
    }
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
                    style={styles.simpleCloseButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.simpleCloseText}>Close</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.simpleRetryButton}
                    onPress={handleRetry}
                  >
                    <Text style={styles.simpleRetryText}>Scan New</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
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
  simpleTryAgainButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  simpleTryAgainText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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



});