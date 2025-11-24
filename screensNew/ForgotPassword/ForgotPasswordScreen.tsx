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
  LoginScreenNew: undefined;
  ForgotPasswordScreen: undefined;
  ForgotPasswordEmailScreen: undefined;
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ForgotPasswordScreen'
>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [nicNumber, setNicNumber] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSendResetLink = () => {
    if (nicNumber.length > 0) {
      // Navigate to email confirmation screen
      navigation.navigate('ForgotPasswordEmailScreen');
    }
  };

  const isFormValid = nicNumber.length > 0;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      topTitle="Forgot Password?"
      mainTitle="Enter your NIC number"
      description="Type Your NIC number so We Can verify your account"
      buttonText="Send Password Reset Link"
      onButtonPress={handleSendResetLink}
      buttonDisabled={!isFormValid}
      scrollable={false}
    >
      {/* NIC Number Input */}
      <View style={styles.inputWrapper}>
        {nicNumber === '' && (
          <View style={styles.placeholderContainer} pointerEvents="none">
            <Text style={styles.placeholderText}>NIC Number</Text>
            <Text style={styles.placeholderAsterisk}>*</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder=""
          placeholderTextColor="#9CA3AF"
          value={nicNumber}
          onChangeText={setNicNumber}
          keyboardType="default"
          autoCapitalize="characters"
          maxLength={12}
        />
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
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
});

export default ForgotPasswordScreen;
