import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  RegWithEmailScreen: undefined;
  RegWithEmailOtpScreen: { gmail: string };
};

type RegWithEmailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithEmailScreen'
>;

const RegWithEmailScreen: React.FC = () => {
  const navigation = useNavigation<RegWithEmailScreenNavigationProp>();
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    if (email.length > 0) {
      // Navigate to next screen
      navigation.navigate('RegWithEmailOtpScreen', { gmail: email });
    }
  };

  const handleSkip = () => {
    // Skip Face ID setup
    //navigation.navigate('');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isEmailValid = email.length > 0;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={true}
      onSkipPress={handleSkip}
      skipButtonText="Skip"
      topTitle="Almost there..."
      mainTitle="Add Your Email"
      description="Secure your account with an extra layer of protection & enable two-step verification."
      buttonText="Verify Email"
      onButtonPress={handleContinue}
      buttonDisabled={!isEmailValid}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* Email Input */}
        <View style={styles.inputWrapper}>
          {email === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Email Address</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={email}
            onChangeText={setEmail}
            keyboardType="default"
            autoCapitalize="none"
            maxLength={200}
          />
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
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
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
    color: '#4B5563',
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
});

export default RegWithEmailScreen;
