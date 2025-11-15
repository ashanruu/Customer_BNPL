import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomButton from '../../components/CustomButton';

type RootStackParamList = {
  RegWithMobileNoScreen: undefined;
  RegWithOtpScreen: { mobileNumber: string };
  Login: undefined;
};

type RegWithMobileNoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithMobileNoScreen'
>;

const RegWithMobileNoScreen: React.FC = () => {
  const navigation = useNavigation<RegWithMobileNoScreenNavigationProp>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode] = useState('+94');
  const [imageHeight] = useState(new Animated.Value(380));

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(imageHeight, {
          toValue: 150,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(imageHeight, {
          toValue: 430,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [imageHeight]);

  const handleGetOTP = () => {
    if (mobileNumber.length === 9) {
      navigation.navigate('RegWithOtpScreen', { 
        mobileNumber: countryCode + mobileNumber 
      });
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Country flag icon
  const FlagIcon = () => (
    <View style={styles.flagContainer}>
      <Text style={styles.flagEmoji}>🇱🇰</Text>
      <Text style={styles.countryCodeText}>{countryCode}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Top Section with Image - Animated */}
      <Animated.View style={[styles.topSection, { height: imageHeight }]}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/loginGirl.png')}
            style={styles.image}
          />
        </View>
      </Animated.View>

      {/* Bottom Section with Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomSection}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative Line */}
          <View style={styles.decorativeLine} />
          
          {/* Title */}
          <Text style={styles.title}>Enter your mobile number</Text>
          <Text style={styles.subtitle}>
            We'll send a 6-digit code to verify your number.
          </Text>

          {/* Mobile Number Input */}
          <View style={styles.inputContainer}>
            <View style={styles.flagContainer}>
              <Text style={styles.flagEmoji}>🇱🇰</Text>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </View>
            <View style={{ flex: 1 }}>
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
                maxLength={9}
              />
            </View>
          </View>

          {/* Get OTP Button */}
          <CustomButton
            title="Get OTP"
            onPress={handleGetOTP}
            disabled={mobileNumber.length !== 9}
            variant="primary"
            style={styles.otpButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#DCE9F7',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    width: '110%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    width: '150%',
    height: '130%',
    position: 'absolute',
    top: 0,
    resizeMode: 'cover',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
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
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
    padding: 0,
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
  placeholderContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    left: 0,
    top: 5,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
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
    fontSize: 16,
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
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
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
  otpButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
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
  loginLink: {
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

export default RegWithMobileNoScreen;
