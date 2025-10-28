import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ImageBackground,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainText, SubText, LinkText } from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import CustomNotification from '../../components/CustomNotification';
import { useNotification } from '../../components/useNotification';
import { Colors } from '../../constants/Colors';
import { callAuthApi } from '../../scripts/api';

const LoginScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSecuritySetup, setHasSecuritySetup] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const { notification, showError, hideNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    checkSecuritySetup();

    // Disable swipe back gesture
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  // Prevent hardware back button navigation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show confirmation dialog when user tries to go back
        Alert.alert(
          t('dialogs.exitApp'),
          t('dialogs.exitAppMessage'),
          [
            {
              text: t('common.cancel'),
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: t('dialogs.exit'),
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return true; // Prevent default back action
      };

      // Add event listener for hardware back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function
      return () => backHandler.remove();
    }, [])
  );

  const checkSecuritySetup = async () => {
    try {
      const [pinEnabled, biometricEnabled] = await Promise.all([
        AsyncStorage.getItem('pinEnabled'),
        AsyncStorage.getItem('biometricEnabled'),
      ]);

      // Check if user has any security setup
      const hasAnySecuritySetup = pinEnabled === 'true' || biometricEnabled === 'true';
      setHasSecuritySetup(hasAnySecuritySetup);
    } catch (error) {
      console.error('Error checking security setup:', error);
    }
  };

  const scrollToInput = (inputRef: React.RefObject<TextInput | null>) => {
    if (inputRef.current && scrollViewRef.current) {
      inputRef.current.measureInWindow((x, y, width, height) => {
        // Only scroll within the form container, not the entire screen
        const scrollToY = Math.max(0, y - 300); // Adjust this value as needed
        scrollViewRef.current?.scrollTo({
          y: scrollToY,
          animated: true,
        });
      });
    }
  };

  const handleLogin = async () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError(t('auth.emailRequired'));
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError(t('auth.passwordRequired'));
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const payload = {
        identifier: email.trim(),
        password: password.trim(),
        userType: 2
      };

      const response = await callAuthApi('LoginUser', payload);

      console.log('Login response:', response);

      // Handle successful login
      if (response.statusCode === 200) {
        // Save the token to AsyncStorage if present
        if (response.payload && response.payload.token) {
          try {
            await AsyncStorage.setItem('bearerToken', response.payload.token);
            console.log('Login token saved successfully');
          } catch (storageError) {
            console.error('Failed to save login token:', storageError);
          }
        }

        // Navigate immediately without showing success notification
        navigation.navigate('Main');
      } else {
        showError(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract the server error message
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Only show notification for errors */}
      <CustomNotification
        message={notification.message}
        type={notification.type}
        visible={notification.visible && notification.type === 'error'}
        duration={notification.duration}
        onHide={hideNotification}
      />

      {/* Fixed Welcome Section - Always Visible */}
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.topBackground}
        resizeMode="cover"
      >
        {/* Dark blue overlay */}
        <View style={styles.overlayContainer}>
          <View style={styles.logoContainer}>
            <MainText size="xlarge" weight="bold" align="center" color="#fff">
              {t('auth.welcome')}
            </MainText>
            <SubText size="medium" align="center" color="#eee" style={{ marginTop: 0 }}>
              {t('auth.welcomeSubtitle')}
            </SubText>
          </View>
        </View>
      </ImageBackground>

      {/* Scrollable Form Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            <View style={styles.formContainer}>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                placeholder={t('common.email')}
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                onFocus={() => {
                  setTimeout(() => scrollToInput(emailInputRef), 100);
                }}
              />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder={t('common.password')}
                placeholderTextColor="#aaa"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => {
                  setTimeout(() => scrollToInput(passwordInputRef), 100);
                }}
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <LinkText
                  style={{ fontSize: 14, color: Colors.light.primary }}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  {t('auth.forgotPassword')}
                </LinkText>
              </TouchableOpacity>

              <CustomButton
                title={isLoading ? t('auth.loggingIn') : t('common.login')}
                onPress={handleLogin}
                disabled={isLoading}
              />

              {/* Biometric/PIN Login Option */}
              {hasSecuritySetup && (
                <TouchableOpacity
                  style={styles.biometricLoginButton}
                  onPress={() => navigation.navigate('BiometricPinLogin')}
                >
                  <MaterialCommunityIcons name="fingerprint" size={20} />
                  <Text style={styles.biometricLoginText}>{t('auth.loginWithBiometric')}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.registerRow}>
                <SubText size="small" style={styles.mutedText}>
                  {t('auth.dontHaveAccount')}{' '}
                </SubText>
                <LinkText
                  size="small"
                  style={{ fontSize: 14, color: Colors.light.primary}}
                  onPress={() => navigation.navigate('GetStarted')}
                >
                  {t('common.signup')}
                </LinkText>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBackground: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 80,
    overflow: 'hidden',
    paddingTop: 20,
    position: 'relative',
    // Add shadow to the entire background
    shadowColor: '#0a0c29ff', // Dark blue shadow
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15, // For Android
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 35, 126, 0.2)', // Dark blue overlay with transparency
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 20,
    right: 50,
    paddingTop: 150,
    // Add shadow to text container
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  scrollView: {
    marginTop: 20,
    backgroundColor: Colors.light.background,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 20, // Reduced top margin
    paddingBottom: 100,
    minHeight: 400,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 20,
    color: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 20,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  mutedText: {
    color: Colors.light.mutedText,
    fontSize: 14
  },
  biometricLoginButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  biometricLoginText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});