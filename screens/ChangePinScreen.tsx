import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import VerificationCodeInput from '../components/VerificationCodeInput';
import {
  getSecuritySettings,
  verifyPin,
  saveSecuritySettings,
  validatePin,
  changePin,
} from '../utils/authUtils';

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

  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
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
      
      // If PIN is not enabled, skip current PIN verification
      if (!settings.pinEnabled) {
        setStep('new');
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      Alert.alert('Error', 'Failed to load security settings');
    }
  };

  const handleCurrentPinComplete = async (pin: string) => {
    setCurrentPin(pin);
    
    if (!securitySettings.pinEnabled) {
      // If PIN is not enabled, proceed to new PIN
      setStep('new');
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyPin(pin);
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
    // Validate PIN first
    const validation = validatePin(pin);
    if (!validation.isValid) {
      Alert.alert('Invalid PIN', validation.message, [
        { text: 'OK', onPress: () => setNewPin('') }
      ]);
      return;
    }

    setNewPin(pin);
    setStep('confirm');
  };

  const handleConfirmPinComplete = async (pin: string) => {
    setConfirmPin(pin);
    
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
      const result = await changePin(currentPin, pin);
      
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

  const handleBackNavigation = () => {
    if (step === 'current') {
      navigation.goBack();
    } else if (step === 'new') {
      if (securitySettings.pinEnabled) {
        setStep('current');
        setCurrentPin('');
      } else {
        navigation.goBack();
      }
    } else if (step === 'confirm') {
      setStep('new');
      setNewPin('');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'current':
        return 'Enter Current PIN';
      case 'new':
        return securitySettings.pinEnabled ? 'Enter New PIN' : 'Set Your PIN';
      case 'confirm':
        return 'Confirm New PIN';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'current':
        return 'Please enter your current 4-digit PIN';
      case 'new':
        return securitySettings.pinEnabled 
          ? 'Enter your new 4-digit PIN'
          : 'Create a 4-digit PIN for secure access';
      case 'confirm':
        return 'Re-enter your new PIN to confirm';
      default:
        return '';
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

  const handlePinChange = (code: string) => {
    switch (step) {
      case 'current':
        setCurrentPin(code);
        break;
      case 'new':
        setNewPin(code);
        break;
      case 'confirm':
        setConfirmPin(code);
        break;
    }
  };

  const handlePinComplete = (code: string) => {
    switch (step) {
      case 'current':
        handleCurrentPinComplete(code);
        break;
      case 'new':
        handleNewPinComplete(code);
        break;
      case 'confirm':
        handleConfirmPinComplete(code);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/images/bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackNavigation}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>
              {securitySettings.pinEnabled ? 'Change PIN' : 'Set PIN'}
            </Text>
            
            <View style={styles.placeholder} />
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {securitySettings.pinEnabled && (
                <>
                  <View style={styles.stepContainer}>
                    <View style={[
                      styles.stepCircle,
                      step === 'current' && styles.stepCircleActive,
                      (step === 'new' || step === 'confirm') && styles.stepCircleCompleted
                    ]}>
                      <Text style={[
                        styles.stepNumber,
                        (step === 'current' || step === 'new' || step === 'confirm') && styles.stepNumberActive
                      ]}>
                        1
                      </Text>
                    </View>
                    <Text style={styles.stepLabel}>Current PIN</Text>
                  </View>

                  <View style={[styles.stepLine, (step === 'new' || step === 'confirm') && styles.stepLineCompleted]} />
                </>
              )}

              <View style={styles.stepContainer}>
                <View style={[
                  styles.stepCircle,
                  step === 'new' && styles.stepCircleActive,
                  step === 'confirm' && styles.stepCircleCompleted
                ]}>
                  <Text style={[
                    styles.stepNumber,
                    (step === 'new' || step === 'confirm') && styles.stepNumberActive
                  ]}>
                    {securitySettings.pinEnabled ? '2' : '1'}
                  </Text>
                </View>
                <Text style={styles.stepLabel}>New PIN</Text>
              </View>

              <View style={[styles.stepLine, step === 'confirm' && styles.stepLineCompleted]} />

              <View style={styles.stepContainer}>
                <View style={[
                  styles.stepCircle,
                  step === 'confirm' && styles.stepCircleActive
                ]}>
                  <Text style={[
                    styles.stepNumber,
                    step === 'confirm' && styles.stepNumberActive
                  ]}>
                    {securitySettings.pinEnabled ? '3' : '2'}
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Confirm</Text>
              </View>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name="lock-outline" 
                  size={60} 
                  color="#fff" 
                />
              </View>

              <Text style={styles.title}>{getStepTitle()}</Text>
              <Text style={styles.subtitle}>{getStepSubtitle()}</Text>

              {/* PIN Input */}
              <View style={styles.pinInputContainer}>
                <VerificationCodeInput
                  length={4}
                  onCodeComplete={handlePinComplete}
                  onCodeChange={handlePinChange}
                  autoFocus={true}
                  editable={!loading}
                />
              </View>

              {/* Loading State */}
              {loading && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    {step === 'current' ? 'Verifying PIN...' : 'Saving PIN...'}
                  </Text>
                </View>
              )}

              {/* Help Text */}
              <View style={styles.helpContainer}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={16} 
                  color="rgba(255, 255, 255, 0.7)" 
                />
                <Text style={styles.helpText}>
                  Your PIN should be 4 digits and easy for you to remember but hard for others to guess.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepCircleActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepCircleCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  stepLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  content: {
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
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  pinInputContainer: {
    marginVertical: 20,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 30,
    marginHorizontal: 20,
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
});

export default ChangePinScreen;