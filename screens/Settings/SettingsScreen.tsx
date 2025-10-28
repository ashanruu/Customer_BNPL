import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LanguageSelectionModal from '../../components/LanguageSelectionModal';
import { getLanguageDisplayName, getCurrentLanguage } from '../../utils/i18n';
import {
  getSecuritySettings,
  saveSecuritySettings,
  clearSecuritySettings,
  checkBiometricCapability,
  disablePin,
} from '../../utils/authUtils';

type RootStackParamList = {
  ChangePinScreen: undefined;
  Settings: undefined;
};

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  userPin?: string;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    pinEnabled: false,
    biometricEnabled: false,
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  
  const { t } = useTranslation();

  useEffect(() => {
    loadSettings();
    checkBiometrics();
  }, []);

  // Reload settings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const settings = await getSecuritySettings();
      setSecuritySettings(settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkBiometrics = async () => {
    try {
      const capability = await checkBiometricCapability();
      setBiometricAvailable(capability.available);
    } catch (error) {
      console.error('Error checking biometrics:', error);
      setBiometricAvailable(false);
    }
  };

  const handlePinToggle = async (enabled: boolean) => {
    if (enabled) {
      navigation.navigate('ChangePinScreen');
    } else {
      Alert.alert(
        t('settings.disablePin'),
        t('settings.disablePinMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('settings.disable'),
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await disablePin();
                await loadSettings();
                Alert.alert(t('common.success'), t('settings.pinDisabledSuccess'));
              } catch (error) {
                console.error('Error disabling PIN:', error);
                Alert.alert(t('common.error'), 'Failed to disable PIN authentication.');
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (!biometricAvailable && enabled) {
      Alert.alert(
        'Biometric Not Available',
        t('settings.biometricNotAvailableMessage')
      );
      return;
    }

    try {
      setLoading(true);
      await saveSecuritySettings({
        biometricEnabled: enabled,
      });
      await loadSettings();
      Alert.alert(
        t('common.success'),
        enabled ? t('settings.biometricEnabledSuccess') : t('settings.biometricDisabledSuccess')
      );
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert(t('common.error'), 'Failed to update biometric authentication setting.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePIN = () => {
    navigation.navigate('ChangePinScreen');
  };

  const handleResetSecurity = () => {
    Alert.alert(
      t('settings.resetSecurity'),
      t('settings.resetSecurityMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.reset'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await clearSecuritySettings();
              await loadSettings();
              Alert.alert(t('common.success'), t('settings.securityResetSuccess'));
            } catch (error) {
              console.error('Error resetting security:', error);
              Alert.alert(t('common.error'), 'Failed to reset security settings.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLanguagePress = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    Alert.alert(
      t('common.success'),
      t('languages.languageChanged')
    );
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
    isDanger?: boolean;
  }> = ({ title, subtitle, icon, onPress, rightComponent, disabled = false, isDanger = false }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        disabled && styles.settingItemDisabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[
          styles.iconContainer,
          isDanger && styles.dangerIconContainer,
          disabled && styles.iconContainerDisabled
        ]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={isDanger ? '#f44336' : disabled ? '#C1C1C1' : '#6B7280'} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle,
            disabled && styles.settingTitleDisabled
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.settingSubtitle,
              disabled && styles.settingSubtitleDisabled
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {rightComponent || (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDanger ? '#f44336' : disabled ? '#C1C1C1' : '#C1C1C1'} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={22} color="#666" />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>{t('settings.title')}</Text>
          <Text style={styles.subText}>{t('settings.subtitle')}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.security')}</Text>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title={t('settings.pinAuth')}
              subtitle={securitySettings.pinEnabled ? t('settings.pinEnabled') : t('settings.pinDisabled')}
              icon="lock-closed-outline"
              rightComponent={
                <Switch
                  value={securitySettings.pinEnabled}
                  onValueChange={handlePinToggle}
                  trackColor={{ false: '#E5E5E7', true: '#34C759' }}
                  thumbColor="#fff"
                  disabled={loading}
                />
              }
            />

            {securitySettings.pinEnabled && (
              <SettingItem
                title={t('settings.changePin')}
                subtitle={t('settings.changePinSubtitle')}
                icon="key-outline"
                onPress={handleChangePIN}
              />
            )}

            <SettingItem
              title={t('settings.biometricAuth')}
              subtitle={
                !biometricAvailable 
                  ? t('settings.biometricNotAvailable')
                  : securitySettings.biometricEnabled 
                    ? t('settings.biometricEnabled')
                    : t('settings.biometricDisabled')
              }
              icon="finger-print-outline"
              disabled={!biometricAvailable}
              rightComponent={
                <Switch
                  value={securitySettings.biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: '#E5E5E7', true: '#34C759' }}
                  thumbColor="#fff"
                  disabled={!biometricAvailable || loading}
                />
              }
            />

            <SettingItem
              title={t('settings.changePassword')}
              subtitle={t('settings.changePasswordSubtitle')}
              icon="lock-closed-outline"
              onPress={() => navigation.navigate('ChangePasswordScreen' as any)}
            />

          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          
          <View style={styles.sectionContent}>

            <SettingItem
              title={t('settings.notifications')}
              subtitle={t('settings.notificationsSubtitle')}
              icon="notifications-outline"
              onPress={() => navigation.navigate('NotificationPreferences' as any)}
            />

            <SettingItem
              title={t('settings.privacy')}
              subtitle={t('settings.privacySubtitle')}
              icon="shield-outline"
              onPress={() => navigation.navigate('PrivacySettings' as any)}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appSettings')}</Text>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title={t('settings.language')}
              subtitle={getLanguageDisplayName(currentLanguage)}
              icon="language-outline"
              onPress={handleLanguagePress}
            />

            <SettingItem
              title={t('settings.theme')}
              subtitle={t('settings.themeLight')}
              icon="color-palette-outline"
            />

            <SettingItem
              title={t('settings.about')}
              subtitle={t('settings.version')}
              icon="information-circle-outline"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        onLanguageChange={handleLanguageChange}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
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
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerDisabled: {
    backgroundColor: '#F5F5F5',
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: "500",
    marginBottom: 2,
  },
  settingTitleDisabled: {
    color: '#C1C1C1',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 16,
  },
  settingSubtitleDisabled: {
    color: '#C1C1C1',
  },
  bottomPadding: {
    height: 40,
  },
});