import { changeLanguage, getCurrentLanguage, getLanguageDisplayName } from './i18n';

/**
 * Test function to verify language switching works
 */
export const testLanguageSystem = async () => {
  console.log('🌐 Testing Language System...');
  
  try {
    // Test getting current language
    const currentLang = getCurrentLanguage();
    console.log('✅ Current language:', currentLang);
    console.log('✅ Display name:', getLanguageDisplayName(currentLang));
    
    // Test language switching
    console.log('🔄 Testing language switching...');
    
    await changeLanguage('si');
    console.log('✅ Switched to Sinhala:', getCurrentLanguage());
    
    await changeLanguage('ta');
    console.log('✅ Switched to Tamil:', getCurrentLanguage());
    
    await changeLanguage('en');
    console.log('✅ Switched to English:', getCurrentLanguage());
    
    console.log('🎉 Language system test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Language system test failed:', error);
    return false;
  }
};

/**
 * Simple language verification
 */
export const verifyLanguageFiles = () => {
  try {
    const en = require('../locales/en.json');
    const si = require('../locales/si.json');
    const ta = require('../locales/ta.json');
    
    console.log('✅ English translations loaded');
    console.log('✅ Sinhala translations loaded');
    console.log('✅ Tamil translations loaded');
    
    // Check if key sections exist
    const requiredSections = ['common', 'auth', 'settings', 'languages'];
    const allFilesValid = [en, si, ta].every(file => 
      requiredSections.every(section => section in file)
    );
    
    if (allFilesValid) {
      console.log('✅ All translation files have required sections');
      return true;
    } else {
      console.warn('⚠️ Some translation files are missing required sections');
      return false;
    }
  } catch (error) {
    console.error('❌ Error loading translation files:', error);
    return false;
  }
};