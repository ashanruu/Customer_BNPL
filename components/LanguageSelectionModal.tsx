import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage?: (language: Language) => void;
  currentLanguage?: string;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  visible,
  onClose,
  onSelectLanguage,
  currentLanguage = 'en',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];

  const handleSave = () => {
    const language = languages.find(lang => lang.code === selectedLanguage);
    if (language && onSelectLanguage) {
      onSelectLanguage(language);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Select Your Language</Text>
                <Text style={styles.subtitle}>You can switch language anytime in Settings</Text>
              </View>

              {/* Language Options */}
              <View style={styles.languageList}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      selectedLanguage === language.code && styles.languageOptionSelected,
                    ]}
                    onPress={() => setSelectedLanguage(language.code)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.languageName,
                        selectedLanguage === language.code && styles.languageNameSelected,
                      ]}
                    >
                      {language.nativeName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    paddingBottom: 60,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    alignItems: 'flex-end',
    paddingTop: 16,
    paddingRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    //fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
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
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  languageList: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  languageOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    alignItems: 'center',
  },
  languageOptionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#268deeff',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  languageNameSelected: {
    color: '#1F2937',
  },
  saveButton: {
    marginHorizontal: 24,
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    fontSize: 16,
    //fontWeight: '700',
    color: '#FFFFFF',
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

export default LanguageSelectionModal;