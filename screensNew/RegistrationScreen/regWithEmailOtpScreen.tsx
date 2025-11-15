import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  RegWithEmailOtpScreen: { gmail?: string };
  RegWithLoginScreen: undefined;
};

type RegWithEmailOtpScreenRouteProp = RouteProp<RootStackParamList, 'RegWithEmailOtpScreen'>;
type RegWithEmailOtpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithEmailOtpScreen'
>;

const RegWithEmailOtpScreen: React.FC = () => {
  const navigation = useNavigation<RegWithEmailOtpScreenNavigationProp>();
  const route = useRoute<RegWithEmailOtpScreenRouteProp>();
  const gmail = route.params?.gmail || 'your email';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Timer for resend OTP
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or last input
      const lastFilledIndex = Math.min(index + pastedOtp.length, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    // Single digit input
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      // Resend OTP logic here
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    // const otpCode = otp.join('');
    // if (otpCode.length === 6) {
    //   // Verify OTP logic here
    //   navigation.navigate('Dashboard');
    // }
    navigation.navigate('RegWithLoginScreen');
  };

  const handleSkip = () => {
    // Skip Face ID setup
    //navigation.navigate('');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={true}
      onSkipPress={handleSkip}
      skipButtonText="Skip"
      topTitle="Verify your email address"
      mainTitle="Enter your OTP"
      description={`Hi, we have sent an OTP to ${gmail}`}
      buttonText="Verify OTP"
      onButtonPress={handleVerifyOtp}
      buttonDisabled={!isOtpComplete}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit !== '' && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              Resend OTP in {resendTimer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  otpInputFilled: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F7FF',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendTimer: {
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
  resendLink: {
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

export default RegWithEmailOtpScreen;
