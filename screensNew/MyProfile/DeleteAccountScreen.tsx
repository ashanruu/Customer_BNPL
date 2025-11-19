import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenTemplate from '../../components/ScreenTemplate';
import BottomSheetModal from '../../components/BottomSheetModal';

const DeleteAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setShowDeleteModal(false);
    
    // TODO: Implement actual account deletion logic
    console.log('Delete account confirmed');
    
    // Simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      // Navigate to login or show confirmation
    }, 2000);
  };

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      topTitle="Permanently remove your profile..."
      mainTitle="Delete Your Account"
      buttonText="Delete account"
      onButtonPress={handleDeleteAccount}
      buttonDisabled={isDeleting}
      buttonLoading={isDeleting}
      scrollable={true}
      backgroundColor="#FFFFFF"
      buttonColor="#0066CC"
    >
      <View style={styles.container}>
        {/* Warning Message */}
        <Text style={styles.warningText}>
          Deleting your account will permanently remove your profile, payment history, and linked payment methods from our system.
        </Text>

        {/* Before Proceeding Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Before proceeding, please make sure:</Text>
          
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>All your payments and installments are fully settled</Text>
            </View>
            
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You've withdrawn or cleared any refunds or pending balances
              </Text>
            </View>
          </View>
        </View>

        {/* Once Deleted Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Once deleted, you won't be able to recover your data or use this mobile number or NIC to sign in again.</Text>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <BottomSheetModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete account"
        showCloseButton={true}
        height="auto"
        contentPadding={24}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Are you sure you want to delete your account?
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleConfirmDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginRight: 8,
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  modalContent: {
    alignItems: 'center',
  },
  modalText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  deleteButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#DC2626',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 4 },
        //shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  deleteButtonText: {
    fontSize: 16,
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
});

export default DeleteAccountScreen;
