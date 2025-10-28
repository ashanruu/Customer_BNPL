import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  userPin?: string;
}

export interface BiometricCapability {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: number[];
  available: boolean;
}

/**
 * Get current security settings from AsyncStorage
 */
export const getSecuritySettings = async (): Promise<SecuritySettings> => {
  try {
    const [pinEnabled, biometricEnabled, userPin] = await Promise.all([
      AsyncStorage.getItem('pinEnabled'),
      AsyncStorage.getItem('biometricEnabled'),
      AsyncStorage.getItem('userPin'),
    ]);

    return {
      pinEnabled: pinEnabled === 'true',
      biometricEnabled: biometricEnabled === 'true',
      userPin: userPin || undefined,
    };
  } catch (error) {
    console.error('Error getting security settings:', error);
    return {
      pinEnabled: false,
      biometricEnabled: false,
    };
  }
};

/**
 * Check if device supports biometric authentication
 */
export const checkBiometricCapability = async (): Promise<BiometricCapability> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      hasHardware,
      isEnrolled,
      supportedTypes,
      available: hasHardware && isEnrolled && supportedTypes.length > 0,
    };
  } catch (error) {
    console.error('Error checking biometric capability:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      available: false,
    };
  }
};

/**
 * Authenticate using biometrics
 */
export const authenticateWithBiometrics = async (): Promise<boolean> => {
  try {
    const capability = await checkBiometricCapability();
    
    if (!capability.available) {
      throw new Error('Biometric authentication not available');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in with your biometric',
      fallbackLabel: 'Use PIN instead',
      cancelLabel: 'Cancel',
    });

    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};

/**
 * Verify PIN against stored PIN
 */
export const verifyPin = async (inputPin: string): Promise<boolean> => {
  try {
    const storedPin = await AsyncStorage.getItem('userPin');
    return storedPin === inputPin;
  } catch (error) {
    console.error('PIN verification error:', error);
    return false;
  }
};

/**
 * Save security settings
 */
export const saveSecuritySettings = async (settings: Partial<SecuritySettings>): Promise<void> => {
  try {
    const promises: Promise<void>[] = [];

    if (settings.pinEnabled !== undefined) {
      promises.push(AsyncStorage.setItem('pinEnabled', settings.pinEnabled.toString()));
    }

    if (settings.biometricEnabled !== undefined) {
      promises.push(AsyncStorage.setItem('biometricEnabled', settings.biometricEnabled.toString()));
    }

    if (settings.userPin !== undefined) {
      promises.push(AsyncStorage.setItem('userPin', settings.userPin));
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving security settings:', error);
    throw error;
  }
};

/**
 * Check if user has any authentication method set up
 */
export const hasAuthenticationSetup = async (): Promise<boolean> => {
  try {
    const settings = await getSecuritySettings();
    return settings.pinEnabled || settings.biometricEnabled;
  } catch (error) {
    console.error('Error checking authentication setup:', error);
    return false;
  }
};

/**
 * Clear all security settings (for logout/reset)
 */
export const clearSecuritySettings = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem('pinEnabled'),
      AsyncStorage.removeItem('biometricEnabled'),
      AsyncStorage.removeItem('userPin'),
      AsyncStorage.removeItem('lastLoginMethod'),
      AsyncStorage.removeItem('lastLoginTime'),
    ]);
  } catch (error) {
    console.error('Error clearing security settings:', error);
    throw error;
  }
};

/**
 * Save successful login information
 */
export const saveLoginSuccess = async (method: 'pin' | 'biometric' | 'password'): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem('lastLoginMethod', method),
      AsyncStorage.setItem('lastLoginTime', new Date().toISOString()),
    ]);
  } catch (error) {
    console.error('Error saving login success:', error);
  }
};

/**
 * Validate PIN strength and format
 */
export const validatePin = (pin: string): { isValid: boolean; message?: string } => {
  if (!pin) {
    return { isValid: false, message: 'PIN is required' };
  }

  if (pin.length !== 4) {
    return { isValid: false, message: 'PIN must be exactly 4 digits' };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { isValid: false, message: 'PIN must contain only numbers' };
  }

  // Check for simple patterns
  const repeatingDigits = /^(\d)\1{3}$/.test(pin); // 1111, 2222, etc.
  const sequentialUp = pin === '0123' || pin === '1234' || pin === '2345' || 
                       pin === '3456' || pin === '4567' || pin === '5678' || 
                       pin === '6789';
  const sequentialDown = pin === '9876' || pin === '8765' || pin === '7654' || 
                         pin === '6543' || pin === '5432' || pin === '4321' || 
                         pin === '3210';

  if (repeatingDigits) {
    return { isValid: false, message: 'PIN should not have all same digits' };
  }

  if (sequentialUp || sequentialDown) {
    return { isValid: false, message: 'PIN should not be sequential numbers' };
  }

  return { isValid: true };
};

/**
 * Change user PIN
 */
export const changePin = async (currentPin: string, newPin: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Validate new PIN
    const validation = validatePin(newPin);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    // If PIN is currently enabled, verify current PIN
    const settings = await getSecuritySettings();
    if (settings.pinEnabled) {
      const isCurrentPinValid = await verifyPin(currentPin);
      if (!isCurrentPinValid) {
        return { success: false, message: 'Current PIN is incorrect' };
      }
    }

    // Save new PIN
    await saveSecuritySettings({
      userPin: newPin,
      pinEnabled: true,
    });

    return { success: true };
  } catch (error) {
    console.error('Error changing PIN:', error);
    return { success: false, message: 'Failed to change PIN. Please try again.' };
  }
};

/**
 * Disable PIN authentication
 */
export const disablePin = async (): Promise<void> => {
  try {
    await saveSecuritySettings({
      pinEnabled: false,
      userPin: undefined,
    });
  } catch (error) {
    console.error('Error disabling PIN:', error);
    throw error;
  }
};

/**
 * Get last login information
 */
export const getLastLoginInfo = async (): Promise<{ method?: string; time?: string }> => {
  try {
    const [method, time] = await Promise.all([
      AsyncStorage.getItem('lastLoginMethod'),
      AsyncStorage.getItem('lastLoginTime'),
    ]);

    return {
      method: method || undefined,
      time: time || undefined,
    };
  } catch (error) {
    console.error('Error getting last login info:', error);
    return {};
  }
};


// Password validation utility

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-100
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  let score = 0;

  // Check if password exists
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required'],
      strength: 'weak',
      score: 0,
    };
  }

  // Length validation
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  // Uppercase letter validation
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 15;
  }

  // Lowercase letter validation
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 15;
  }

  // Number validation
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 15;
  }

  // Special character validation
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  } else {
    score += 15;
  }

  // Check for common patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Three or more repeated characters
    /123456|654321|abcdef|qwerty|password|admin|welcome/i, // Common sequences
    /^[a-zA-Z]+$/, // Only letters
    /^\d+$/, // Only numbers
  ];

  let hasCommonPattern = false;
  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      hasCommonPattern = true;
    }
  });

  if (hasCommonPattern) {
    errors.push('Password contains common patterns and is not secure');
    score -= 10;
  } else {
    score += 10;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine strength based on score
  let strength: 'weak' | 'medium' | 'strong';
  if (score < 40) {
    strength = 'weak';
  } else if (score < 70) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score,
  };
};

/**
 * Check if password meets minimum requirements (simplified version)
 */
export const isPasswordValid = (password: string): boolean => {
  const validation = validatePassword(password);
  return validation.isValid;
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const validation = validatePassword(password);
  return validation.strength;
};

/**
 * Get password validation errors as a formatted string
 */
export const getPasswordErrors = (password: string): string => {
  const validation = validatePassword(password);
  return validation.errors.join('\n');
};

/**
 * Validate password confirmation (for password change/reset)
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): { isValid: boolean; message?: string } => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};
