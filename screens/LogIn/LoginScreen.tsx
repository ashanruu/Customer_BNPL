import React, { useState, useRef } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  
  const scrollViewRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  const { notification, showSuccess, showError, hideNotification } = useNotification();

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
      setEmailError('Email is required');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
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

        showSuccess('Login successful!');
        setTimeout(() => {
          navigation.navigate('LogInOtp');
        }, 1500);
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
      <CustomNotification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        duration={notification.duration}
        onHide={hideNotification}
      />
      
      {/* Fixed Welcome Section - Always Visible */}
      <ImageBackground
        source={require('../../assets/images/bg.jpg')}
        style={styles.topBackground}
        resizeMode="cover"
      >
        <View style={styles.logoContainer}>
          <MainText size="xlarge" weight="bold" align="center" color="#fff">
            Welcome Back
          </MainText>
          <SubText size="medium" align="center" color="#eee" style={{ marginTop: 0 }}>
            Hello there, sign in to continue!
          </SubText>
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
                placeholder="Enter your email here" 
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
                placeholder="Password"
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
                  style={{ fontSize: 14 }}
                  onPress={() => Alert.alert('Forgot Password')}
                >
                  Forgot Password?
                </LinkText>
              </TouchableOpacity>

              <CustomButton 
                title={isLoading ? "Logging in..." : "Login"} 
                onPress={handleLogin} 
                disabled={isLoading}
              />

              <View style={styles.registerRow}>
                <SubText size="small" style={styles.mutedText}>
                  Don't have an account?{' '}
                </SubText>
                <LinkText
                  size="small"
                  style={{ fontSize: 14 }}
                  onPress={() => navigation.navigate('GetStarted')}
                >
                  Sign up
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
    height: 250, // Reduced height to ensure it fits above keyboard
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 80,
    overflow: 'hidden',
    paddingTop: 20,
    position: 'relative', // Ensures it stays in place
  },
  logoContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 20,
    right: 50,
    paddingTop: 150, // Adjusted for new height
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
});