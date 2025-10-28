import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { 
  changeLanguage, 
  getCurrentLanguage, 
  getLanguageDisplayName, 
  getSupportedLanguages 
} from '../utils/i18n';

/**
 * Custom hook for language management
 */
export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const switchLanguage = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };

  return {
    t,
    currentLanguage,
    switchLanguage,
    getLanguageDisplayName,
    getSupportedLanguages,
    isReady: i18n.isInitialized,
  };
};

export default useLanguage;