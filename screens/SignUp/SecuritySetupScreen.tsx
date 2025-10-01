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
  Dimensions,
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

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define breakpoints
const isSmallScreen = screenWidth < 380;
const isMediumScreen = screenWidth >= 380 && screenWidth < 768;
const isLargeScreen = screenWidth >= 768;

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    // Check if biometric authentication is available
    checkBiometricAvailability();

    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription?.remove();
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
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
      if (pin.length < 4) {
        setPin(pin + digit);
      }
    } else {
      if (confirmPin.length < 4) {
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
    if (isCreatingPin && pin.length === 4) {
      setIsCreatingPin(false);
    } else if (!isCreatingPin && confirmPin.length === 4) {
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

  // Get responsive styles
  const getResponsiveStyles = () => {
    const currentWidth = screenData.width;
    const currentHeight = screenData.height;
    const isCurrentSmall = currentWidth < 380;
    const isCurrentMedium = currentWidth >= 380 && currentWidth < 768;
    
    return {
      pinButtonSize: isCurrentSmall ? 50 : isCurrentMedium ? 60 : 70,
      pinPadWidth: isCurrentSmall ? 200 : isCurrentMedium ? 250 : 300,
      iconSize: isCurrentSmall ? 60 : isCurrentMedium ? 80 : 100,
      horizontalPadding: isCurrentSmall ? 16 : isCurrentMedium ? 20 : 24,
      verticalSpacing: isCurrentSmall ? 20 : isCurrentMedium ? 30 : 40,
      buttonSpacing: isCurrentSmall ? 8 : 12,
      isShortScreen: currentHeight < 700,
    };
  };

  const renderPinPad = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];
    const responsiveStyles = getResponsiveStyles();

    return (
      <View style={[
        styles.pinPadContainer,
        { 
          width: responsiveStyles.pinPadWidth,
          marginBottom: responsiveStyles.isShortScreen ? 15 : 20,
        }
      ]}>
        {digits.map((digit, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pinButton,
              {
                width: responsiveStyles.pinButtonSize,
                height: responsiveStyles.pinButtonSize,
                borderRadius: responsiveStyles.pinButtonSize / 2,
                marginVertical: responsiveStyles.isShortScreen ? 6 : 8,
              },
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
              <MaterialCommunityIcons 
                name="backspace" 
                size={responsiveStyles.pinButtonSize * 0.4} 
                color="#374151" 
              />
            ) : digit !== '' ? (
              <Text style={[
                styles.pinButtonText,
                { fontSize: responsiveStyles.pinButtonSize * 0.37 }
              ]}>
                {digit}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPinDots = () => {
    const currentPinValue = isCreatingPin ? pin : confirmPin;
    const responsiveStyles = getResponsiveStyles();
    
    return (
      <View style={[
        styles.pinDotsContainer,
        { marginBottom: responsiveStyles.isShortScreen ? 20 : 30 }
      ]}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              {
                width: responsiveStyles.isShortScreen ? 14 : 16,
                height: responsiveStyles.isShortScreen ? 14 : 16,
                borderRadius: responsiveStyles.isShortScreen ? 7 : 8,
                marginHorizontal: responsiveStyles.isShortScreen ? 6 : 8,
              },
              index < currentPinValue.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderIntroStep = () => {
    const responsiveStyles = getResponsiveStyles();
    
    return (
      <View style={styles.stepContainer}>
        <View style={[
          styles.featuresList,
          { marginBottom: responsiveStyles.verticalSpacing }
        ]}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons 
              name="lock" 
              size={isSmallScreen ? 20 : 24} 
              color="#374151" 
            />
            <View style={styles.featureTextContainer}>
              <MainText weight="medium" align="left">
                Create PIN
              </MainText>
              <SubText  align="left">
                4-digit PIN for quick and secure access
              </SubText>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons 
              name="fingerprint" 
              size={isSmallScreen ? 20 : 24} 
              color="#374151" 
            />
            <View style={styles.featureTextContainer}>
              <MainText weight="medium" align="left">
                Biometric Authentication
              </MainText>
              <SubText align="left">
                Use fingerprint or face recognition for instant access
              </SubText>
            </View>
          </View>
        </View>

        <CustomButton
          title={isRegistering ? 'Creating Account...' : 'Set Up Security'}
          onPress={handleSetupSecurity}
          loading={isRegistering}
          style={{ ...styles.primaryButton, marginBottom: responsiveStyles.buttonSpacing }}
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
  };

  const renderPinStep = () => {
    const responsiveStyles = getResponsiveStyles();
    
    return (
      <View style={styles.stepContainer}>
        <View style={[
          styles.pinInstructionContainer,
          { marginBottom: responsiveStyles.isShortScreen ? 20 : 30 }
        ]}>
          <MainText size={isSmallScreen ? "small" : "medium"} weight="medium" align="center">
            {isCreatingPin ? 'Enter your 4-digit PIN' : 'Confirm your PIN'}
          </MainText>
        </View>

        {renderPinDots()}
        {renderPinPad()}

        {((isCreatingPin && pin.length === 4) || (!isCreatingPin && confirmPin.length === 4)) && (
          <CustomButton
            title={isCreatingPin ? 'Continue' : 'Confirm PIN'}
            onPress={handlePinSubmit}
            style={{ ...styles.primaryButton, marginBottom: responsiveStyles.buttonSpacing }}
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
  };

  const renderBiometricStep = () => {
    const responsiveStyles = getResponsiveStyles();
    
    return (
      <View style={styles.stepContainer}>
        {biometricAvailable && (
          <View style={[
            styles.biometricBenefits,
            { 
              width: isSmallScreen ? '90%' : '70%',
              marginBottom: responsiveStyles.verticalSpacing 
            }
          ]}>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons 
                name="lightning-bolt" 
                size={isSmallScreen ? 18 : 20} 
                color="#374151" 
              />
              <SubText 
                size={isSmallScreen ? "small" : "medium"} 
                style={styles.benefitText}
              >
                Faster login
              </SubText>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons 
                name="shield-check" 
                size={isSmallScreen ? 18 : 20} 
                color="#374151" 
              />
              <SubText 
                size={isSmallScreen ? "small" : "medium"} 
                style={styles.benefitText}
              >
                Enhanced security
              </SubText>
            </View>
            <View style={styles.benefitItem}>
              <MaterialCommunityIcons 
                name="gesture-tap" 
                size={isSmallScreen ? 18 : 20} 
                color="#374151" 
              />
              <SubText 
                size={isSmallScreen ? "small" : "medium"} 
                style={styles.benefitText}
              >
                One-touch access
              </SubText>
            </View>
          </View>
        )}

        <CustomButton
          title={biometricAvailable ? 'Enable Biometric' : 'Continue'}
          onPress={() => handleBiometricSetup(biometricAvailable)}
          style={{
            ...styles.primaryButton,
            marginBottom: responsiveStyles.buttonSpacing
          }}
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
  };

  const renderCompleteStep = () => {
    const responsiveStyles = getResponsiveStyles();
    
    return (
      <View style={styles.stepContainer}>
        <View style={[
          styles.iconContainer,
          { marginBottom: responsiveStyles.isShortScreen ? 20 : 30 }
        ]}>
          <MaterialCommunityIcons 
            name="check-circle" 
            size={responsiveStyles.iconSize} 
            color="#10B981" 
          />
        </View>

        <MainText size={isSmallScreen ? "large" : "xlarge"} weight="bold" align="center">
          Setup Complete!
        </MainText>
        <SubText 
          size={isSmallScreen ? "small" : "medium"} 
          align="center" 
          style={{
            ...styles.description,
            marginBottom: responsiveStyles.verticalSpacing,
            paddingHorizontal: isSmallScreen ? 10 : 20,
          }}
        >
          Your account is now secured with the following features:
        </SubText>

        <View style={[
          styles.completeSummary,
          { marginBottom: responsiveStyles.verticalSpacing }
        ]}>
          {securitySettings.pinEnabled && (
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons 
                name="check" 
                size={isSmallScreen ? 18 : 20} 
                color="#10B981" 
              />
              <SubText 
                size={isSmallScreen ? "small" : "medium"} 
                align="left" 
                style={styles.summaryText}
              >
                4-digit PIN created
              </SubText>
            </View>
          )}
          {securitySettings.biometricEnabled && (
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons 
                name="check" 
                size={isSmallScreen ? 18 : 20} 
                color="#10B981" 
              />
              <SubText 
                size={isSmallScreen ? "small" : "medium"} 
                align="left" 
                style={styles.summaryText}
              >
                Biometric authentication enabled
              </SubText>
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
  };

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
          subtitle: 'Set up a 4-digit PIN for secure access'
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

  const responsiveStyles = getResponsiveStyles();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[
            styles.contentWrapper, 
            { 
              paddingHorizontal: responsiveStyles.horizontalPadding,
              paddingBottom: keyboardHeight > 0 ? keyboardHeight / 3 : 20 
            }
          ]}>
            {/* Back Button */}
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  width: isSmallScreen ? 32 : 36,
                  height: isSmallScreen ? 32 : 36,
                  borderRadius: isSmallScreen ? 16 : 18,
                }
              ]}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={isSmallScreen ? 18 : 20}
                color="#374151"
              />
            </TouchableOpacity>

            {/* Dynamic Header */}
            <View style={[
              styles.header,
              { 
                marginTop: responsiveStyles.isShortScreen ? 20 : 30,
                marginBottom: responsiveStyles.isShortScreen ? 15 : 20,
              }
            ]}>
              <MainText 
                size={isSmallScreen ? "large" : "xlarge"} 
                weight="bold" 
                align="left"
              >
                {getHeaderContent().title}
              </MainText>
              <SubText 
                size={isSmallScreen ? "small" : "medium"} 
                align="left" 
                style={styles.subtitle}
              >
                {getHeaderContent().subtitle}
              </SubText>
            </View>

            {/* Step Indicator */}
            <View style={[
              styles.stepIndicatorWrapper,
              { 
                width: isSmallScreen ? '90%' : '80%',
                marginBottom: responsiveStyles.isShortScreen ? 5 : 10,
              }
            ]}>
              <StepIndicator currentStep={5} />
            </View>

            {/* Content */}
            <View style={[
              styles.centeredBox,
              { maxWidth: isLargeScreen ? 500 : 400 }
            ]}>
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
    paddingTop: 16,
  },
  centeredBox: {
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    alignSelf: 'stretch',
  },
  subtitle: {
    color: Colors.light.mutedText,
    marginTop: 4,
  },
  stepIndicatorWrapper: {
    maxWidth: 400,
    alignSelf: 'center',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    alignItems: 'center',
  },
  description: {
    color: Colors.light.mutedText,
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: screenHeight < 700 ? 12 : 16,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: screenHeight < 700 ? 8 : 12,
  },
  featureTextContainer: {
    marginLeft: isSmallScreen ? 12 : 16,
    flex: 1,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    backgroundColor: '#E0E0E0',
  },
  pinDotFilled: {
    backgroundColor: '#374151',
  },
  pinPadContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  pinButton: {
    marginHorizontal: 5,
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
    fontWeight: '600',
    color: '#374151',
  },
  biometricBenefits: {
    alignItems: 'stretch',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight < 700 ? 12 : 16,
    paddingHorizontal: isSmallScreen ? 16 : 20,
  },
  benefitText: {
    marginLeft: isSmallScreen ? 10 : 12,
    flex: 1,
  },
  completeSummary: {
    width: '100%',
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    padding: isSmallScreen ? 16 : 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    marginLeft: isSmallScreen ? 10 : 12,
    flex: 1,
  },
  primaryButton: {
    marginTop: 12,
    width: '100%',
  },
  pinInstructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default SecuritySetupScreen;