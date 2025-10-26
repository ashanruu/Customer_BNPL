import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import CustomNotification from '../../components/CustomNotification';
import { useNotification } from '../../components/useNotification';
import { resetPassword } from '../../scripts/api';
import { validatePassword, validatePasswordConfirmation } from '../../utils/authUtils';

type Props = {
  navigation: any;
  route: any;
};

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  // Get data from previous screen
  const { email, recoveryReferenceNum } = route.params || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Auto scroll when keyboard appears
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: 100,
              animated: true,
            });
          }
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const validateFields = () => {
    let valid = true;
    let newErrors = {
      password: '',
      confirmPassword: '',
    };

    // Validate password using authUtils
    if (!password.trim()) {
      newErrors.password = 'Please enter a password';
      valid = false;
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]; // Show first error
        valid = false;
      }
    }

    // Validate password confirmation
    const confirmationValidation = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmationValidation.isValid) {
      newErrors.confirmPassword = confirmationValidation.message || '';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleResetPassword = async () => {
    if (!validateFields()) return;

    if (!recoveryReferenceNum) {
      showError('Recovery reference is missing. Please try the forgot password process again.');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(recoveryReferenceNum, password);

      console.log('Reset Password response:', response);

      if (response.statusCode === 200) {
        showSuccess('Password reset successfully!');
        setTimeout(() => {
          navigation.replace('Login');
        }, 2000);
      } else {
        showError(response.message || 'Password reset failed');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Password reset failed. Please try again.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when user starts typing and update password strength
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    
    // Update password strength in real-time
    if (text.trim()) {
      const validation = validatePassword(text);
      setPasswordStrength(validation.strength);
    } else {
      setPasswordStrength(null);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  // Format email for display
  const formatEmail = (email: string) => {
    if (!email) return 'your email';
    
    const [localPart, domain] = email.split('@');
    if (localPart && domain) {
      const maskedLocal = localPart.charAt(0) + 
                         'x'.repeat(Math.max(0, localPart.length - 2)) + 
                         (localPart.length > 1 ? localPart.charAt(localPart.length - 1) : '');
      return `${maskedLocal}@${domain}`;
    }
    return email;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingBottom: Math.max(80, keyboardHeight / 3) }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.contentWrapper}>
              <CustomNotification
                message={notification.message}
                type={notification.type}
                visible={notification.visible}
                duration={notification.duration}
                onHide={hideNotification}
              />

              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={20}
                  color="#374151"
                />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <MainText size="xlarge" weight="bold" align="left">
                  Reset Your Password
                </MainText>
                <SubText size="medium" align="left" style={styles.subtitle}>
                  Create a new password for {formatEmail(email)}
                </SubText>
              </View>

              {/* Form */}
              <View style={styles.centeredBox}>
                <View style={styles.form}>
                  <CustomInputField
                    placeholder="New Password"
                    value={password}
                    onChangeText={handlePasswordChange}
                    iconName="lock-outline"
                    secureTextEntry={!showPassword}
                    error={errors.password}
                  />
                  
                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <View style={styles.requirementsContainer}>
                      <SubText size="small" style={styles.requirementsTitle}>
                        Password must contain:
                      </SubText>
                      <SubText size="small" style={{
                        ...styles.requirement,
                        ...((/(?=.*[a-z])/.test(password)) && styles.requirementMet)
                      }}>
                        • At least one lowercase letter
                      </SubText>
                      <SubText size="small" style={{
                        ...styles.requirement,
                        ...((/(?=.*[A-Z])/.test(password)) && styles.requirementMet)
                      }}>
                        • At least one uppercase letter
                      </SubText>
                      <SubText size="small" style={{
                        ...styles.requirement,
                        ...((/(?=.*\d)/.test(password)) && styles.requirementMet)
                      }}>
                        • At least one number
                      </SubText>
                      <SubText size="small" style={{
                        ...styles.requirement,
                        ...((/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(password)) && styles.requirementMet)
                      }}>
                        • At least one special character
                      </SubText>
                      <SubText size="small" style={{
                        ...styles.requirement,
                        ...((password.length >= 8) && styles.requirementMet)
                      }}>
                        • At least 8 characters long
                      </SubText>
                    </View>
                  )}

                  {/* Password Strength Indicator */}
                  {passwordStrength && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBar}>
                        <View 
                          style={[
                            styles.strengthFill,
                            {
                              width: passwordStrength === 'weak' ? '33%' : 
                                     passwordStrength === 'medium' ? '66%' : '100%',
                              backgroundColor: passwordStrength === 'weak' ? '#EF4444' :
                                             passwordStrength === 'medium' ? '#F59E0B' : '#10B981'
                            }
                          ]}
                        />
                      </View>
                      <SubText 
                        size="small" 
                        style={{
                          ...styles.strengthText,
                          color: passwordStrength === 'weak' ? '#EF4444' :
                                 passwordStrength === 'medium' ? '#F59E0B' : '#10B981'
                        }}
                      >
                        Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                      </SubText>
                    </View>
                  )}
                  
                  <CustomInputField
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    iconName="lock-check-outline"
                    secureTextEntry={!showConfirmPassword}
                    error={errors.confirmPassword}
                  />

                  <CustomButton
                    title="Reset Password"
                    onPress={handleResetPassword}
                    loading={loading}
                    style={styles.resetButton}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
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
    marginTop: 30,
    marginBottom: 40,
  },
  subtitle: {
    color: Colors.light.mutedText,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  resetButton: {
    marginTop: 20,
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    marginTop: 4,
    fontSize: 12,
  },
  requirementsContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementsTitle: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  requirement: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  requirementMet: {
    color: '#10B981',
  },
});

export default ResetPasswordScreen;