import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  LoginScreen: undefined;
  ForgotPasswordScreen: undefined;
  RegisterScreen: undefined;
  DashboardScreen: undefined;
  LanguageSelectScreen: undefined;
  BiometricLoginScreen: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (mobileNumber.length > 0 && password.length > 0) {
      // Handle login logic
      navigation.navigate('DashboardScreen');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPasswordScreen');
  };

  const handleBiometricLogin = () => {
    navigation.navigate('BiometricLoginScreen');
  };

  const handleRegister = () => {
    navigation.navigate('LanguageSelectScreen');
  };

  const isFormValid = mobileNumber.length > 0 && password.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
        </View>

        {/* Mobile Number Input */}
        <View style={styles.inputWrapper}>
          {mobileNumber === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Mobile Number</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#9CA3AF"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          {password === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Password</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder=""
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            !isFormValid && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Biometric Login Button */}
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          activeOpacity={0.8}
        >
          <Icon
            name="fingerprint"
            size={24}
            color="#0066CC"
            style={styles.biometricIcon}
          />
          <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop:180,
    marginBottom: 180,
  },
  logo: {
    width: 180,
    height: 60,
  },
  welcomeContainer: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: '400',
    color: '#111827',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 15,
    padding: 4,
  },
  placeholderContainer: {
    position: 'absolute',
    left: 20,
    top: 19,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  placeholderAsterisk: {
    fontSize: 15,
    fontWeight: '400',
    color: '#EF4444',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonDisabled: {
    backgroundColor: '#0066CC',
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  biometricButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});

export default LoginScreen;
