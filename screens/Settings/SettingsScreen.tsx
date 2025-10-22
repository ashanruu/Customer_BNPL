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
        'Disable PIN',
        'Are you sure you want to disable PIN authentication? You will need to use email and password to log in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                await disablePin();
                await loadSettings();
                Alert.alert('Success', 'PIN authentication has been disabled.');
              } catch (error) {
                console.error('Error disabling PIN:', error);
                Alert.alert('Error', 'Failed to disable PIN authentication.');
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
        'Biometric authentication is not available on this device or not set up.'
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
        'Success',
        `Biometric authentication has been ${enabled ? 'enabled' : 'disabled'}.`
      );
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to update biometric authentication setting.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePIN = () => {
    navigation.navigate('ChangePinScreen');
  };

  const handleResetSecurity = () => {
    Alert.alert(
      'Reset Security Settings',
      'This will disable all security features and remove your PIN. You will need to use email and password to log in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await clearSecuritySettings();
              await loadSettings();
              Alert.alert('Success', 'Security settings have been reset.');
            } catch (error) {
              console.error('Error resetting security:', error);
              Alert.alert('Error', 'Failed to reset security settings.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
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
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.subText}>Manage your app preferences and security</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Authentication</Text>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title="PIN Authentication"
              subtitle={securitySettings.pinEnabled ? 'PIN is enabled' : 'Set up PIN for quick access'}
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
                title="Change PIN"
                subtitle="Update your current PIN"
                icon="key-outline"
                onPress={handleChangePIN}
              />
            )}

            <SettingItem
              title="Biometric Authentication"
              subtitle={
                !biometricAvailable 
                  ? 'Not available on this device'
                  : securitySettings.biometricEnabled 
                    ? 'Biometric login is enabled'
                    : 'Enable fingerprint/face recognition'
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
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.sectionContent}>

            <SettingItem
              title="Notification Preferences"
              subtitle="Configure your notifications"
              icon="notifications-outline"
            />

            <SettingItem
              title="Privacy Settings"
              subtitle="Control your data and privacy"
              icon="shield-outline"
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.sectionContent}>
            <SettingItem
              title="Language"
              subtitle="English (US)"
              icon="language-outline"
            />

            <SettingItem
              title="Theme"
              subtitle="Light mode"
              icon="color-palette-outline"
            />

            <SettingItem
              title="About"
              subtitle="Version 1.0.0"
              icon="information-circle-outline"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
