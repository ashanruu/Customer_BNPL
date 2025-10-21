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
  ImageBackground,
} from 'react-native';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';
import CustomButton from '../components/CustomButton';
import {
  getSecuritySettings,
  saveSecuritySettings,
  clearSecuritySettings,
  checkBiometricCapability,
  disablePin,
} from '../utils/authUtils';

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
      // Navigate to change PIN screen to set up PIN
      navigation.navigate('ChangePinScreen');
    } else {
      // Disable PIN
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
  }> = ({ title, subtitle, icon, onPress, rightComponent, disabled = false }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    disabled?: boolean;
  }) => (

    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={disabled ? 'rgba(255, 255, 255, 0.4)' : '#4CAF50'} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.settingTitleDisabled]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, disabled && styles.settingSubtitleDisabled]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      {rightComponent || (
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={disabled ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.6)'} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/images/bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security & Authentication</Text>
              
              <View style={styles.settingsCard}>
                <SettingItem
                  title="PIN Authentication"
                  subtitle={securitySettings.pinEnabled ? 'PIN is enabled' : 'Set up PIN for quick access'}
                  icon="lock-outline"
                  rightComponent={
                    <Switch
                      value={securitySettings.pinEnabled}
                      onValueChange={handlePinToggle}
                      trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#4CAF50' }}
                      thumbColor={securitySettings.pinEnabled ? '#fff' : '#f4f3f4'}
                      disabled={loading}
                    />
                  }
                />

                {securitySettings.pinEnabled && (
                  <SettingItem
                    title="Change PIN"
                    subtitle="Update your current PIN"
                    icon="key-change"
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
                  icon="fingerprint"
                  disabled={!biometricAvailable}
                  rightComponent={
                    <Switch
                      value={securitySettings.biometricEnabled}
                      onValueChange={handleBiometricToggle}
                      trackColor={{ false: 'rgba(255, 255, 255, 0.3)', true: '#4CAF50' }}
                      thumbColor={securitySettings.biometricEnabled ? '#fff' : '#f4f3f4'}
                      disabled={!biometricAvailable || loading}
                    />
                  }
                />
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              
              <View style={styles.settingsCard}>
                <SettingItem
                  title="Profile Settings"
                  subtitle="Manage your personal information"
                  icon="account-outline"
                />

                <SettingItem
                  title="Notification Preferences"
                  subtitle="Configure your notifications"
                  icon="bell-outline"
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
              
              <View style={styles.settingsCard}>
                <SettingItem
                  title="Language"
                  subtitle="English (US)"
                  icon="translate"
                />

                <SettingItem
                  title="Theme"
                  subtitle="Dark mode"
                  icon="palette-outline"
                />

                <SettingItem
                  title="About"
                  subtitle="Version 1.0.0"
                  icon="information-outline"
                />
              </View>
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
              <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
              
              <View style={styles.settingsCard}>
                <TouchableOpacity
                  style={styles.dangerItem}
                  onPress={handleResetSecurity}
                  disabled={loading}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconContainer, styles.dangerIconContainer]}>
                      <MaterialCommunityIcons name="alert-outline" size={24} color="#f44336" />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.dangerTitle}>Reset Security Settings</Text>
                      <Text style={styles.dangerSubtitle}>
                        Remove all security features and PIN
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#f44336" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginBottom: 15,
  },
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingTitleDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  settingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  settingSubtitleDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
    marginBottom: 2,
  },
  dangerSubtitle: {
    fontSize: 14,
    color: 'rgba(244, 67, 54, 0.7)',
  },
  bottomSpacing: {
    height: 50,
  },
});
