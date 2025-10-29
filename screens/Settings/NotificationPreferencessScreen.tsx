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

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  paymentReminders: boolean;
  orderUpdates: boolean;
  promotionalOffers: boolean;
  securityAlerts: boolean;
  newsUpdates: boolean;
}

const NotificationPreferencesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    orderUpdates: true,
    promotionalOffers: false,
    securityAlerts: true,
    newsUpdates: false,
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      Alert.alert(
        t('common.success'),
        t('notifications.preferencesUpdated'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert(t('common.error'), t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const NotificationItem = ({ 
    title, 
    description, 
    value, 
    onToggle, 
    icon,
    color // ADD: color prop
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
    color?: string; // ADD: optional color prop type
  }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={value ? (color || Colors.light.tint) : Colors.light.mutedText} // USE: color prop with fallback
          />
        </View>
        <View style={styles.textContainer}>
          <MainText size="medium" weight="bold">
            {title}
          </MainText>
          <SubText size="small" style={styles.description}>
            {description}
          </SubText>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: (color || Colors.light.tint) + '40' }} // USE: color prop for track
        thumbColor={value ? (color || Colors.light.tint) : '#9CA3AF'} // USE: color prop for thumb
      />
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
          {t('notifications.title')}
        </MainText>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* General Settings Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              {t('notifications.general')}
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              {t('notifications.generalDesc')}
            </SubText>

            {/* <NotificationItem
              title="Push Notifications"
              description="Receive notifications on your device"
              value={settings.pushNotifications}
              onToggle={() => toggleSetting('pushNotifications')}
              icon="bell-outline"
            /> */}

            <NotificationItem
              title={t('notifications.emailNotifications')}
              description={t('notifications.emailNotificationsDesc')}
              value={settings.emailNotifications}
              onToggle={() => toggleSetting('emailNotifications')}
              icon="email-outline"
              color={Colors.light.primary}
            />

            <NotificationItem
              title={t('notifications.smsNotifications')}
              description={t('notifications.smsNotificationsDesc')}
              value={settings.smsNotifications}
              onToggle={() => toggleSetting('smsNotifications')}
              icon="message-text-outline"
              color={Colors.light.primary}
            />
          </View>

          {/* Transaction Settings Section */}
          {/* <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              Transaction & Order Updates
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              Stay updated on your payments and orders
            </SubText>

            <NotificationItem
              title="Payment Reminders"
              description="Get reminders for upcoming payments"
              value={settings.paymentReminders}
              onToggle={() => toggleSetting('paymentReminders')}
              icon="credit-card-clock-outline"
            />

            <NotificationItem
              title="Order Updates"
              description="Track your order status and delivery"
              value={settings.orderUpdates}
              onToggle={() => toggleSetting('orderUpdates')}
              icon="package-variant-closed"
            />

            <NotificationItem
              title="Security Alerts"
              description="Important security and account updates"
              value={settings.securityAlerts}
              onToggle={() => toggleSetting('securityAlerts')}
              icon="shield-check-outline"
            />
          </View> */}

          {/* Marketing Settings Section */}
          <View style={styles.section}>
            <MainText size="medium" weight="bold" style={styles.sectionTitle}>
              {t('notifications.marketing')}
            </MainText>
            <SubText size="small" style={styles.sectionDescription}>
              {t('notifications.marketingDesc')}
            </SubText>

            <NotificationItem
              title={t('notifications.promotionalOffers')}
              description={t('notifications.promotionalOffersDesc')}
              value={settings.promotionalOffers}
              onToggle={() => toggleSetting('promotionalOffers')}
              icon="tag-outline"
              color={Colors.light.primary}
            />

            <NotificationItem
              title={t('notifications.newsUpdates')}
              description={t('notifications.newsUpdatesDesc')}
              value={settings.newsUpdates}
              onToggle={() => toggleSetting('newsUpdates')}
              icon="newspaper-variant-outline"
              color={Colors.light.secondary}
            />
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <MaterialCommunityIcons 
                name="information-outline" 
                size={20} 
                color={Colors.light.tint}
                style={styles.infoIcon}
              />
              <SubText size="small" style={styles.infoText}>
                {t('notifications.info')}
              </SubText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Save Button */}
      <View style={styles.footer}>
        <CustomButton
          title={t('common.save')}
          onPress={saveNotificationSettings}
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
    marginTop: 30
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
  notificationItem: {
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
  notificationContent: {
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
  textContainer: {
    flex: 1,
  },
  description: {
    color: Colors.light.mutedText,
    marginTop: 2,
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

export default NotificationPreferencesScreen;