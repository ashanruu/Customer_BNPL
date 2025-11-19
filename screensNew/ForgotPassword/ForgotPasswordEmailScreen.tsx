import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  ForgotPasswordScreen: undefined;
  ForgotPasswordEmailScreen: undefined;
  ForgotPasswordOtpScreen: undefined;
};

type ForgotPasswordEmailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ForgotPasswordEmailScreen'
>;

const ForgotPasswordEmailScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordEmailScreenNavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleResendLink = () => {
    // Handle resend logic
    console.log('Resend password reset link');
  };

  const handleCantAccessEmail = () => {
    // Navigate to OTP verification screen
    navigation.navigate('ForgotPasswordOtpScreen');
  };

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
      {/* Gmail Icon */}
      <View style={styles.iconContainer}>
        <Image
          source={require('../../assets/images/Frame 1686552710.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      {/* Email Information */}
      <View style={styles.contentContainer}>
        <Text style={styles.descriptionText}>
          We have sent an email to your
        </Text>
        <Text style={styles.emailText}>yoXXXXit@gmail.com</Text>
      </View>

      {/* Additional Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          If the email hasn't arrived yet, please check your spam folder. Alternatively, you can also request the email again:
        </Text>
      </View>

      {/* Custom Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleResendLink}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Resend Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleCantAccessEmail}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Can't Access Email?</Text>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  icon: {
    width: 240,
    height: 240,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 18,
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
  emailText: {
    fontSize: 18,
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
  instructionsContainer: {
    marginTop: 44,
    paddingHorizontal: 8,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
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
  buttonsContainer: {
    marginTop: 100,
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

export default ForgotPasswordEmailScreen;
