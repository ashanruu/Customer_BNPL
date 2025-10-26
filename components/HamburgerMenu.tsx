// components/HamburgerMenu.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Text, Modal, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors'; // Adjust path as needed
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onPress: () => void;
}

const HamburgerMenu: React.FC<Props> = ({ onPress }) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const { t, i18n } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      await i18n.changeLanguage(languageCode);
      setShowLanguageModal(false);
      Alert.alert(
        t('languages.success'),
        t('languages.languageChanged'),
        [{ text: t('languages.ok') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('languages.error'),
        t('languages.languageChangeError'),
        [{ text: t('languages.ok') }]
      );
    }
  };

  const getCurrentLanguageName = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang ? currentLang.nativeName : 'English';
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <MaterialCommunityIcons
            name="menu"
            size={28}
            color="white"
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 3 }}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>BNPL</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={styles.planButton}>
          <Text style={styles.planText}>Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowLanguageModal(true)} style={styles.languageButton}>
          <Ionicons name="language" size={22} color="#fff" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress} style={styles.bellbutton}>
          <MaterialCommunityIcons
            name="bell"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('languages.selectLanguage')}</Text>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    i18n.language === language.code && styles.selectedLanguageOption
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageName,
                      i18n.language === language.code && styles.selectedLanguageName
                    ]}>
                      {language.nativeName}
                    </Text>
                    <Text style={[
                      styles.languageEnglishName,
                      i18n.language === language.code && styles.selectedLanguageEnglishName
                    ]}>
                      {language.name}
                    </Text>
                  </View>
                  {i18n.language === language.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Menu left, Bell right
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 50, // adjust for SafeAreaView if needed
    backgroundColor: 'rgba(32, 34, 46, 1)',
    paddingBottom: 10,
  },
  button: {
    padding: 10,
  },
  bellbutton: {
    padding: 10,
  },
  planButton: {
    backgroundColor: '#444',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8
  },
  planText: { color: '#fff' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginLeft: 15 },
  languageButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 20,
    minWidth: 280,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedLanguageOption: {
    backgroundColor: '#f8f9ff',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#4CAF50',
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#666',
  },
  selectedLanguageEnglishName: {
    color: '#4CAF50',
  },
});


export default HamburgerMenu;
