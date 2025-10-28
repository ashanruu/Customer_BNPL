import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { MainText, SubText } from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  crashReporting: boolean;
  locationTracking: boolean;
  cameraAccess: boolean;
  contactsAccess: boolean;
  storageAccess: boolean;
  thirdPartySharing: boolean;
  marketingEmails: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  activityTracking: boolean;
}

const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: true,
    crashReporting: true,
    locationTracking: false,
    cameraAccess: true,
    contactsAccess: false,
    storageAccess: true,
    thirdPartySharing: false,
    marketingEmails: false,
    profileVisibility: 'private',
    activityTracking: false,
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('privacySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const savePrivacySettings = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('privacySettings', JSON.stringify(settings));
      Alert.alert(
        t('common.success'),
        'Privacy settings saved successfully',
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert(t('common.error'), 'Failed to save privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof PrivacySettings, value?: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value !== undefined ? value : !prev[key]
    }));
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete Personal Data',
      'This will permanently delete all your personal data. This action cannot be undone. Are you sure you want to continue?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Data Deletion Request',
              'Your data deletion request has been submitted. You will receive a confirmation email within 24 hours.',
              [{ text: t('common.ok') }]
            );
          }
        }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Personal Data',
      'We will prepare your personal data and send you a download link via email within 48 hours.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert(
              'Export Request Submitted',
              'You will receive an email with your data export link within 48 hours.',
              [{ text: t('common.ok') }]
            );
          }
        }
      ]
    );
  };

  const PrivacyItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon,
    isRequired = false
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
    isRequired?: boolean;
  }) => (
    <View style={styles.privacyItem}>
      <View style={styles.privacyContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={22} 
            color={value ? Colors.light.tint : Colors.light.mutedText} 
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <MainText size="medium" weight="semibold">
              {title}
            </MainText>
            {isRequired && (
              <View style={styles.requiredBadge}>
                <SubText size="xsmall" style={styles.requiredText}>
                  Required
                </SubText>
              </View>
            )}
          </View>
          <SubText size="small" style={styles.description}>
            {description}
          </SubText>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: Colors.light.tint + '40' }}
        thumbColor={value ? Colors.light.tint : '#9CA3AF'}
        disabled={isRequired}
      />
    </View>
  );

  const ActionItem = ({ 
    title, 
    description, 
    onPress, 
    icon,
    isDanger = false
  }: {
    title: string;
    description: string;
    onPress: () => void;
    icon: string;
    isDanger?: boolean;
  }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={styles.privacyContent}>
        <View style={[styles.iconContainer, isDanger && styles.dangerIconContainer]}>
          <MaterialCommunityIcons 
            name={icon} 
            size={22} 
            color={isDanger ? '#EF4444' : Colors.light.tint} 
          />
        </View>
        <View style={styles.textContainer}>
          <MainText size="medium" weight="semibold" style={isDanger && styles.dangerText}>
            {title}
          </MainText>
          <SubText size="small" style={styles.description}>
            {description}
          </SubText>
        </View>
      </View>
      <MaterialCommunityIcons 
        name="chevron-right" 
        size={20} 
        color={Colors.light.mutedText} 
      />
    </TouchableOpacity>
  );

  const ProfileVisibilitySelector = () => (
    <View style={styles.visibilitySection}>
      <MainText size="medium" weight="semibold" style={styles.visibilityTitle}>
        Profile Visibility
      </MainText>
      <SubText size="small" style={styles.visibilityDescription}>
        Choose who can see your profile information
      </SubText>
      
      <View style={styles.visibilityOptions}>
        {[
          { key: 'public', label: 'Public', description: 'Anyone can see your profile' },
          { key: 'private', label: 'Private', description: 'Only you can see your profile' },
          { key: 'friends', label: 'Friends Only', description: 'Only your connections can see' }
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.visibilityOption,
              settings.profileVisibility === option.key && styles.selectedVisibilityOption
            ]}
            onPress={() => toggleSetting('profileVisibility', option.key)}
          >
            <View style={styles.visibilityOptionContent}>
              <MainText size="medium" weight="medium">
                {option.label}
              </MainText>
              <SubText size="small" style={styles.visibilityOptionDescription}>
                {option.description}
              </SubText>
            </View>
            <View style={[
              styles.radioButton,
              settings.profileVisibility === option.key && styles.selectedRadioButton
            ]}>
              {settings.profileVisibility === option.key && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        
        <MainText size="large" weight="bold" style={styles.headerTitle}>
          Privacy Settings
        </MainText>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Data Collection Section */}
          {/* <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              Data Collection & Usage
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              Control how we collect and use your data
            </SubText>

            <PrivacyItem
              title="Essential Data Collection"
              description="Required for app functionality and security"
              value={settings.dataCollection}
              onToggle={() => toggleSetting('dataCollection')}
              icon="database-outline"
              isRequired={true}
            />

            <PrivacyItem
              title="Analytics & Performance"
              description="Help us improve the app with usage analytics"
              value={settings.analytics}
              onToggle={() => toggleSetting('analytics')}
              icon="chart-line"
            />

            <PrivacyItem
              title="Crash Reporting"
              description="Automatically send crash reports to improve stability"
              value={settings.crashReporting}
              onToggle={() => toggleSetting('crashReporting')}
              icon="bug-outline"
            />

            <PrivacyItem
              title="Activity Tracking"
              description="Track your app usage patterns for personalization"
              value={settings.activityTracking}
              onToggle={() => toggleSetting('activityTracking')}
              icon="timeline-outline"
            />
          </View> */}

          {/* Permissions Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              App Permissions
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              Manage what the app can access on your device
            </SubText>

            <PrivacyItem
              title="Location Access"
              description="Use your location for location-based services"
              value={settings.locationTracking}
              onToggle={() => toggleSetting('locationTracking')}
              icon="map-marker-outline"
            />

            <PrivacyItem
              title="Camera Access"
              description="Access camera for QR scanning and photos"
              value={settings.cameraAccess}
              onToggle={() => toggleSetting('cameraAccess')}
              icon="camera-outline"
            />

            <PrivacyItem
              title="Storage Access"
              description="Save and access files on your device"
              value={settings.storageAccess}
              onToggle={() => toggleSetting('storageAccess')}
              icon="folder-outline"
            />

            <PrivacyItem
              title="Contacts Access"
              description="Access your contacts for referrals and invites"
              value={settings.contactsAccess}
              onToggle={() => toggleSetting('contactsAccess')}
              icon="contacts-outline"
            />
          </View>

          {/* Profile Visibility Section
          <View style={styles.section}>
            <ProfileVisibilitySelector />
          </View> */}

          {/* Sharing & Marketing Section
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              Sharing & Marketing
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              Control how your data is shared and used for marketing
            </SubText>

            <PrivacyItem
              title="Third-party Sharing"
              description="Allow sharing data with trusted partners"
              value={settings.thirdPartySharing}
              onToggle={() => toggleSetting('thirdPartySharing')}
              icon="share-variant-outline"
            />

            <PrivacyItem
              title="Marketing Communications"
              description="Receive personalized marketing emails"
              value={settings.marketingEmails}
              onToggle={() => toggleSetting('marketingEmails')}
              icon="email-newsletter"
            />
          </View> */}

          {/* Data Management Section
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              Data Management
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              Manage your personal data and privacy rights
            </SubText>

            <ActionItem
              title="Export My Data"
              description="Download a copy of all your personal data"
              onPress={handleDataExport}
              icon="download-outline"
            />

            <ActionItem
              title="Delete My Data"
              description="Permanently delete all your personal data"
              onPress={handleDataDeletion}
              icon="delete-outline"
              isDanger={true}
            />
          </View> */}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons 
                name="shield-check-outline" 
                size={20} 
                color={Colors.light.tint}
                style={styles.infoIcon}
              />
              <SubText size="small" style={styles.infoText}>
                We are committed to protecting your privacy. For more details about how we 
                handle your data, please read our Privacy Policy and Terms of Service.
              </SubText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Save Button */}
      <View style={styles.footer}>
        <CustomButton
          title="Save Privacy Settings"
          onPress={savePrivacySettings}
          loading={loading}
          style={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: Colors.light.background,
    marginTop: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionDescription: {
    color: Colors.light.mutedText,
    marginBottom: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  requiredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  requiredText: {
    color: '#D97706',
    fontWeight: '600',
  },
  description: {
    color: Colors.light.mutedText,
    lineHeight: 16,
  },
  dangerText: {
    color: '#EF4444',
  },
  visibilitySection: {
    marginBottom: 16,
  },
  visibilityTitle: {
    color: Colors.light.text,
    marginBottom: 4,
  },
  visibilityDescription: {
    color: Colors.light.mutedText,
    marginBottom: 16,
  },
  visibilityOptions: {
    gap: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedVisibilityOption: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + '08',
  },
  visibilityOptionContent: {
    flex: 1,
  },
  visibilityOptionDescription: {
    color: Colors.light.mutedText,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: Colors.light.tint,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.tint,
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.tint + '10',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: Colors.light.text,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: Colors.light.background,
  },
  saveButton: {
    marginTop: 0,
  },
});

export default PrivacySettingsScreen;