import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Alert,
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
    if (!acceptedTerms) {
      alert('You must accept the Terms and Conditions');
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#374151" />
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
              onChangeText={text => setAddressLine1(text)}
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
              onChangeText={text => setCity(text)}
              iconName="city"
              error={errors.city}
            />
            <CustomInputField
              placeholder="State"
              value={state}
              onChangeText={text => setState(text)}
              iconName="map-marker-radius-outline"
              error={errors.state}
            />
            <CustomInputField
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={text => setPostalCode(text)}
              iconName="mailbox-outline"
              keyboardType="numeric"
              error={errors.postalCode}
            />
            <CustomInputField
              placeholder="Country"
              value={country}
              onChangeText={text => setCountry(text)}
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
              style={styles.sendButton} 
            />
          </View>
        </View>
      </View>

      {/* Terms Modal */}
      <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    marginTop: 50,
    marginBottom: 40,
  },
  subtitle: {
    color: Colors.light.mutedText,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  sendButton: {
    marginTop: 16,
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
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  linkText: {
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
});

export default AddressDetailsScreen;

