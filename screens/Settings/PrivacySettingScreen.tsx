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
        t('privacy.settingsUpdated'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert(t('common.error'), t('common.error'));
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
      t('privacy.deletePersonalData'),
      t('privacy.deleteDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('common.success'),
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
      t('privacy.exportPersonalData'),
      t('privacy.exportDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.ok'),
          onPress: () => {
            Alert.alert(
              t('common.success'),
              'You will receive an email with your data export link within 48 hours.',
              [{ text: t('common.ok') }]
            );
          }
        }
      ]
    );
  };

  // FIXED: Updated PrivacyItem component to handle color prop
  const PrivacyItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon,
    isRequired = false,
    color // ADD: color prop
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
    isRequired?: boolean;
    color?: string; // ADD: optional color prop type
  }) => (
    <View style={styles.privacyItem}>
      <View style={styles.privacyContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={22} 
            color={value ? (color || Colors.light.tint) : Colors.light.mutedText} // USE: color prop with fallback
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <MainText size="medium" weight="bold">
              {title}
            </MainText>
            {isRequired && (
              <View style={styles.requiredBadge}>
                <SubText size="small" style={styles.requiredText}>
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
        trackColor={{ 
          false: '#E5E7EB', 
          true: (color || Colors.light.tint) + '40' // USE: color prop for track
        }}
        thumbColor={value ? (color || Colors.light.tint) : '#9CA3AF'} // USE: color prop for thumb
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
          <MainText size="medium" weight="bold" style={isDanger ? styles.dangerText : undefined}>
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
      <MainText size="medium" weight="bold" style={styles.visibilityTitle}>
        {t('privacy.profileVisibility')}
      </MainText>
      <SubText size="small" style={styles.visibilityDescription}>
        {t('privacy.profileVisibilityDesc')}
      </SubText>
      
      <View style={styles.visibilityOptions}>
        {[
          { key: 'public', label: t('privacy.profilePublic'), description: t('privacy.profilePublicDesc') },
          { key: 'private', label: t('privacy.profilePrivate'), description: t('privacy.profilePrivateDesc') },
          { key: 'friends', label: t('privacy.profileFriends'), description: t('privacy.profileFriendsDesc') }
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
              <MainText size="medium" weight="normal">
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
          {t('privacy.title')}
        </MainText>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Permissions Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              {t('privacy.permissions')}
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              {t('privacy.permissionsDesc')}
            </SubText>

            <PrivacyItem
              title={t('privacy.locationTracking')}
              description={t('privacy.locationTrackingDesc')}
              value={settings.locationTracking}
              onToggle={() => toggleSetting('locationTracking')}
              icon="map-marker-outline"
              color={Colors.light.primary}
            />

            <PrivacyItem
              title={t('privacy.cameraAccess')}
              description={t('privacy.cameraAccessDesc')}
              value={settings.cameraAccess}
              onToggle={() => toggleSetting('cameraAccess')}
              icon="camera-outline"
              color={Colors.light.primary}
            />

            <PrivacyItem
              title={t('privacy.storageAccess')}
              description={t('privacy.storageAccessDesc')}
              value={settings.storageAccess}
              onToggle={() => toggleSetting('storageAccess')}
              icon="folder-outline"
              color={Colors.light.primary} // This will now work properly
            />

            <PrivacyItem
              title={t('privacy.contactsAccess')}
              description={t('privacy.contactsAccessDesc')}
              value={settings.contactsAccess}
              onToggle={() => toggleSetting('contactsAccess')}
              icon="contacts-outline"
              color={Colors.light.primary}
            />
          </View>

          {/* Data Management Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              {t('privacy.dataManagement')}
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              {t('privacy.dataManagementDesc')}
            </SubText>

            <PrivacyItem
              title={t('privacy.dataCollection')}
              description={t('privacy.dataCollectionDesc')}
              value={settings.dataCollection}
              onToggle={() => toggleSetting('dataCollection')}
              icon="database-outline"
              color={Colors.light.primary}
            />

            <PrivacyItem
              title={t('privacy.analytics')}
              description={t('privacy.analyticsDesc')}
              value={settings.analytics}
              onToggle={() => toggleSetting('analytics')}
              icon="chart-line"
              color={Colors.light.primary}
            />

            <PrivacyItem
              title={t('privacy.crashReporting')}
              description={t('privacy.crashReportingDesc')}
              value={settings.crashReporting}
              onToggle={() => toggleSetting('crashReporting')}
              icon="bug-outline"
              color={Colors.light.primary}
            />
          </View>

          {/* Data Sharing Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              {t('privacy.sharing')}
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              {t('privacy.sharingDesc')}
            </SubText>

            <PrivacyItem
              title={t('privacy.thirdPartySharing')}
              description={t('privacy.thirdPartySharingDesc')}
              value={settings.thirdPartySharing}
              onToggle={() => toggleSetting('thirdPartySharing')}
              icon="share-variant-outline"
              color={Colors.light.primary}
            />

            <PrivacyItem
              title={t('privacy.marketingEmails')}
              description={t('privacy.marketingEmailsDesc')}
              value={settings.marketingEmails}
              onToggle={() => toggleSetting('marketingEmails')}
              icon="email-newsletter"
              color={Colors.light.primary}
            />

            <PrivacyItem
              title={t('privacy.activityTracking')}
              description={t('privacy.activityTrackingDesc')}
              value={settings.activityTracking}
              onToggle={() => toggleSetting('activityTracking')}
              icon="history"
              color={Colors.light.primary}
            />

            {/* Profile Visibility Selector */}
            <ProfileVisibilitySelector />
          </View>

          {/* Data Actions Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              Data Actions
            </MainText>
            
            <ActionItem
              title={t('privacy.exportPersonalData')}
              description={t('privacy.exportDataDesc')}
              onPress={handleDataExport}
              icon="download-outline"
            />

            <ActionItem
              title={t('privacy.deletePersonalData')}
              description={t('privacy.deleteDataDesc')}
              onPress={handleDataDeletion}
              icon="delete-outline"
              isDanger={true}
            />
          </View>

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
                {t('privacy.info')}
              </SubText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Save Button */}
      <View style={styles.footer}>
        <CustomButton
          title={t('common.save')}
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