import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';

import { MainText, SubText, LinkText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import StepIndicator from '../../components/StepIndicator';
import CustomCheckbox from '../../components/CustomCheckbox'; // Your checkbox component
import TermsModal from '../../components/TermsModal';
import { callMobileApi } from '../../scripts/api';

type RootStackParamList = {
  KycScreen: undefined;
  AddressDetailsScreen: undefined;
};

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};

type Props = {
  navigation: NavigationProp;
  route: any;
};

const AddressDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  // Get data from previous screen
  const { phoneNumber, personalInfo, userInfo } = route.params || {};

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  const [errors, setErrors] = useState({
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  // New state for checkbox and modal
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define terms content
  const termsContent = `BNPL Service Terms and Conditions

1. Acceptance of Terms

By using our Buy Now, Pay Later (BNPL) service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and our company.

2. Eligibility Criteria

• You must be at least 18 years old
• You must have a valid government-issued photo identification
• You must provide accurate and complete personal information
• You must have a valid email address and phone number
• You must meet our credit assessment criteria

3. Payment Terms and Schedule

• Initial payment: 25% of the total purchase amount due at checkout
• Remaining payments: 3 equal installments due every 2 weeks
• Late fee: $10 for payments overdue by more than 7 days
• Failed payment fee: $5 per failed payment attempt
• All payments are automatically charged to your selected payment method

4. Credit Assessment

We perform a soft credit check that does not affect your credit score. We may decline your application based on:
• Credit history
• Payment history with BNPL services
• Current debt-to-income ratio
• Other risk factors

5. Privacy and Data Collection

We collect and process your personal information including:
• Contact information (name, address, phone, email)
• Financial information (income, payment methods)
• Credit information (credit score, payment history)
• Transaction data
Your data is protected according to our Privacy Policy and applicable data protection laws.

6. Merchant Partnerships

• We partner with approved merchants to offer BNPL services
• Returns and refunds are subject to the merchant's policy
• We are not responsible for product quality or delivery issues
• Disputes should first be addressed with the merchant

7. Account Management

• You can view payment schedules and make early payments through our app
• Update your payment methods and personal information as needed
• Contact customer service for payment modifications or concerns
• Account statements are available electronically

8. Limitation of Liability

Our liability is limited to the maximum extent permitted by law. We are not responsible for:
• Indirect, incidental, or consequential damages
• Lost profits or business opportunities
• Merchant-related issues
• Service interruptions due to technical issues

9. Termination

We may suspend or terminate your account if you:
• Fail to make payments as scheduled
• Provide false or misleading information
• Violate these terms and conditions
• Engage in fraudulent activity

10. Changes to Terms

We reserve the right to modify these terms at any time. You will be notified of significant changes via email or app notification. Continued use of our service constitutes acceptance of the modified terms.

11. Contact Information

Customer Service: support@bnplservice.com
Phone: 1-800-BNPL-HELP
Address: 123 Finance Street, City, State 12345

For disputes or complaints, please contact our customer service team first. If unresolved, you may file a complaint with relevant financial authorities.

Last updated: ${new Date().toLocaleDateString()}`;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Auto scroll when keyboard appears
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: 100,
              animated: true,
            });
          }
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const validateFields = () => {
    let valid = true;
    let newErrors = {
      addressLine1: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    };

    if (!addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
      valid = false;
    }
    if (!city.trim()) {
      newErrors.city = 'City is required';
      valid = false;
    }
    if (!state.trim()) {
      newErrors.state = 'State is required';
      valid = false;
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal Code is required';
      valid = false;
    }
    if (!country.trim()) {
      newErrors.country = 'Country is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      // Prepare address data
      const addressData = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      };

      // Split full name into first and last name
      const fullName = personalInfo?.fullName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
  
      // Prepare customer data for API
      const customerPayload = {
        firstName: firstName,
        lastName: lastName,
        address: addressData.addressLine1,
        addressOptional: addressData.addressLine2 || null,
        city: addressData.city,
        state: addressData.state,
        postalCode: parseInt(addressData.postalCode) || null,
        country: addressData.country,
        email: personalInfo?.email || '',
        phoneNumber: phoneNumber || '',
        salary: 0,
      };

      console.log('Creating customer with payload:', customerPayload);
      console.log('Full name split - First:', firstName, 'Last:', lastName);

      const response = await callMobileApi(
        'CreateCustomer',
        customerPayload,
        'mobile-app-create-customer',
        '',
        'customer'
      );

      console.log('CreateCustomer response:', response);

      if (response.statusCode === 200) {
        // Navigate to KycScreen with proper error handling
        try {
          navigation.navigate('KycScreen');
        } catch (navError) {
          console.error('Navigation error:', navError);
          Alert.alert('Navigation Error', 'Unable to navigate to KYC screen. Please check your navigation configuration.');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to create customer profile');
      }
    } catch (error: any) {
      console.error('CreateCustomer error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create customer profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when user starts typing
  const handleAddressLine1Change = (text: string) => {
    setAddressLine1(text);
    if (errors.addressLine1) {
      setErrors(prev => ({ ...prev, addressLine1: '' }));
    }
  };

  const handleCityChange = (text: string) => {
    setCity(text);
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }));
    }
  };

  const handleStateChange = (text: string) => {
    setState(text);
    if (errors.state) {
      setErrors(prev => ({ ...prev, state: '' }));
    }
  };

  const handlePostalCodeChange = (text: string) => {
    setPostalCode(text);
    if (errors.postalCode) {
      setErrors(prev => ({ ...prev, postalCode: '' }));
    }
  };

  const handleCountryChange = (text: string) => {
    setCountry(text);
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingBottom: Math.max(80, keyboardHeight / 3) }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.contentWrapper}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="#374151"
                />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <MainText size="xlarge" weight="bold" align="left">
                  Help us locate you
                </MainText>
                <SubText size="medium" align="left" style={styles.subtitle}>
                  Your location helps us serve you better
                </SubText>
              </View>

              {/* Step Indicator */}
              <View style={styles.stepIndicatorWrapper}>
                <StepIndicator currentStep={4} />
              </View>

              {/* Form */}
              <View style={styles.centeredBox}>
                <View style={styles.form}>
                  <CustomInputField
                    placeholder="Address Line 1"
                    value={addressLine1}
                    onChangeText={handleAddressLine1Change}
                    iconName="home-outline"
                    error={errors.addressLine1}
                  />
                  <CustomInputField
                    placeholder="Address Line 2 (optional)"
                    value={addressLine2}
                    onChangeText={text => setAddressLine2(text)}
                    iconName="home-outline"
                  />
                  <CustomInputField
                    placeholder="City"
                    value={city}
                    onChangeText={handleCityChange}
                    iconName="city"
                    error={errors.city}
                  />
                  <CustomInputField
                    placeholder="State"
                    value={state}
                    onChangeText={handleStateChange}
                    iconName="map-marker-radius-outline"
                    error={errors.state}
                  />
                  <CustomInputField
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={handlePostalCodeChange}
                    iconName="mailbox-outline"
                    keyboardType="numeric"
                    error={errors.postalCode}
                  />
                  <CustomInputField
                    placeholder="Country"
                    value={country}
                    onChangeText={handleCountryChange}
                    iconName="earth"
                    error={errors.country}
                  />

                  {/* Terms and Conditions checkbox with clickable text */}
                  <View style={styles.termsContainer}>
                    <CustomCheckbox
                      checked={acceptedTerms}
                      onToggle={() => setAcceptedTerms(!acceptedTerms)}
                      size="small"
                    />
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text
                        style={styles.linkText}
                        onPress={() => setShowTermsModal(true)}
                      >
                        Terms and Conditions
                      </Text>
                    </Text>
                  </View>

                  <CustomButton
                    title="Next"
                    onPress={handleNext}
                    loading={loading}
                    disabled={!acceptedTerms}
                    style={[
                      styles.sendButton,
                      !acceptedTerms && styles.disabledButton
                    ]}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        content={termsContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  centeredBox: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.light.mutedText,
  },
  form: {
    width: '100%',
  },
  sendButton: {
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  stepIndicatorWrapper: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  linkText: {
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
});

export default AddressDetailsScreen;

