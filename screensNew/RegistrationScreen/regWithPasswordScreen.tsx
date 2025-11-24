import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {callAuthApi,callMobileApi} from '../../scripts/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  RegWithPasswordScreen: { mobileNumber: string; nicNumber: string; firstName: string; lastName: string; dateOfBirth: string; province: string; district: string; city: string; streetAddress1: string; streetAddress2: string };
  RegWithPinScreen: undefined;
}

type RegWithPasswordNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithPasswordScreen'
>;

const RegWithPasswordScreen: React.FC = () => {
  const navigation = useNavigation<RegWithPasswordNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegWithPasswordScreen'>>();
   
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);

  // Password validation checks
  const isLengthValid = password.length >= 8 && password.length <= 20;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const isFormValid = isLengthValid && hasUpperCase && hasNumber && hasSpecialChar && passwordsMatch;

  const handleNext = async () => {
      if (isFormValid) {
       setIsRegistering(true);
  
      try {
        console.log('Starting final registration process...');
  
        // Prepare RegisterUser payload
        const registerPayload = {
          firstName: route.params.firstName,
          lastName: route.params.lastName,
          phoneNumber: route.params.mobileNumber,
          nic: route.params.nicNumber,
          bod : route.params.dateOfBirth,
          district: route.params.district,
          password: password,
          email:"shcbssdu@gmail.com", //for testing
          userType: 2
        };
  
        console.log('Calling RegisterUser API...');
        const registerResponse = await callAuthApi('RegisterUser', registerPayload);
        console.log('RegisterUser response:', registerResponse);
  
        if (registerResponse.statusCode !== 200) {
          throw new Error(registerResponse.message || 'User registration failed');
        }
  
        // Save the token to AsyncStorage
        if (registerResponse.payload && registerResponse.payload.token) {
          try {
            await AsyncStorage.setItem('bearerToken', registerResponse.payload.token);
            console.log('Token saved successfully');
          } catch (storageError) {
            console.error('Failed to save token:', storageError);
          }
        }
  
        // Prepare CreateCustomer payload
        const customerPayload = {
          firstName: route.params.firstName,
          lastName: route.params.lastName,
          address: route.params.streetAddress1,
          addressOptional: route.params.streetAddress2 || null,
          city: route.params.city,
          state: route.params.province,
          phoneNumber: route.params.mobileNumber,
          dob : route.params.dateOfBirth,
          salary: 0,
        };
  
        console.log('Calling CreateCustomer API...');
        const customerResponse = await callMobileApi(
          'CreateCustomer',
          customerPayload,
          'mobile-app-create-customer',
          '',
          'customer'
        );
        console.log('CreateCustomer response:', customerResponse);
  
        if (customerResponse.statusCode !== 200) {
          throw new Error(customerResponse.message || 'Customer creation failed');
        }
  
        console.log('Registration completed successfully!');
        return true;
  
      } catch (error: any) {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'Registration failed. Please try again.';
        Alert.alert('Registration Error', errorMessage);
        return false;
      } finally {
        setIsRegistering(false);
      }
    };
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={false}
      topTitle="Create and Confirm your"
      mainTitle="Strong Password"
      description="Use at least 8 characters with a mix of letters and numbers."
      buttonText="Next"
      onButtonPress={handleNext}
      buttonDisabled={!isFormValid}
      scrollable={true}
    >
      <View style={styles.contentContainer}>
        {/* Password Input */}
        <View style={styles.inputWrapper}>
          {password === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Password</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputWrapper}>
          {confirmPassword === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Re-enter Password</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Icon
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Your password must be</Text>

          {/* Length Check */}
          <View style={styles.requirementItem}>
            <View style={[
              styles.checkCircle,
              isLengthValid && styles.checkCircleValid
            ]}>
              {isLengthValid && <View style={styles.checkMark} />}
            </View>
            <Text style={[
              styles.requirementText,
              isLengthValid && styles.requirementTextValid
            ]}>
              Between 8 and 20 characters
            </Text>
          </View>

          {/* Upper Case Check */}
          <View style={styles.requirementItem}>
            <View style={[
              styles.checkCircle,
              hasUpperCase && styles.checkCircleValid
            ]}>
              {hasUpperCase && <View style={styles.checkMark} />}
            </View>
            <Text style={[
              styles.requirementText,
              hasUpperCase && styles.requirementTextValid
            ]}>
              1 Upper case letter
            </Text>
          </View>

          {/* Number Check */}
          <View style={styles.requirementItem}>
            <View style={[
              styles.checkCircle,
              hasNumber && styles.checkCircleValid
            ]}>
              {hasNumber && <View style={styles.checkMark} />}
            </View>
            <Text style={[
              styles.requirementText,
              hasNumber && styles.requirementTextValid
            ]}>
              1 or more number
            </Text>
          </View>

          {/* Special Character Check */}
          <View style={styles.requirementItem}>
            <View style={[
              styles.checkCircle,
              hasSpecialChar && styles.checkCircleValid
            ]}>
              {hasSpecialChar && <View style={styles.checkMark} />}
            </View>
            <Text style={[
              styles.requirementText,
              hasSpecialChar && styles.requirementTextValid
            ]}>
              1 or more special characters
            </Text>
          </View>
        </View>
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 20,
    paddingRight: 50,
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
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 15,
    padding: 4,
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
  requirementsContainer: {
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
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
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleValid: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  checkMark: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  requirementText: {
    fontSize: 14,
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
  requirementTextValid: {
    color: '#1F2937',
  },
});

export default RegWithPasswordScreen;
