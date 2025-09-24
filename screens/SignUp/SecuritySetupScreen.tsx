import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { callMobileApi, callAuthApi } from '../../scripts/api';
import {
  checkBiometricCapability,
  authenticateWithBiometrics,
  saveSecuritySettings,
} from '../../utils/authUtils';

const { width } = Dimensions.get('window');

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
        postalCode: parseInt(addressInfo.postalCode) || null,
        country: addressInfo.country,
        email: personalInfo.email,
        phoneNumber: phoneNumber,
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

  const handleSkipSecurity = async () => {
    try {
      await AsyncStorage.setItem('securitySetupSkipped', 'true');
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error skipping security setup:', error);
      navigation.navigate('Main');
    }
  };

  const handleComplete = async () => {
    try {
      // First, complete the final registration process
      const registrationSuccess = await finalizeRegistration();
      
      if (registrationSuccess) {
        await AsyncStorage.setItem('securitySetupCompleted', 'true');
        navigation.navigate('Main');
      }
      // If registration fails, stay on the screen (error is already shown in finalizeRegistration)
    } catch (error) {
      console.error('Error completing security setup:', error);
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
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
              <MaterialCommunityIcons name="backspace" size={24} color="#333" />
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
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="shield-lock" size={80} color="#4CAF50" />
      </View>
      
      <Text style={styles.title}>Secure Your Account</Text>
      <Text style={styles.description}>
        Set up additional security measures to protect your account and transactions.
      </Text>

      <View style={styles.featuresList}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="numeric" size={24} color="#4CAF50" />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Create PIN</Text>
            <Text style={styles.featureDescription}>
              6-digit PIN for quick and secure access
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="fingerprint" size={24} color="#4CAF50" />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureTitle}>Biometric Authentication</Text>
            <Text style={styles.featureDescription}>
              Use fingerprint or face recognition for instant access
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setCurrentStep('pin')}
      >
        <Text style={styles.primaryButtonText}>Set Up Security</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkipSecurity}
      >
        <Text style={styles.skipButtonText}>Skip for Now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPinStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="numeric" size={60} color="#4CAF50" />
      </View>
      
      <Text style={styles.title}>
        {isCreatingPin ? 'Create Your PIN' : 'Confirm Your PIN'}
      </Text>
      <Text style={styles.description}>
        {isCreatingPin 
          ? 'Choose a 6-digit PIN that you can remember easily'
          : 'Enter your PIN again to confirm'
        }
      </Text>

      {renderPinDots()}
      {renderPinPad()}

      {((isCreatingPin && pin.length === 6) || (!isCreatingPin && confirmPin.length === 6)) && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handlePinSubmit}
        >
          <Text style={styles.primaryButtonText}>
            {isCreatingPin ? 'Continue' : 'Confirm PIN'}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkipSecurity}
      >
        <Text style={styles.skipButtonText}>Skip PIN Setup</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBiometricStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="fingerprint" 
          size={80} 
          color={biometricAvailable ? "#4CAF50" : "#ccc"} 
        />
      </View>
      
      <Text style={styles.title}>
        {biometricAvailable ? 'Enable Biometric Authentication' : 'Biometric Not Available'}
      </Text>
      <Text style={styles.description}>
        {biometricAvailable 
          ? 'Use your fingerprint or face recognition for quick and secure access to your account.'
          : 'Biometric authentication is not available on this device. You can continue with PIN-only security.'
        }
      </Text>

      {biometricAvailable && (
        <View style={styles.biometricBenefits}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Faster login</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>Enhanced security</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="gesture-tap" size={20} color="#4CAF50" />
            <Text style={styles.benefitText}>One-touch access</Text>
          </View>
        </View>
      )}

      {biometricAvailable ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleBiometricSetup(true)}
        >
          <Text style={styles.primaryButtonText}>Enable Biometric</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleBiometricSetup(false)}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      )}

      {biometricAvailable && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleBiometricSetup(false)}
        >
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
      </View>
      
      <Text style={styles.title}>Setup Complete!</Text>
      <Text style={styles.description}>
        Your account is now secured with the following features:
      </Text>

      <View style={styles.completeSummary}>
        {securitySettings.pinEnabled && (
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
            <Text style={styles.summaryText}>6-digit PIN created</Text>
          </View>
        )}
        {securitySettings.biometricEnabled && (
          <View style={styles.summaryItem}>
            <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
            <Text style={styles.summaryText}>Biometric authentication enabled</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isRegistering && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={isRegistering}
      >
        <Text style={styles.primaryButtonText}>
          {isRegistering ? 'Creating Account...' : 'Continue to App'}
        </Text>
      </TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${
                    currentStep === 'intro' ? 25 : 
                    currentStep === 'pin' ? 50 : 
                    currentStep === 'biometric' ? 75 : 100
                  }%` 
                }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
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
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: '#4CAF50',
  },
  pinPadContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width * 0.8,
    marginBottom: 30,
  },
  pinButton: {
    width: (width * 0.8) / 3 - 20,
    height: 60,
    margin: 10,
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
  },
  pinButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  biometricBenefits: {
    width: '100%',
    marginBottom: 40,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
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
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SecuritySetupScreen;