import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  ForgotPinScreen: undefined;
  PinLoginScreen: undefined;
  LoginScreenNew: undefined;
  EnterNewPinScreen: undefined;
};

type ForgotPinScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ForgotPinScreen'
>;

const ForgotPinScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPinScreenNavigationProp>();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSetNewPin = () => {
    if (password.trim()) {
      // Validate password and proceed to PIN reset
      console.log('Setting new PIN with password:', password);
      // Navigate to PIN setup screen
      navigation.navigate('EnterNewPinScreen');
    }
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password flow
    console.log('Forgot password');
  };

  const isButtonDisabled = password.trim().length === 0;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      topTitle="Forgot PIN?"
      mainTitle="Let's Reset Your PIN"
      description="You can easily reset it using your account password."
      buttonText="Set New PIN"
      onButtonPress={handleSetNewPin}
      buttonDisabled={isButtonDisabled}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity
            onPress={handleForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password</Text>
          </TouchableOpacity>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006DB9',
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

export default ForgotPinScreen;
