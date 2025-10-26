import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

const LANGUAGES = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
};

const LANG_CODES = Object.keys(LANGUAGES);

/**
 * Get the device's current language
 */
const getDeviceLanguage = () => {
  try {
    // Try to get device locales
    const locales = Localization.getLocales();
    
    if (Array.isArray(locales) && locales.length > 0) {
      const deviceLang = locales[0].languageCode?.toLowerCase();
      // Map some common language codes to our supported languages
      if (deviceLang === 'si' || deviceLang === 'sin' || deviceLang === 'sinhala') return 'si';
      if (deviceLang === 'ta' || deviceLang === 'tam' || deviceLang === 'tamil') return 'ta';
      return 'en'; // Default to English
    }
    
    return 'en';
  } catch (error) {
    console.warn('Error getting device language:', error);
    return 'en';
  }
};

/**
 * Get saved language from AsyncStorage
 */
const getSavedLanguage = async (): Promise<string> => {
  try {
    const savedLang = await AsyncStorage.getItem('userLanguage');
    return savedLang && LANG_CODES.includes(savedLang) ? savedLang : getDeviceLanguage();
  } catch (error) {
    console.error('Error getting saved language:', error);
    return getDeviceLanguage();
  }
};

/**
 * Save language to AsyncStorage
 */
export const saveLanguage = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('userLanguage', languageCode);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

/**
 * Change language and save to storage
 */
export const changeLanguage = async (languageCode: string): Promise<void> => {
  try {
    await i18n.changeLanguage(languageCode);
    await saveLanguage(languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

/**
 * Get language display name
 */
export const getLanguageDisplayName = (languageCode: string): string => {
  const displayNames = {
    en: 'English',
    si: 'සිංහල',
    ta: 'தமிழ்',
  };
  return displayNames[languageCode as keyof typeof displayNames] || 'English';
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];
};

// Initialize i18n
const initI18n = async () => {
  const savedLanguage = await getSavedLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources: LANGUAGES,
      lng: savedLanguage,
      fallbackLng: 'en',
      debug: __DEV__,
      
      interpolation: {
        escapeValue: false, // React already does escaping
      },
      
      react: {
        useSuspense: false, // We don't want to use suspense for React Native
      },
    });
};

// Initialize on app start
initI18n();

export default i18n;