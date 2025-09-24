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