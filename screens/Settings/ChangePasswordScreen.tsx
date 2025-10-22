import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import CustomButton from '../../components/CustomButton';

type RootStackParamList = {
  Settings: undefined;
  ChangePasswordScreen: undefined;
};

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [step, setStep] = useState<'current' | 'new'>('current');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUpperCase) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowerCase) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumbers) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { isValid: false, message: 'Password must contain at least one special character' };
    }

    return { isValid: true, message: '' };
  };

  const handleCurrentPasswordVerification = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual backend verification when available
      // const isValid = await verifyCurrentPassword(currentPassword);
      const isValid = true; // Temporary: accept any password
      
      if (isValid) {
        setStep('new');
      } else {
        Alert.alert('Error', 'Current password is incorrect. Please try again.', [
          { text: 'OK', onPress: () => setCurrentPassword('') }
        ]);
      }
    } catch (error) {
      console.error('Password verification error:', error);
      Alert.alert('Error', 'Failed to verify current password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your new password');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      Alert.alert('Invalid Password', validation.message);
      return;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match. Please try again.', [
        { text: 'OK', onPress: () => {
          setConfirmPassword('');
        }}
      ]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual backend API call when available
      // const result = await changePassword(currentPassword, newPassword);
      const result = { success: true, message: 'Password changed successfully' }; // Temporary: always succeed
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Password changed successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    if (step === 'current') {
      navigation.goBack();
    } else if (step === 'new') {
      setStep('current');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSubmit = () => {
    switch (step) {
      case 'current':
        handleCurrentPasswordVerification();
        break;
      case 'new':
        handlePasswordChange();
        break;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'current':
        return 'Enter Current Password';
      case 'new':
        return 'Set New Password';
      default:
        return '';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'current':
        return 'Please enter your current password to continue';
      case 'new':
        return 'Create a strong password and confirm it below';
      default:
        return '';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'current':
        return 'lock-closed-outline';
      case 'new':
        return 'create-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  const renderPasswordInput = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    isVisible: boolean,
    toggleVisibility: () => void,
    iconName: string = 'lock-outline'
  ) => {
    return (
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name={iconName as any}
          size={20}
          color="#9CA3AF"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={toggleVisibility}
        >
          <Ionicons
            name={isVisible ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPasswordRequirements = () => {
    if (step !== 'new') return null;

    return (
      <View style={styles.requirementsContainer}>
        <Text style={styles.requirementsTitle}>Password Requirements</Text>
        <Text style={styles.requirementsText}>
          • Password must be at least 8 characters long{'\n'}
          • Include at least one uppercase letter (A-Z){'\n'}
          • Include at least one lowercase letter (a-z){'\n'}
          • Include at least one number (0-9){'\n'}
          • Include at least one special character (!@#$%^&*)
        </Text>
      </View>
    );
  };

  const renderStepContent = () => {
    return (
      <View style={styles.stepContainer}>
        <View style={styles.instructionContainer}>
          <View style={styles.stepIconContainer}>
            <Ionicons 
              name={getStepIcon() as any} 
              size={48} 
              color="#374151" 
              style={styles.stepIcon}
            />
          </View>
          <Text style={styles.stepTitle}>{getStepTitle()}</Text>
          <Text style={styles.stepSubtitle}>{getStepSubtitle()}</Text>
        </View>
        
        <View style={styles.inputSection}>
          {step === 'current' && renderPasswordInput(
            currentPassword,
            setCurrentPassword,
            'Enter current password',
            currentPasswordVisible,
            () => setCurrentPasswordVisible(!currentPasswordVisible),
            'lock-outline'
          )}
          
          {step === 'new' && (
            <>
              {renderPasswordInput(
                newPassword,
                setNewPassword,
                'Enter new password',
                newPasswordVisible,
                () => setNewPasswordVisible(!newPasswordVisible),
                'lock-plus-outline'
              )}
              
              <View style={styles.inputSpacing} />
              
              {renderPasswordInput(
                confirmPassword,
                setConfirmPassword,
                'Confirm new password',
                confirmPasswordVisible,
                () => setConfirmPasswordVisible(!confirmPasswordVisible),
                'lock-check-outline'
              )}
            </>
          )}
        </View>

        {renderPasswordRequirements()}

        <CustomButton
          title={loading ? 'Processing...' : step === 'new' ? 'Change Password' : 'Continue'}
          onPress={handleSubmit}
          disabled={
            loading || 
            (step === 'current' && !currentPassword.trim()) ||
            (step === 'new' && (!newPassword.trim() || !confirmPassword.trim()))
          }
          style={styles.primaryButton}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleBackNavigation}
                  style={styles.backButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Ionicons name="arrow-back" size={22} color="#666" />
                </TouchableOpacity>

                <View style={styles.titleSection}>
                  <Text style={styles.headerTitle}>Change Password</Text>
                </View>
              </View>

              {/* Content Area */}
              <View style={styles.centeredBox}>
                {renderStepContent()}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    minHeight: '100%',
  },
  centeredBox: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    flex: 1,
    marginTop: 40,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 52,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 0,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  stepContainer: {
    alignItems: 'center',
  },
  instructionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.light.mutedText,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  inputSpacing: {
    height: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 8,
  },
  requirementsContainer: {
    width: '100%',
    backgroundColor: 'rgba(32, 34, 46, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(32, 34, 46, 0.1)',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#20222E',
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  primaryButton: {
    width: '100%',
  },
  stepIconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    opacity: 0.8,
  },
});

export default ChangePasswordScreen;