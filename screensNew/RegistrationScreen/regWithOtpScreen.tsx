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
import { callAuthApi } from '../../scripts/api';

type RootStackParamList = {
  RegWithOtpScreen: { mobileNumber: string };
  RegWithMobileNoScreen: undefined;
  RegWithNicScreen: {mobileNumber: string};
};

type RegWithOtpScreenRouteProp = RouteProp<RootStackParamList, 'RegWithOtpScreen'>;
type RegWithOtpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithOtpScreen'
>;

const RegWithOtpScreen: React.FC = () => {
  const navigation = useNavigation<RegWithOtpScreenNavigationProp>();
  const route = useRoute<RegWithOtpScreenRouteProp>();
  const { mobileNumber } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false); // default false
  const inputRefs = useRef<(TextInput | null)[]>([]);

   // Format phone number for display (show actual number)
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '+94 xxx xxxx xxx';
        
        // Show first 3 and last 3 digits for security
        if (phone.length >= 6) {
            const first = phone.substring(0, 3);
            const last = phone.substring(phone.length - 3);
            const middle = 'x'.repeat(phone.length - 6);
            return `${first} ${middle} ${last}`;
        }
        return `+94 ${phone}`;
    };


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

  const handleVerifyOtp = async () => {
    if (!otp.every((digit) => digit !== '')) {
      console.log('Please enter the complete OTP');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        phone: mobileNumber,
        otp: otp.join(''),
      };

      const response = await callAuthApi(
        'VerifyMobileOtp',
        payload,
      );

      console.log('OTP Verification response:', response);

      if (response.statusCode === 200) {
        setTimeout(() => {
          navigation.navigate('RegWithNicScreen', { 
            mobileNumber: mobileNumber 
          });
        }, 1500);
      } else {
        // Show error to user
        console.log("OTP verification failed");
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={false}
      topTitle="Verify your mobile number"
      mainTitle="Enter your OTP"
      description={`Hi, we have sent an OTP to ${formatPhoneNumber(mobileNumber)}`}
      buttonText="Verify OTP"
      onButtonPress={handleVerifyOtp}
      buttonDisabled={!isOtpComplete || loading}
      buttonLoading={loading}
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

export default RegWithOtpScreen;
