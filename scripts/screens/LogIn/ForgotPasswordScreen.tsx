import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import CustomNotification from '../../components/CustomNotification';
import { useNotification } from '../../components/useNotification';
import { Colors } from '../../constants/Colors';
import { forgotPassword } from '../../scripts/api';

const ForgotPasswordScreen: React.FC = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    } else if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    } else {
      setEmailError('');
    }

    setIsLoading(true);

    try {
      const response = await forgotPassword(email.trim());

      console.log('Forgot password response:', response);
      
      if (response.statusCode === 200 || response.success) {
        showSuccess('OTP sent to your email!');
        setTimeout(() => {
          navigation.navigate('ForgotPasswordOtp', { 
            email: email.trim(),
            otpReferenceNum: response.payload?.otpReferenceNum || response.otpReferenceNum
          });
        }, 1500);
      } else {
        showError(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to send OTP. Please try again.';
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

      <View style={styles.contentWrapper}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <MainText size="xlarge" weight="bold" align="left">
            Forgot Password?
          </MainText>
          <SubText size="medium" align="left" style={styles.subtitle}>
            Enter your registered email address here.
          </SubText>
        </View>

        {/* Form Box */}
        <View style={styles.centeredBox}>
          <View style={styles.form}>
            <CustomInputField
              placeholder="Enter your email address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              iconName="email-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <CustomButton
              title={isLoading ? "Sending..." : "Send OTP"}
              onPress={handleForgotPassword}
              loading={isLoading}
              style={styles.sendButton}
            />

            <View style={styles.backToLoginRow}>
              <SubText size="small" style={styles.mutedText}>
                Remember your password?{' '}
              </SubText>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <SubText size="small" style={styles.linkText}>
                  Back to Login
                </SubText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
    marginTop: 50,
    marginBottom: 40,
  },
  subtitle: {
    color: Colors.light.mutedText,
  },
  form: {
    width: '100%',
  },
  sendButton: {
    marginTop: 16,
  },
  backToLoginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  mutedText: {
    color: Colors.light.mutedText,
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});