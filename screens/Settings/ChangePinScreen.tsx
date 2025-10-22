import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import {
  getSecuritySettings,
  verifyPin,
  validatePin,
  changePin,
} from '../../utils/authUtils';
import CustomButton from '../../components/CustomButton';

type RootStackParamList = {
  Settings: undefined;
  ChangePinScreen: undefined;
};

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  userPin?: string;
}

const ChangePinScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [step, setStep] = useState<'password' | 'current' | 'new' | 'confirm'>('password');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    pinEnabled: false,
    biometricEnabled: false,
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const settings = await getSecuritySettings();
      setSecuritySettings(settings);
    } catch (error) {
      console.error('Error loading security settings:', error);
      Alert.alert('Error', 'Failed to load security settings');
    }
  };

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual backend verification when available
      // const isValid = await verifyPassword(password);
      const isValid = true; // Temporary: accept any password
      
      if (isValid) {
        if (!securitySettings.pinEnabled) {
          setStep('new');
        } else {
          setStep('current');
        }
      } else {
        Alert.alert('Error', 'Incorrect password. Please try again.', [
          { text: 'OK', onPress: () => setPassword('') }
        ]);
      }
    } catch (error) {
      console.error('Password verification error:', error);
      Alert.alert('Error', 'Failed to verify password');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    switch (step) {
      case 'current':
        if (currentPin.length < 6) {
          setCurrentPin(currentPin + digit);
        }
        break;
      case 'new':
        if (newPin.length < 6) {
          setNewPin(newPin + digit);
        }
        break;
      case 'confirm':
        if (confirmPin.length < 6) {
          setConfirmPin(confirmPin + digit);
        }
        break;
    }
  };

  const handlePinDelete = () => {
    switch (step) {
      case 'current':
        setCurrentPin(currentPin.slice(0, -1));
        break;
      case 'new':
        setNewPin(newPin.slice(0, -1));
        break;
      case 'confirm':
        setConfirmPin(confirmPin.slice(0, -1));
        break;
    }
  };

  const handleCurrentPinComplete = async (pin: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual PIN verification when available
      // const isValid = await verifyPin(pin);
      const isValid = true; // Temporary: accept any PIN
      
      if (isValid) {
        setStep('new');
      } else {
        Alert.alert('Error', 'Incorrect PIN. Please try again.', [
          { text: 'OK', onPress: () => setCurrentPin('') }
        ]);
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPinComplete = (pin: string) => {
    // TODO: Replace with actual PIN validation when available
    // const validation = validatePin(pin);
    const validation = { isValid: true, message: '' }; // Temporary: accept any PIN
    
    if (!validation.isValid) {
      Alert.alert('Invalid PIN', validation.message, [
        { text: 'OK', onPress: () => setNewPin('') }
      ]);
      return;
    }

    setStep('confirm');
  };

  const handleConfirmPinComplete = async (pin: string) => {
    if (newPin !== pin) {
      Alert.alert('Error', 'PINs do not match. Please try again.', [
        { text: 'OK', onPress: () => {
          setConfirmPin('');
          setStep('new');
          setNewPin('');
        }}
      ]);
      return;
    }

    await saveNewPin(pin);
  };

  const saveNewPin = async (pin: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual changePin function when available
      // const result = await changePin(currentPin, pin);
      const result = { success: true, message: 'PIN saved successfully' }; // Temporary: always succeed
      
      if (result.success) {
        Alert.alert(
          'Success',
          securitySettings.pinEnabled ? 'PIN changed successfully!' : 'PIN set successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to save PIN. Please try again.');
      }
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (step === 'password') {
      handlePasswordVerification();
    } else {
      const currentPinValue = getCurrentPinValue();
      
      if (currentPinValue.length === 6) {
        switch (step) {
          case 'current':
            handleCurrentPinComplete(currentPinValue);
            break;
          case 'new':
            handleNewPinComplete(currentPinValue);
            break;
          case 'confirm':
            handleConfirmPinComplete(currentPinValue);
            break;
        }
      }
    }
  };

  const handleBackNavigation = () => {
    if (step === 'password') {
      navigation.goBack();
    } else if (step === 'current') {
      setStep('password');
      setPassword('');
    } else if (step === 'new') {
      if (securitySettings.pinEnabled) {
        setStep('current');
        setCurrentPin('');
      } else {
        setStep('password');
        setPassword('');
      }
    } else if (step === 'confirm') {
      setStep('new');
      setNewPin('');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'password':
        return 'Verify Your Password';
      case 'current':
        return 'Enter Current PIN';
      case 'new':
        return securitySettings.pinEnabled ? 'Enter New PIN' : 'Create Your PIN';
      case 'confirm':
        return 'Confirm New PIN';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'password':
        return 'Please enter your account password to continue';
      case 'current':
        return 'Please enter your current 6-digit PIN';
      case 'new':
        return securitySettings.pinEnabled 
          ? 'Enter your new 6-digit PIN'
          : 'Create a 6-digit PIN for secure access';
      case 'confirm':
        return 'Re-enter your new PIN to confirm';
      default:
        return '';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'password':
        return 'lock-closed-outline';
      case 'current':
        return 'keypad-outline';
      case 'new':
        return 'create-outline';
      case 'confirm':
        return 'checkmark-circle-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  const getCurrentPinValue = () => {
    switch (step) {
      case 'current':
        return currentPin;
      case 'new':
        return newPin;
      case 'confirm':
        return confirmPin;
      default:
        return '';
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
            disabled={digit === '' || loading}
            activeOpacity={0.6}
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
    const currentPinValue = getCurrentPinValue();
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

  const renderPasswordInput = () => {
    return (
      <View style={styles.passwordSection}>
        <View style={styles.inputWrapper}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={20}
            color="#9CA3AF"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    if (step === 'password') {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.pinInstructionContainer}>
            <View style={styles.stepIconContainer}>
              <Ionicons 
                name={getStepIcon() as any} 
                size={48} 
                color="#374151" 
                style={styles.stepIcon}
              />
            </View>
            <Text style={styles.stepTitle}>{getStepTitle()}</Text>
            <Text style={styles.stepSubtitle}>{getStepSubtitle()}</Text>
          </View>
          
          {renderPasswordInput()}

          <CustomButton
            title={loading ? 'Verifying...' : 'Continue'}
            onPress={handleSubmit}
            disabled={!password.trim() || loading}
            style={styles.primaryButton}
          />
        </View>
      );
    }

    return (
      <View style={styles.stepContainer}>
        <View style={styles.pinInstructionContainer}>
          <View style={styles.stepIconContainer}>
            <Ionicons 
              name={getStepIcon() as any} 
              size={48} 
              color="#374151" 
              style={styles.stepIcon}
            />
          </View>
          <Text style={styles.stepTitle}>{getStepTitle()}</Text>
          <Text style={styles.stepSubtitle}>{getStepSubtitle()}</Text>
        </View>

        {renderPinDots()}
        {renderPinPad()}

        {getCurrentPinValue().length === 6 && (
          <CustomButton
            title={loading ? 'Processing...' : 'Continue'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.primaryButton}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBackNavigation}
                style={styles.backButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="arrow-back" size={22} color="#666" />
              </TouchableOpacity>

              <View style={styles.titleSection}>
                <Text style={styles.headerTitle}>
                  {securitySettings.pinEnabled ? 'Change PIN' : 'Set PIN'}
                </Text>
              </View>
            </View>

            {/* Content Area */}
            <View style={styles.centeredBox}>
              {renderStepContent()}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  centeredBox: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    flex: 1,
    marginTop: 60,
  },
  header: {
    paddingTop: 52,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 0,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  stepContainer: {
    alignItems: 'center',
  },
  pinInstructionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.light.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  passwordSection: {
    width: '100%',
    marginBottom: 40,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 8,
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
  primaryButton: {
    width: '100%',
  },
  stepIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    opacity: 0.8,
  },
});

export default ChangePinScreen;