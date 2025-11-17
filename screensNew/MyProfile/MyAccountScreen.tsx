import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import UserProfileHeader from '../../components/UserProfileHeader';
import AddEmailModal from '../../components/AddEmailModal';
import ProfileView from '../../components/ProfileView';
import BottomSheetModal from '../../components/BottomSheetModal';

const MyAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const settingsMenuItems = [
    {
      id: 1,
      title: 'Language',
      icon: 'web',
      onPress: () => setShowLanguageModal(true),
    },
    {
      id: 2,
      title: 'Security',
      icon: 'shield-check-outline',
      onPress: () => navigation.navigate('SecurityScreen'),
    },
    {
      id: 3,
      title: 'Increase Spending Limit',
      icon: 'trending-up',
      onPress: () => navigation.navigate('IncreaseCreditLimitScreen'),
    },
    {
      id: 4,
      title: 'Credit Scoring',
      icon: 'chart-line',
      onPress: () => console.log('Credit Scoring'),
    },
    {
      id: 5,
      title: 'Payment Method',
      icon: 'credit-card-outline',
      onPress: () => console.log('Payment Method'),
    },
    {
      id: 6,
      title: 'Support',
      icon: 'headset',
      onPress: () => console.log('Support'),
    },
    {
      id: 7,
      title: 'About App',
      icon: 'information-outline',
      onPress: () => console.log('About App'),
    },
    {
      id: 8,
      title: 'Delete Account',
      icon: 'trash-can-outline',
      onPress: () => console.log('Delete Account'),
    },
    {
      id: 9,
      title: 'Logout',
      icon: 'logout',
      onPress: () => console.log('Logout'),
    },
        // New Report Account item
    {
      id: 10,
      title: 'Report Account',
      icon: 'alert-circle-outline',
      onPress: () => navigation.navigate('ReportAccountScreen'),
    },
        {
      id: 11,
      title: 'Recover Account',
      icon: 'alert-circle-outline',
      onPress: () => navigation.navigate('RecoverAccountScreen'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with title */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Header Component */}
        <View style={styles.profileHeaderContainer}>
          <UserProfileHeader
            userName="Adeesha Perera"
            avatarSource={{ uri: 'https://via.placeholder.com/40' }}
            greeting="Member Since 12.10.2023"
            onEditPress={() => setShowProfileView(true)}
            onUserPress={() => console.log('User profile pressed')}
            backgroundColor="#F3F4F6"
            greetingColor="#9CA3AF"
            userNameColor="#1F2937"
          />
        </View>

        {/* Add Email Section - Always Visible */}
        <View style={styles.addEmailContainer}>
          {/* Mailbox Image */}
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/fg 1.png')}
              style={styles.mailboxImage}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Add Your Email</Text>

          {/* Description */}
          <Text style={styles.description}>
            Secure your account with an extra layer of protection & enable{' '}
            <Text style={styles.boldText}>two-step verification</Text>.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (email.trim()) {
                  console.log('Email added:', email);
                  setEmail('');
                } else {
                  console.log('Please enter an email address');
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Menu Section */}
        <View style={styles.settingsMenuContainer}>
          {settingsMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.settingsMenuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingsItemLeft}>
                <Icon name={item.icon} size={20} color="#1F2937" />
                <Text style={styles.settingsItemText}>{item.title}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Profile View Modal */}
      {showProfileView && (
        <View style={styles.profileViewContainer}>
          <SafeAreaView style={styles.profileViewSafe} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Profile Header */}
            <View style={styles.profileViewHeader}>
              <TouchableOpacity 
                onPress={() => setShowProfileView(false)}
                style={styles.backButton}
              >
                <Icon name="arrow-left" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile</Text>
              <View style={styles.placeholder} />
            </View>

            <ProfileView
              name="Adeesha Perera"
              nicNumber="200084301234"
              memberSince="12.10.2023"
              avatarUrl="https://via.placeholder.com/120"
              fields={[
                { value: '0756665456', type: 'phone' },
                { value: 'December 8,2000', type: 'date' },
                { value: '321/D, Thibirigasyaya.', type: 'address' },
                { value: 'adeesha@gmail.com', type: 'email' },
              ]}
              onEditAvatar={() => console.log('Edit avatar')}
            />
          </SafeAreaView>
        </View>
      )}

      {/* Language Selection Bottom Sheet */}
      <BottomSheetModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="Select Your Language"
        showCloseButton={true}
        scrollable={true}
        height="auto"
        contentPadding={0}
        footerContent={
          <TouchableOpacity
            style={styles.saveLanguageButton}
            onPress={() => {
              console.log('Selected language:', selectedLanguage);
              setShowLanguageModal(false);
            }}
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
            {[
              { code: 'en', name: 'English' },
              { code: 'si', name: 'සිංහල' },
              { code: 'ta', name: 'தமிழ்' },
            ].map((language) => (
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
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </BottomSheetModal>

      {/* Add Email Modal */}
      <AddEmailModal
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onAdd={(email) => {
          console.log('Email added:', email);
          setShowEmailModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
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
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeaderContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  addEmailContainer: {
    backgroundColor: '#dbe8f5ff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    marginBottom: 20,
  },
  mailboxImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  boldText: {
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  addButton: {
    height: 48,
    paddingHorizontal: 24,
    backgroundColor: '#0066CC',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  settingsMenuContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  settingsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        //shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    marginLeft: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  profileViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  profileViewSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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

export default MyAccountScreen;
