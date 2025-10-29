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
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';

import { MainText, SubText, LinkText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import StepIndicator from '../../components/StepIndicator';
import CustomCheckbox from '../../components/CustomCheckbox';
import TermsModal from '../../components/TermsModal';

type RootStackParamList = {
  SecuritySetupScreen: undefined;
  AddressDetailsScreen: undefined;
  TermsAndConditions: { onAccept?: (accepted: boolean) => void }; // Changed from TermsAndConditionsScreen
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
  const { t } = useTranslation();
  // Get data from previous screen
  const { phoneNumber, personalInfo, userInfo } = route.params || {};

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);

  const [errors, setErrors] = useState({
    addressLine1: '',
    city: '',
    state: '',
  });

  // New state for checkbox and modal
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define terms content
  const termsContent = `BNPL Service Terms and Conditions


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
              y: 0,
              animated: false,
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
      newErrors.state = 'District is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNext = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      // Prepare address data to pass to SecuritySetupScreen
      const addressData = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
      };

      // Navigate to SecuritySetupScreen with all collected data
      try {
        navigation.navigate('SecuritySetupScreen', {
          phoneNumber: phoneNumber,
          personalInfo: personalInfo,
          addressInfo: addressData,
        });
      } catch (navError) {
        console.error('Navigation error:', navError);
      }
    } catch (error: any) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to proceed to next step. Please try again.');
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainWrapper}>
            {/* Fixed Header Section */}
            <View style={styles.fixedHeader}>
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
                <MainText size="xlarge" weight="bold" align="left" color={Colors.light.primary}>
                  Help us locate you
                </MainText>
                <SubText size="medium" align="left" style={styles.subtitle} >
                  Your location helps us serve you better
                </SubText>
              </View>

              {/* Step Indicator */}
              <View style={styles.stepIndicatorWrapper}>
                <StepIndicator currentStep={4} />
              </View>
            </View>

            {/* Scrollable Form Section */}
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
                    placeholder="District"
                    value={state}
                    onChangeText={handleStateChange}
                    iconName="map-marker-radius-outline"
                    error={errors.state}
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
                        onPress={() => navigation.navigate('TermsAndConditions', {
                          onAccept: (accepted: boolean) => {
                            setAcceptedTerms(accepted);
                          }
                        })}
                      >
                        Terms and Conditions
                      </Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      !acceptedTerms ? styles.disabledButton : undefined
                    ]}
                    onPress={handleNext}
                    disabled={!acceptedTerms || loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Loading...' : 'Next'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
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
  mainWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: Colors.light.background,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
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
    marginBottom: 20,
  },
  subtitle: {
    color: Colors.light.mutedText,
  },
  form: {
    width: '100%',
    minHeight: 400,
  },
  sendButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 40,
    minHeight: 52,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#cccccc',
  },
  stepIndicatorWrapper: {
    width: '80%',
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
  buttonText: {
    color: Colors.light.background || '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AddressDetailsScreen;