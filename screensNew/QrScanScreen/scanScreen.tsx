import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CameraView, Camera } from 'expo-camera';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheetModal from '../../components/BottomSheetModal';
import CustomButton from '../../components/CustomButton';

type RootStackParamList = {
  PaymentScreen: {
    qrData?: string;
    amount?: string;
    merchant?: string;
  };
};

type ScanScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const ScanScreen: React.FC = () => {
  const navigation = useNavigation<ScanScreenNavigationProp>();
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [merchantName, setMerchantName] = useState('NOLIMIT');

  // Modal states
  const [showEnterAmountModal, setShowEnterAmountModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [showPaymentScheduleModal, setShowPaymentScheduleModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card_1');
  // Modal 5: Identity confirmation
  const [showIdentityModal, setShowIdentityModal] = useState(false);

  // Payment data
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('3months');
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleFlashlight = () => {
    setIsFlashlightOn(!isFlashlightOn);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('QR Code scanned:', data);

    // Store QR data and merchant info
    setQrData(data);
    setMerchantName('NOLIMIT');

    // Show the first modal (Enter Amount)
    setShowEnterAmountModal(true);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  // Modal handlers
  const handleEnterAmountContinue = () => {
    if (!paymentAmount.trim() || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    setShowEnterAmountModal(false);
    setShowConfirmPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmPaymentModal(false);
    setShowPaymentScheduleModal(true);
  };

  const handlePaymentScheduleContinue = () => {
    setShowPaymentScheduleModal(false);
    setShowPaymentMethodModal(true);
  };

  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethod(id);
  };

  const handlePayNow = () => {
    // Show identity confirmation modal before final navigation
    setShowPaymentMethodModal(false);
    setShowIdentityModal(true);
  };

  const closeAllModals = () => {
    setShowEnterAmountModal(false);
    setShowConfirmPaymentModal(false);
    setShowPaymentScheduleModal(false);
    setShowPaymentMethodModal(false);
    setScanned(false);
    setPaymentAmount('');
    setQrData('');
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getPaymentPlanDetails = () => {
    const amount = parseFloat(paymentAmount) || 0;
    const plans = {
      '3months': { installments: 3, monthly: amount / 3 },
      '4months': { installments: 4, monthly: amount / 4 },
      '6months': { installments: 6, monthly: amount / 6 },
      '12months': { installments: 12, monthly: amount / 12 },
    };
    return plans[selectedPlan as keyof typeof plans] || plans['3months'];
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Setting up camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-outline" size={64} color="#E5E5E7" />
        <Text style={styles.permissionText}>Camera access needed</Text>
        <Text style={styles.permissionSubtext}>Please enable camera permissions in settings</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Icon name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleLight}>Scan the</Text>
          <Text style={styles.titleBold}>In-Store QR code</Text>
        </View>

        {/* Camera Scanner */}
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={isFlashlightOn}
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
          {scanned && (
            <View style={styles.scannerStatus}>
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.rescanButtonText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instruction Text */}
        <Text style={styles.instruction}>Point your camera at the QR code.</Text>
      </View>

      {/* Bottom Flashlight Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.flashlightButton}
          onPress={toggleFlashlight}
          activeOpacity={0.7}
        >
          <Icon
            name="flashlight"
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {/* Modal 1: Enter Payment Amount */}
      <BottomSheetModal
        visible={showEnterAmountModal}
        onClose={closeAllModals}
        title={''}
        showBackButton={true}
        onBackPress={closeAllModals}
        height="auto"
        contentPadding={24}
      >
        <View style={styles.modalContent}>
          {/* Merchant Info */}
          <View style={styles.merchantContainer}>
            <View style={styles.merchantLogo}>
              <Text style={styles.merchantLogoText}>NOLIMIT</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Enter Payment Amount</Text>
              <Text style={styles.merchantName}>Merchant: {merchantName}</Text>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <View style={styles.dashedBox}>
              <Text style={styles.amountPlaceholder}>Enter Amount</Text>

              <View style={styles.amountRow}>
                <Text style={styles.currencyText}>Rs.</Text>
                <TextInput
                  style={styles.amountInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="00"
                  placeholderTextColor="#0F172A"
                  keyboardType="numeric"
                  autoFocus
                />
                <Text style={styles.decimalText}>.00</Text>
              </View>
            </View>

            {paymentAmount.trim().length > 0 && (
              <Text style={styles.warningText}>
                Kindly double check the amount with the merchant prior to making the payment
              </Text>
            )}
          </View>


          {/* Continue Button */}
          <CustomButton
            title="Continue"
            onPress={handleEnterAmountContinue}
            variant="primary"
            disabled={!paymentAmount.trim()}
            style={styles.continueButton}
          />
        </View>
      </BottomSheetModal>

      {/* Modal 2: Confirm Payment (updated to match Modal 1 layout) */}
      <BottomSheetModal
        visible={showConfirmPaymentModal}
        onClose={closeAllModals}
        title=""
        showBackButton={true}
        onBackPress={() => {
          setShowConfirmPaymentModal(false);
          setShowEnterAmountModal(true);
        }}
        height="auto"
        contentPadding={24}
      >
        <View style={styles.modalContent}>
          {/* Merchant Info (matches Modal 1) */}
          <View style={styles.merchantContainer}>
            <View style={styles.merchantLogo}>
              <Text style={styles.merchantLogoText}>NOLIMIT</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Confirm Payment</Text>
              <Text style={styles.merchantName}>Merchant: {merchantName}</Text>
            </View>
          </View>

          {/* Amount Display (styled like Modal 1's input area) */}
          <View style={styles.amountContainer}>
            <View style={styles.dashedBox}>
              <Text style={styles.amountPlaceholder}>Amount</Text>

              <View style={styles.amountRow}>
                <Text style={styles.currencyText}>Rs.</Text>
                <Text
                  style={[
                    styles.amountInput,
                    { fontSize: 36, textAlign: 'center', paddingVertical: 0 },
                  ]}
                >
                  {formatAmount(paymentAmount)}
                </Text>
                <Text style={styles.decimalText}> </Text>
              </View>
            </View>

            <Text style={styles.warningText}>
              Confirm your payment details before proceeding.
            </Text>
          </View>

          {/* Action Buttons (same actions as before) */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Confirm Amount"
              onPress={handleConfirmPayment}
              variant="primary"
              style={styles.confirmButton}
            />
            <CustomButton
              title="Cancel"
              onPress={closeAllModals}
              variant="secondary"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </BottomSheetModal>

      {/* Modal 3: Payment Schedule */}
      <BottomSheetModal
        visible={showPaymentScheduleModal}
        onClose={closeAllModals}
        title=""
        showBackButton={true}
        onBackPress={() => {
          setShowPaymentScheduleModal(false);
          setShowConfirmPaymentModal(true);
        }}
        height="auto"
        contentPadding={24}
      >
        <View style={styles.modalContent}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.modalTitle, styles.modalTitleCentered]}>Payment Schedule</Text>
          </View>

          {/* Discount Option */}
          <TouchableOpacity
            style={styles.discountOptionContainer}
            activeOpacity={0.8}
          >
            <View style={styles.discountRadioOuter}>
              <View style={styles.discountRadioInner} />
            </View>

            <View style={styles.discountTextContainer}>
              <View style={styles.discountRow}>
                <Text style={styles.discountTitle}>
                  Get <Text style={styles.discountPercent}>5% Off</Text>
                </Text>
                <Text style={styles.planLabel}>pay at once</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.discountedPrice}>
                  {(parseFloat(paymentAmount || '0') * 0.95).toFixed(2)}
                </Text>
                <Text style={styles.strikePrice}>
                  {formatAmount(paymentAmount)}
                </Text>
              </View>
            </View>

            {/* <Image
    source={require('../../assets/lollipop-ghost.png')}
    style={styles.discountMascot}
  /> */}
          </TouchableOpacity>

          {/* Payment Plans */}
          <View style={styles.planContainer}>
            {[
              { key: '3months', months: 3, label: '3 months' },
              { key: '4months', months: 4, label: '4 months' },
              { key: '6months', months: 6, label: '6 months' },
              { key: '12months', months: 12, label: '12 months' },
            ].map((plan, index) => {
              const planDetails = getPaymentPlanDetails();
              const isSelected = selectedPlan === plan.key;
              const monthly = parseFloat(paymentAmount) / plan.months;

              return (
                <TouchableOpacity
                  key={plan.key}
                  style={[
                    styles.planOption,
                    isSelected && styles.planOptionSelected,
                    index < 2 && styles.planRow
                  ]}
                  onPress={() => setSelectedPlan(plan.key)}
                >
                  <View style={styles.radioButton}>
                    <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.planDetails}>
                    <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                      {plan.label}
                    </Text>
                    <Text style={styles.planAmount}>
                      {monthly.toFixed(2)} x {plan.months}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Proceed Button */}
          <CustomButton
            title={`Proceed with ${selectedPlan.replace('months', ' months')} plan`}
            onPress={handlePaymentScheduleContinue}
            variant="primary"
            style={styles.proceedButton}
          />
        </View>
      </BottomSheetModal>

      {/* Modal 4: Payment Method */}
      <BottomSheetModal
        visible={showPaymentMethodModal}
        onClose={closeAllModals}
        title=""
        showBackButton={true}
        onBackPress={() => {
          setShowPaymentMethodModal(false);
          setShowPaymentScheduleModal(true);
        }}
        height="auto"
        contentPadding={24}
      >
        <View style={styles.modalContent}>
          <View style={{ flex: 1, alignItems: 'center', marginBottom: 30 }}>
            <Text style={[styles.modalTitle, styles.modalTitleCentered]}>Payment Method</Text>
          </View>

          {/* Payment methods list */}
          {[
            { id: 'card_1', label: 'VISA •••• 3816', brand: 'VISA' },
            { id: 'card_2', label: '•••• 2399', brand: 'Other' },
          ].map((m) => {
            const selected = selectedPaymentMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.8}
                style={[
                  styles.planOption,
                  selected && styles.planOptionSelected,
                  // override planOption width so payment methods are full width
                  { flexDirection: 'row', alignItems: 'center', marginBottom: 12, width: '100%' }
                ]}
                onPress={() => handleSelectPaymentMethod(m.id)}
              >
                <View style={{ marginRight: 12 }}>
                  <View style={[styles.radioOuter, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planLabel, selected && styles.planLabelSelected]}>{m.brand}</Text>
                  <Text style={styles.planAmount}>{m.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add new payment method */}
          <TouchableOpacity
            style={{
              marginVertical: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
            onPress={() => {
              // navigate to add payment method screen or open appropriate flow
              // example: navigation.navigate('AddPaymentMethod');
              Alert.alert('Add Payment Method', 'Open Add Payment Method flow.');
            }}
          >
            <Text style={{ color: '#0F172A', fontWeight: '600' }}>Add New Payment Method</Text>
            <View style={{
              backgroundColor: '#F3F4F6',
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 24,
              minWidth: 72,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ color: '#0F172A', fontWeight: '600', fontSize: 16 }}>+ Add</Text>
            </View>
          </TouchableOpacity>

          {/* Pay button */}
          <CustomButton
            title={`Pay Rs. ${formatAmount(paymentAmount)}`}
            onPress={handlePayNow}
            variant="primary"
            style={{ marginTop: 20 }}
          />
        </View>
      </BottomSheetModal>

      {/* Modal 5: Identity Confirmation (Face ID / Use PIN) - updated to use same modalContent styles as Modal 4 */}
      <BottomSheetModal
        visible={showIdentityModal}
        onClose={() => setShowIdentityModal(false)}
        title=""
        showBackButton={true}
        onBackPress={() => {
          setShowIdentityModal(false);
          // return to payment method selection if user presses back
          setShowPaymentMethodModal(true);
        }}
        height="auto"
        contentPadding={24}
      >
        <View style={styles.modalContent}>
          <View style={{ flex: 1, alignItems: 'center', marginBottom: 30 }}>
            <Text style={[styles.modalTitle, styles.modalTitleCentered]}>Confirm Identity</Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <View style={styles.faceIconBox}>
              <Icon name="fingerprint" size={110} color="#006DB9" />
            </View>
          </View>

          {/* Try Face ID button  */}
          <CustomButton
            title={`Try again`}
            onPress={() => Alert.alert('Face ID', 'Retrying Confirmation...')}
            variant="outline"
            style={{ marginTop: 20 }}
          />

          {/* Use PIN fallback (secondary) */}
          <TouchableOpacity
            onPress={() => { Alert.alert('Use PIN', 'Navigating to PIN entry screen...'); }}
            activeOpacity={0.8}
            style={{ alignItems: 'center', marginTop: 14, padding: 20 }}
          >
            <Text style={styles.usePinText}>
              Having Trouble? <Text style={styles.usePinLink}>Use PIN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleLight: {
    fontSize: 20,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  titleBold: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  scannerContainer: {
    height: height * 0.5,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
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
    width: 220,
    height: 230,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  scannerStatus: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: '#20222E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: '600',
  },
  qrDisplayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCodeArea: {
    alignItems: 'center',
  },
  qrCodeBox: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  qrPattern: {
    flex: 1,
    position: 'relative',
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },
  qrCell: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 0.5,
    borderRadius: 1,
  },
  qrCellFilled: {
    backgroundColor: '#000000',
  },
  cornerSquare: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 2,
    padding: 4,
  },
  cornerInner: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  bannerContainer: {
    width: width - 40,
    maxWidth: 320,
  },
  banner: {
    backgroundColor: '#006DB9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bannerStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  arrow: {
    paddingHorizontal: 8,
  },
  bannerFooter: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  instruction: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  bottomContainer: {
    paddingVertical: 55,
    alignItems: 'center',
  },
  flashlightButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#20222E',
    marginTop: 24,
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
  modalContent: {
    paddingVertical: 10,
  },
  merchantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 20,
  },
  merchantLogo: {
    width: 54,
    height: 54,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  merchantLogoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  modalTitleCentered: {
    textAlign: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  amountContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },

  dashedBox: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  amountPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 12,
    fontWeight: '500',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },

  currencyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginRight: 4,
  },

  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    minWidth: 60,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },

  decimalText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 4,
  },

  continueButton: {
    marginTop: 1,
  },

  warningText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    lineHeight: 20,
  },

  amountLabel: {
    fontSize: 14,
    color: '#8B93A0',
    textAlign: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  confirmAmountContainer: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  confirmAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  confirmMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  buttonContainer: {
    gap: 12,
  },
  confirmButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginBottom: 0,
  },
  discountOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
    marginTop: 30,
  },

  discountRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  discountRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  discountTextContainer: {
    flex: 1,
  },

  discountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  discountTitle: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: '600',
    marginRight: 4,
  },

  discountPercent: {
    color: '#8B5CF6',
    fontWeight: '700',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },

  discountedPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },

  strikePrice: {
    fontSize: 14,
    color: '#8B93A0',
    textDecorationLine: 'line-through',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  discountMascot: {
    width: 48,
    height: 48,
    marginLeft: 12,
  },

  radioButton: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#006DB9',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006DB9',
  },
  discountContent: {
    flex: 1,
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006DB9',
    marginRight: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  payAtOnce: {
    fontSize: 14,
    color: '#475569',
    marginRight: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#006DB9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  originalPrice: {
    fontSize: 14,
    color: '#8B93A0',
    textDecorationLine: 'line-through',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  planContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    width: '48%',
    backgroundColor: '#FFFFFF',
    // subtle shadow for all options
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  planOptionSelected: {
    borderColor: '#004F85',
    backgroundColor: '#FFFFFF',
    // stronger shadow for selected option
    ...Platform.select({
      ios: {
        shadowColor: '#004F85',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  planRow: {
    marginBottom: 12,
  },
  planDetails: {
    marginLeft: 12,
    flex: 1,
  },
  planLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  planLabelSelected: {
    color: '#374151',
  },
  planAmount: {
    fontSize: 14,
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  proceedButton: {
    marginTop: 20,
  },
  identityModalContent: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  identityTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 18,
  },
  faceBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  faceIconBox: {
    width: 112,
    height: 112,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tryAgainBtn: {
    width: '100%',
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: '#0B67BB',
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  tryAgainText: {
    color: '#0B67BB',
    fontSize: 16,
    fontWeight: '600',
  },
  usePinText: {
    color: '#475569',
    fontSize: 14,
  },
  usePinLink: {
    color: '#0B67BB',
    fontWeight: '700',
  },
});

export default ScanScreen;