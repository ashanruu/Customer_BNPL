import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheetModal from '../../components/BottomSheetModal';

interface PaymentMethod {
  id: number;
  type: 'visa' | 'mastercard' | 'boc' | 'commercial';
  lastFourDigits: string;
  logo: any;
}

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'bank' | 'card' | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      type: 'visa',
      lastFourDigits: '3818',
      logo: require('../../assets/images/visa-logo.png'),
    },
    {
      id: 2,
      type: 'mastercard',
      lastFourDigits: '2276',
      logo: require('../../assets/images/Mastercard.png'),
    },
    {
      id: 3,
      type: 'boc',
      lastFourDigits: '1234',
      logo: require('../../assets/images/BOC.png'),
    },
    {
      id: 4,
      type: 'commercial',
      lastFourDigits: '1234',
      logo: require('../../assets/images/Commercial.png'),
    },
  ];

  const handleAddPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  const handlePaymentTypeSelect = (type: 'bank' | 'card') => {
    setSelectedPaymentType(type);
  };

  const handleContinue = () => {
    if (selectedPaymentType) {
      console.log('Selected payment type:', selectedPaymentType);
      setShowAddPaymentModal(false);
      setSelectedPaymentType(null);
      // Navigate to the respective screen based on selection
    }
  };

  const handlePaymentMethodPress = (method: PaymentMethod) => {
    console.log('Selected payment method:', method.type);
    // Handle payment method selection
  };

  const formatCardNumber = (lastFour: string, type: string) => {
    if (type === 'boc' || type === 'commercial') {
      return `${lastFour} •••• •••• ••••`;
    }
    return `•••• ${lastFour}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Back Button and Title in Row */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Payment Methods List */}
        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                index === paymentMethods.length - 1 && styles.lastCard,
              ]}
              onPress={() => handlePaymentMethodPress(method)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                {/* Card Logo */}
                <View style={styles.cardIconContainer}>
                  <Image
                    source={method.logo}
                    style={styles.cardLogoImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Card Number */}
                <Text style={styles.cardNumber}>
                  {formatCardNumber(method.lastFourDigits, method.type)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add new payment method</Text>
        </TouchableOpacity>
      </View>

      {/* Add Payment Method Bottom Sheet Modal */}
      <BottomSheetModal
        visible={showAddPaymentModal}
        onClose={() => {
          setShowAddPaymentModal(false);
          setSelectedPaymentType(null);
        }}
        title=""
        showBackButton={true}
        showCloseButton={false}
        scrollable={false}
        height={380}
        contentPadding={0}
      >
        <View style={styles.modalContainer}>
          {/* Custom Title */}
          <View style={styles.customTitleContainer}>
            <Text style={styles.customModalTitle}>Add new payment method</Text>
          </View>

          {/* Payment Options */}
          <View style={styles.modalContent}>
            {/* Bank Account Option */}
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handlePaymentTypeSelect('bank')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioButton,
                selectedPaymentType === 'bank' && styles.radioButtonSelected
              ]}>
                {selectedPaymentType === 'bank' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.paymentOptionText}>Bank Account</Text>
            </TouchableOpacity>

            {/* Card Option */}
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => handlePaymentTypeSelect('card')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioButton,
                selectedPaymentType === 'card' && styles.radioButtonSelected
              ]}>
                {selectedPaymentType === 'card' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.paymentOptionText}>Card</Text>
            </TouchableOpacity>
          </View>

          {/* Continue Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedPaymentType && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!selectedPaymentType}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    width: '100%',
    height: 56,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#006DB9',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006DB9',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  placeholder: {
    width: 32,
  },
  paymentMethodsContainer: {
    marginTop: 32,
    marginLeft: 8,
    marginRight: 8,
  },
  paymentMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        //shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        //shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  lastCard: {
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardIconContainer: {
    width: 56,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogoImage: {
    width: 40,
    height: 20,
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  customTitleContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  customModalTitle: {
    fontSize: 20,
    //fontWeight: '600',
    color: '#1F2937',
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  modalBackButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    //fontWeight: '600',
    color: '#1F2937',
    flex: 1,
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
  modalHeaderSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    opacity: 0.8,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#0066CC',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066CC',
  },
  paymentOptionText: {
    fontSize: 16,
    fontWeight: '400',
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
  continueButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  continueButtonDisabled: {
    backgroundColor: '#0066CC',
    //opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});

export default PaymentMethodsScreen;
