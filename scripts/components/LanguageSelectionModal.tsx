import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getSupportedLanguages, changeLanguage, getCurrentLanguage } from '../utils/i18n';
import { Colors } from '../constants/Colors';

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  visible,
  onClose,
  onLanguageChange,
}) => {
  const { t } = useTranslation();
  const supportedLanguages = getSupportedLanguages();
  const currentLanguage = getCurrentLanguage();

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      onLanguageChange?.(languageCode);
      onClose();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('languages.selectLanguage')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Language Options */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {supportedLanguages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageOption,
                currentLanguage === language.code && styles.selectedLanguageOption,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.languageName,
                    currentLanguage === language.code && styles.selectedLanguageName,
                  ]}
                >
                  {language.nativeName}
                </Text>
                <Text
                  style={[
                    styles.languageSubtitle,
                    currentLanguage === language.code && styles.selectedLanguageSubtitle,
                  ]}
                >
                  {language.name}
                </Text>
              </View>
              
              {currentLanguage === language.code && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={Colors.light.primary} 
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('languages.languageChanged')}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageOption: {
    backgroundColor: '#EBF8FF',
    borderColor: Colors.light.primary,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedLanguageName: {
    color: Colors.light.primary,
  },
  languageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedLanguageSubtitle: {
    color: Colors.light.primary,
  },
  checkmarkContainer: {
    marginLeft: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LanguageSelectionModal;