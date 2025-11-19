import React, { useState, useEffect } from 'react'; 
import {
  View,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import BottomSheetModal from '../../components/BottomSheetModal';

type RootStackParamList = {
  LanguageSelect: undefined;
  IntroOneScreen: undefined;
};

type LanguageSelectNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSelect'>;

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

const LanguageSelectScreen: React.FC = () => {
  const navigation = useNavigation<LanguageSelectNavigationProp>();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    // Show language modal after a short delay
    const timer = setTimeout(() => {
      setShowLanguageModal(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLanguageSelect = (language: Language) => {
    setShowLanguageModal(false);
    
    // Navigate to next screen after language selection
    setTimeout(() => {
      navigation.replace('IntroOneScreen');
    }, 300);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Language Selection Bottom Sheet */}
      <BottomSheetModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="Select Your Language"
        showCloseButton={true}
        showHandle={true}
        height="auto"
        closeOnBackdropPress={false}
        contentPadding={0}
        scrollable={true}
        footerContent={
          <TouchableOpacity
            style={styles.saveLanguageButton}
            onPress={() => handleLanguageSelect(selectedLanguage)}
            activeOpacity={0.8}
          >
            <Text style={styles.saveLanguageButtonText}>Save</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.languageContent}>
          <Text style={styles.languageSubtitle}>
            You can switch language anytime in Settings
          </Text>

          <View style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage.code === language.code && styles.languageOptionSelected,
                ]}
                onPress={() => setSelectedLanguage(language)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage.code === language.code && styles.languageNameSelected,
                  ]}
                >
                  {language.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 200,
    height: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  languageContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  languageSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
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
    marginTop: 8,
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
    borderColor: '#0066CC',
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
  saveLanguageButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    marginLeft: 20,
    marginRight: 20,
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
  saveLanguageButtonText: {
    fontSize: 16,
    fontWeight: '700',
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

export default LanguageSelectScreen;
