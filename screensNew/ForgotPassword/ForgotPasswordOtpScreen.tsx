import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  ForgotPasswordOtpScreen: undefined;
  ForgotPasswordEmailScreen: undefined;
  RegWithPasswordScreen: undefined;
};

type ForgotPasswordOtpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ForgotPasswordOtpScreen'
>;

const ForgotPasswordOtpScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordOtpScreenNavigationProp>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOtpChange = (text: string, index: number) => {
    // Handle auto-fill from SMS (6 digits at once in first box)
    if (index === 0 && text.length === 6) {
      const otpArray = text.split('');
      setOtp(otpArray);
      inputRefs.current[5]?.focus();
      // Dismiss keyboard after auto-fill
      setTimeout(() => Keyboard.dismiss(), 100);
      return;
    }

    // Handle manual single digit input
    if (text.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move to next input if digit entered
      if (text.length === 1 && index < 5) {
        inputRefs.current[index + 1]?.focus();
      } else if (text.length === 1 && index === 5) {
        // Dismiss keyboard when last digit entered
        Keyboard.dismiss();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMobile = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // Navigate to password reset screen
      navigation.navigate('RegWithPasswordScreen');
    }
  };

  const handleCantAccessMobile = () => {
    // Navigate back to email screen
    navigation.navigate('ForgotPasswordEmailScreen');
  };

  const handleResendOtp = () => {
    // Handle resend OTP logic
    console.log('Resend OTP');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      mainTitle=""
      description=""
      buttonText=""
      onButtonPress={() => {}}
      showButton={false}
      scrollable={false}
    >
      {/* SMS Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/image 119.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>We just sent you an SMS!</Text>
      </View>

      {/* Phone Number Information */}
      <View style={styles.contentContainer}>
        <Text style={styles.descriptionText}>
          Enter the security code we sent to
        </Text>
        <Text style={styles.phoneText}>077 *** *45</Text>
      </View>

      {/* OTP Input Boxes */}
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            style={[
              styles.otpInput,
              digit !== '' && styles.otpInputFilled
            ]}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={index === 0 ? 6 : 1}
            textContentType={index === 0 ? "oneTimeCode" : "none"}
            autoComplete={index === 0 ? "sms-otp" : "off"}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Resend OTP Link */}
      <View style={styles.resendContainer}>
        <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !isOtpComplete && styles.buttonDisabled
          ]}
          onPress={handleVerifyMobile}
          disabled={!isOtpComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Verify Mobile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCantAccessMobile}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Can't Access Mobile?</Text>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    //marginTop: 10,
    marginBottom: 24,
  },
  icon: {
    width: 240,
    height: 240,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
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
  contentContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
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
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
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
  otpInputFilled: {
    borderColor: '#0066CC',
    backgroundColor: '#EFF6FF',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
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
  buttonsContainer: {
    marginTop: 44,
    paddingHorizontal: 0,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '400',
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
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '400',
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

export default ForgotPasswordOtpScreen;
