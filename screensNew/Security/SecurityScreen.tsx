import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AddEmailModal from '../../components/AddEmailModal';
import BottomSheetModal from '../../components/BottomSheetModal';

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');

  const securityOptions = [
    {
      id: 1,
      title: 'Change Password',
      icon: 'lock-outline',
      onPress: () => setShowChangePasswordModal(true),
      type: 'navigation',
    },
    {
      id: 2,
      title: 'Change PIN',
      icon: 'dialpad',
      onPress: () => navigation.navigate('RegWithPinScreen'),
      type: 'navigation',
    },
    {
      id: 3,
      title: 'Biometric Login',
      icon: 'fingerprint',
      type: 'toggle',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Security Options */}
        <View style={styles.optionsContainer}>
          {securityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionItem}
              onPress={option.type === 'navigation' ? option.onPress : undefined}
              activeOpacity={option.type === 'navigation' ? 0.7 : 1}
              disabled={option.type === 'toggle'}
            >
              <View style={styles.optionLeft}>
                <Icon name={option.icon} size={20} color="#1F2937" />
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
              {option.type === 'navigation' ? (
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: '#E5E7EB', true: '#60A5FA' }}
                  thumbColor={biometricEnabled ? '#0066CC' : '#FFFFFF'}
                  ios_backgroundColor="#E5E7EB"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Email Section */}
        <View style={styles.addEmailContainer}>
          {/* Mailbox Icon */}
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
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (email.trim()) {
                console.log('Email added:', email);
                setEmail('');
              } else {
                setShowEmailModal(true);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add Email Modal */}
      <AddEmailModal
        visible={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onAdd={(email) => {
          console.log('Email added:', email);
          setShowEmailModal(false);
        }}
      />

      {/* Change Password Modal */}
      <BottomSheetModal
        visible={showChangePasswordModal}
        onClose={() => {
          setShowChangePasswordModal(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowCurrentPassword(false);
          setShowNewPassword(false);
          setShowConfirmPassword(false);
        }}
        title="Change Password"
        showCloseButton={true}
        scrollable={true}
        height="auto"
        footerContent={
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              console.log('Password changed');
              setShowChangePasswordModal(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.passwordModalContent}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon
                  name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Re-enter New Password */}
          <View style={styles.inputGroup}>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Your password must be</Text>
            <View style={styles.requirementItem}>
              <View style={styles.checkbox} />
              <Text style={styles.requirementText}>Between 8 and 20 characters</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.checkbox} />
              <Text style={styles.requirementText}>1 Upper case letter</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.checkbox} />
              <Text style={styles.requirementText}>1 or more numbers</Text>
            </View>
            <View style={styles.requirementItem}>
              <View style={styles.checkbox} />
              <Text style={styles.requirementText}>1 or more special characters</Text>
            </View>
          </View>
        </View>
      </BottomSheetModal>
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
  optionsContainer: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  optionItem: {
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
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
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
  addEmailContainer: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 20,
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
    marginBottom: 20,
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    width: '100%',
    height: 48,
    backgroundColor: '#0066CC',
    borderRadius: 24,
    justifyContent: 'center',
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
  passwordModalContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1F2937',
    marginBottom: 2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  required: {
    color: '#EF4444',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
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
  eyeIcon: {
    padding: 4,
  },
  requirementsContainer: {
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  requirementText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  saveButton: {
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
  saveButtonText: {
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

export default SecurityScreen;
