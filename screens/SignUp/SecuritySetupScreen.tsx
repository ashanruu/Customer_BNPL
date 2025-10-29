import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Text,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainText, SubText } from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import StepIndicator from '../../components/StepIndicator';
import { Colors } from '../../constants/Colors';
import { callMobileApi, callAuthApi } from '../../scripts/api';
import {
  checkBiometricCapability,
  authenticateWithBiometrics,
  saveSecuritySettings,
} from '../../utils/authUtils';

type RootStackParamList = {
  Main: undefined;
  SecuritySetupScreen: undefined;
};

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  pin?: string;
}

const SecuritySetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();

  // Get all user data from previous screens
  const { phoneNumber, personalInfo, addressInfo } = route.params as any || {};

  const [currentStep, setCurrentStep] = useState<'intro' | 'pin' | 'biometric' | 'complete'>('intro');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(true);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    pinEnabled: false,
    biometricEnabled: false,
  });
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check if biometric authentication is available
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const capability = await checkBiometricCapability();
      setBiometricAvailable(capability.available);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const finalizeRegistration = async () => {
    if (!phoneNumber || !personalInfo || !addressInfo) {
      Alert.alert('Error', 'Missing user information. Please go back and complete all steps.');
      return;
    }

    setIsRegistering(true);

    try {
      console.log('Starting final registration process...');

      // Prepare RegisterUser payload
      const registerPayload = {
        firstName: personalInfo.fullName,
        email: personalInfo.email,
        phoneNumber: phoneNumber,
        nic: personalInfo.nic,
        bod : personalInfo.dateOfBirth,
        password: personalInfo.password,
        userType: 2
      };

      console.log('Calling RegisterUser API...');
      const registerResponse = await callAuthApi('RegisterUser', registerPayload);
      console.log('RegisterUser response:', registerResponse);

      if (registerResponse.statusCode !== 200) {
        throw new Error(registerResponse.message || 'User registration failed');
      }

      // Save the token to AsyncStorage
      if (registerResponse.payload && registerResponse.payload.token) {
        try {
          await AsyncStorage.setItem('bearerToken', registerResponse.payload.token);
          console.log('Token saved successfully');
        } catch (storageError) {
          console.error('Failed to save token:', storageError);
        }
      }

      // Prepare CreateCustomer payload
      const customerPayload = {
        firstName: personalInfo.fullName,
        lastName: personalInfo.lastName || '.',
        address: addressInfo.addressLine1,
        addressOptional: addressInfo.addressLine2 || null,
        city: addressInfo.city,
        state: addressInfo.state,
        email: personalInfo.email,
        phoneNumber: phoneNumber,
        dob : personalInfo.dateOfBirth,
        salary: 0,
      };

      console.log('Calling CreateCustomer API...');
      const customerResponse = await callMobileApi(
        'CreateCustomer',
        customerPayload,
        'mobile-app-create-customer',
        '',
        'customer'
      );
      console.log('CreateCustomer response:', customerResponse);

      if (customerResponse.statusCode !== 200) {
        throw new Error(customerResponse.message || 'Customer creation failed');
      }

      console.log('Registration completed successfully!');
      return true;

    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', errorMessage);
      return false;
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (isCreatingPin) {
      if (pin.length < 6) {
        setPin(pin + digit);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(confirmPin + digit);
      }
    }
  };

  const handlePinDelete = () => {
    if (isCreatingPin) {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handlePinSubmit = () => {
    if (isCreatingPin && pin.length === 6) {
      setIsCreatingPin(false);
    } else if (!isCreatingPin && confirmPin.length === 6) {
      if (pin === confirmPin) {
        // Save PIN and move to biometric setup
        savePinToStorage(pin);
        setSecuritySettings(prev => ({ ...prev, pinEnabled: true, pin }));
        setCurrentStep('biometric');
      } else {
        Alert.alert('Error', 'PINs do not match. Please try again.');
        setPin('');
        setConfirmPin('');
        setIsCreatingPin(true);
      }
    }
  };

  const savePinToStorage = async (pinValue: string) => {
    try {
      await saveSecuritySettings({
        pinEnabled: true,
        userPin: pinValue,
      });
    } catch (error) {
      console.error('Error saving PIN:', error);
    }
  };

  const handleBiometricSetup = async (enable: boolean) => {
    try {
      if (enable && biometricAvailable) {
        // Prompt for biometric authentication to test if it works
        const success = await authenticateWithBiometrics();

        if (success) {
          await saveSecuritySettings({ biometricEnabled: true });
          setSecuritySettings(prev => ({ ...prev, biometricEnabled: true }));
          setCurrentStep('complete');
        } else {
          Alert.alert(
            'Biometric Setup Failed',
            'Please try again or continue without biometric authentication.',
            [
              { text: 'Try Again', onPress: () => handleBiometricSetup(true) },
              { text: 'Skip', onPress: () => handleBiometricSetup(false) }
            ]
          );
          return;
        }
      } else {
        await saveSecuritySettings({ biometricEnabled: false });
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('Error setting up biometric:', error);
      Alert.alert('Error', 'Failed to set up biometric authentication');
      await saveSecuritySettings({ biometricEnabled: false });
      setCurrentStep('complete');
    }
  };

  const handleSetupSecurity = async () => {
    try {
      setIsRegistering(true);
      
      // First, complete the final registration process
      const registrationSuccess = await finalizeRegistration();
      
      if (registrationSuccess) {
        setCurrentStep('pin');
      }
      // If registration fails, stay on the screen (error is already shown in finalizeRegistration)
    } catch (error) {
      console.error('Error starting security setup:', error);
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSkipSecurity = async () => {
    try {
      setIsRegistering(true);
      
      // First, complete the final registration process
      const registrationSuccess = await finalizeRegistration();
      
      if (registrationSuccess) {
        await AsyncStorage.setItem('securitySetupSkipped', 'true');
        navigation.navigate('Main');
      }
      // If registration fails, stay on the screen (error is already shown in finalizeRegistration)
    } catch (error) {
      console.error('Error skipping security setup:', error);
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleComplete = async () => {
    try {
      // Registration is already done at this point, just complete the security setup
      await AsyncStorage.setItem('securitySetupCompleted', 'true');
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error completing security setup:', error);
      Alert.alert('Error', 'Failed to complete security setup. Please try again.');
    }
  };

  const renderPinPad = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

    return (
      <View style={styles.pinPadContainer}>
        {digits.map((digit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pinButton,
              digit === '' && styles.emptyButton,
            ]}
            onPress={() => {
              if (digit === 'delete') {
                handlePinDelete();
              } else if (digit !== '') {
                handlePinInput(digit);
              }
            }}
            disabled={digit === ''}
          >
            {digit === 'delete' ? (
              <MaterialCommunityIcons name="backspace" size={24} color="#374151" />
            ) : digit !== '' ? (
              <Text style={styles.pinButtonText}>{digit}</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPinDots = () => {
    const currentPinValue = isCreatingPin ? pin : confirmPin;
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < currentPinValue.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <View style={styles.featureTextContainer}>
            <MainText size="medium" weight="medium" align="left">
              Create PIN
            </MainText>
            <SubText size="small" align="left">
              6-digit PIN for quick and secure access
            </SubText>
          </View>
        </View>

        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="fingerprint" size={24} />
          <View style={styles.featureTextContainer}>
            <MainText size="medium" weight="medium" align="left">
              Biometric Authentication
            </MainText>
            <SubText size="small" align="left">
              Use fingerprint or face recognition for instant access
            </SubText>
          </View>
        </View>
      </View>

      <CustomButton
        title={isRegistering ? 'Creating Account...' : 'Set Up Security'}
        onPress={handleSetupSecurity}
        loading={isRegistering}
        style={styles.primaryButton}
      />

      <CustomButton
        title={isRegistering ? 'Creating Account...' : 'Skip for Now'}
        onPress={handleSkipSecurity}
        loading={isRegistering}
        style={styles.primaryButton}
        variant="outline"
      />
    </View>
  );

  const renderPinStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.pinInstructionContainer}>
        <MainText size="medium" weight="medium" align="center">
          {isCreatingPin ? 'Enter your 6-digit PIN' : 'Confirm your PIN'}
        </MainText>
      </View>

      {renderPinDots()}
      {renderPinPad()}

      {((isCreatingPin && pin.length === 6) || (!isCreatingPin && confirmPin.length === 6)) && (
        <CustomButton
          title={isCreatingPin ? 'Continue' : 'Confirm PIN'}
          onPress={handlePinSubmit}
          style={styles.primaryButton}
        />
      )}

      <CustomButton
        title="Skip PIN Setup"
        onPress={() => setCurrentStep('biometric')}
        style={styles.primaryButton}
        variant="outline"
      />
    </View>
  );

  const renderBiometricStep = () => (
    <View style={styles.stepContainer}>
      {biometricAvailable && (
        <View style={styles.biometricBenefits}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} />
            <SubText size="medium" color={Colors.light.primary} style={styles.benefitText}>Faster login</SubText>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="shield-check" size={20} />
            <SubText size="medium" color={Colors.light.primary} style={styles.benefitText}>Enhanced security</SubText>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="gesture-tap" size={20} />
            <SubText size="medium" color={Colors.light.primary} style={styles.benefitText}>One-touch access</SubText>
          </View>
        </View>
      )}

      <CustomButton
        title={biometricAvailable ? 'Enable Biometric' : 'Continue'}
        onPress={() => handleBiometricSetup(biometricAvailable)}
        style={styles.primaryButton}
      />

      {biometricAvailable && (
        <CustomButton
          title="Skip for Now"
          onPress={() => handleBiometricSetup(false)}
          style={styles.primaryButton}
          variant="outline"
        />
      )}
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="check-circle" size={80} />
      </View>

      <MainText size="xlarge" weight="bold" align="center">
        Setup Complete!
      </MainText>
      <SubText size="medium" align="center" style={styles.description}>
        Your account is now secured with the following features:
      </SubText>

      <View style={styles.completeSummary}>
        {securitySettings.pinEnabled && (
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="check" size={20} />
            <SubText size="medium" align="left" color={Colors.light.primary} style={styles.summaryText}>6-digit PIN created</SubText>
          </View>
        )}
        {securitySettings.biometricEnabled && (
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="check" size={20} />
            <SubText size="medium" align="left" color={Colors.light.primary} style={styles.summaryText}>Biometric authentication enabled</SubText>
          </View>
        )}
      </View>

      <CustomButton
        title="Continue to App"
        onPress={handleComplete}
        style={styles.primaryButton}
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntroStep();
      case 'pin':
        return renderPinStep();
      case 'biometric':
        return renderBiometricStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderIntroStep();
    }
  };

  const getHeaderContent = () => {
    switch (currentStep) {
      case 'intro':
        return {
          title: 'Secure Your Account',
          subtitle: 'Set up security to protect your information'
        };
      case 'pin':
        return {
          title: 'Create Security PIN',
          subtitle: 'Set up a 6-digit PIN for secure access'
        };
      case 'biometric':
        return {
          title: 'Biometric Security',
          subtitle: 'Enable fingerprint or face recognition'
        };
      case 'complete':
        return {
          title: 'Security Setup Complete',
          subtitle: 'Your account is now protected and ready'
        };
      default:
        return {
          title: 'Secure Your Account',
          subtitle: 'Set up security to protect your information'
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

            {/* Dynamic Header */}
            <View style={styles.header}>
              <MainText size="xlarge" weight="bold" align="left">
                {getHeaderContent().title}
              </MainText>
              <SubText size="medium" align="left" style={styles.subtitle}>
                {getHeaderContent().subtitle}
              </SubText>
            </View>

            {/* Step Indicator */}
            <View style={styles.stepIndicatorWrapper}>
              <StepIndicator currentStep={5} />
            </View>

            {/* Content */}
            <View style={styles.centeredBox}>
              {renderCurrentStep()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  centeredBox: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    flex: 1,
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
  stepIndicatorWrapper: {
    width: '80%',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: 10,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  description: {
    color: Colors.light.mutedText,
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: '#374151',
  },
  pinPadContainer: {
    width: 250,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  pinButton: {
    width: 60,
    height: 60,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    width: 60,
    height: 60,
  },
  pinButtonText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#374151',
  },
  biometricBenefits: {
    width: '70%',
    marginBottom: 40,
    alignContent: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  benefitText: {
    marginLeft: 12,
  },
  completeSummary: {
    width: '100%',
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    marginLeft: 12,
  },
  primaryButton: {
    marginTop: 12,
    width: '100%',
  },
  pinInstructionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  confirmationText: {
    color: Colors.light.mutedText,
    marginTop: 8,
  },
});

export default SecuritySetupScreen;