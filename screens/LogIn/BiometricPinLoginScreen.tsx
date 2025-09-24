import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import {
  getSecuritySettings,
  checkBiometricCapability,
  authenticateWithBiometrics,
  verifyPin,
  saveLoginSuccess,
} from '../../utils/authUtils';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  BiometricPinLogin: undefined;
};

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  userPin?: string;
}

const BiometricPinLoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [pin, setPin] = useState('');
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    pinEnabled: false,
    biometricEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);

  useEffect(() => {
    loadSecuritySettings();
    checkBiometricAvailability();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const settings = await getSecuritySettings();
      setSecuritySettings(settings);

      // If neither PIN nor biometric is set up, redirect to regular login
      if (!settings.pinEnabled && !settings.biometricEnabled) {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      navigation.navigate('Login');
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      const capability = await checkBiometricCapability();
      setBiometricAvailable(capability.available);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable || !securitySettings.biometricEnabled) {
      Alert.alert('Error', 'Biometric authentication is not available');
      return;
    }

    setLoading(true);

    try {
      const success = await authenticateWithBiometrics();

      if (success) {
        // Successful biometric authentication
        await handleSuccessfulLogin('biometric');
      } else {
        Alert.alert('Authentication Failed', 'Please try again or use your PIN');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      Alert.alert('Error', 'Please enter your complete PIN');
      return;
    }

    setLoading(true);

    try {
      // Verify PIN against stored PIN
      const isValidPin = await verifyPin(pin);
      
      if (isValidPin) {
        await handleSuccessfulLogin('pin');
      } else {
        Alert.alert('Error', 'Incorrect PIN. Please try again.');
        setPin(''); // Clear PIN on failure
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'PIN verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulLogin = async (method: 'pin' | 'biometric') => {
    try {
      await saveLoginSuccess(method);
      
      // Navigate to main app
      navigation.navigate('Main');
    } catch (error) {
      console.error('Error saving login data:', error);
      // Still navigate even if saving fails
      navigation.navigate('Main');
    }
  };

  const handleFallbackToRegularLogin = () => {
    navigation.navigate('Login');
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
    return (
      <View style={styles.pinDotsContainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  if (showPinEntry || !securitySettings.biometricEnabled || !biometricAvailable) {
    // Show PIN entry screen
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/bg.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setShowPinEntry(false)}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.content}>
              <View style={styles.header}>
                <MaterialCommunityIcons name="lock" size={60} color="#fff" />
                <Text style={styles.title}>Enter Your PIN</Text>
                <Text style={styles.subtitle}>
                  Enter your 6-digit PIN to access your account
                </Text>
              </View>

              <View style={styles.pinSection}>
                {renderPinDots()}
                {renderPinPad()}

                {pin.length === 6 && (
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handlePinSubmit}
                    disabled={loading}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Verifying...' : 'Verify PIN'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={styles.fallbackButton}
                onPress={handleFallbackToRegularLogin}
              >
                <Text style={styles.fallbackButtonText}>
                  Use Email & Password Instead
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  // Show biometric login screen
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleFallbackToRegularLogin}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="fingerprint" size={80} color="#fff" />
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in with your fingerprint or face recognition
              </Text>
            </View>

            <View style={styles.authOptionsContainer}>
              {/* Biometric Button */}
              {securitySettings.biometricEnabled && biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="fingerprint" size={32} color="#fff" />
                  <Text style={styles.biometricButtonText}>
                    {loading ? 'Authenticating...' : 'Use Biometric'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* PIN Button */}
              {securitySettings.pinEnabled && (
                <TouchableOpacity
                  style={styles.pinOptionButton}
                  onPress={() => setShowPinEntry(true)}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="numeric" size={32} color="#4CAF50" />
                  <Text style={styles.pinOptionButtonText}>Use PIN Instead</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.fallbackButton}
              onPress={handleFallbackToRegularLogin}
            >
              <Text style={styles.fallbackButtonText}>
                Use Email & Password Instead
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  authOptionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  biometricButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
    justifyContent: 'center',
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  pinOptionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 180,
    justifyContent: 'center',
  },
  pinOptionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  pinSection: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  pinDotFilled: {
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pinButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  fallbackButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default BiometricPinLoginScreen;