import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { callMobileApi } from '../../scripts/api';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

type CustomerDetails = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  salary?: number;
  customerId?: number;
  kycStatus?: boolean;
  billProofStatus?: boolean;
  salarySlipStatus?: boolean;
  isActive?: boolean;
  createdDate?: string;
};

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("https://randomuser.me/api/portraits/men/17.jpg");
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editablePhone, setEditablePhone] = useState("");
  const [editableAddress, setEditableAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomerDetails();
  }, []);

  useEffect(() => {
    // Initialize editable fields when customer details are loaded
    if (customerDetails) {
      setEditablePhone(customerDetails.phoneNumber || "");
      setEditableAddress(customerDetails.address || "");
    }
  }, [customerDetails]);

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        gestureEnabled: false,
      });
    }, [navigation])
  );

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching customer details...");

      const response = await callMobileApi(
        'GetCustomerDetails',
        {},
        'mobile-app-customer-details',
        '',
        'customer'
      );

      console.log("GetCustomerDetails response:", response);

      if (response.statusCode === 200) {
        setCustomerDetails(response.data);
        console.log("Customer details loaded successfully");
      } else {
        console.warn("Failed to fetch customer details:", response.message);
        Alert.alert(t('common.error'), t('profile.failedToLoadCustomerDetails'));
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      Alert.alert(t('common.error'), t('profile.failedToLoadCustomerDetails'));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(t('profile.permissionRequired'), t('profile.cameraRollPermissionRequired'));
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        // Here you could also upload the image to your server
        console.log("Selected image:", result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(t('common.error'), t('profile.failedToPickImage'));
    }
  };

  const getCustomerName = () => {
    if (customerDetails) {
      return customerDetails.firstName && customerDetails.lastName
        ? `${customerDetails.firstName} ${customerDetails.lastName}`
        : customerDetails.firstName || customerDetails.lastName || t('profile.customer');
    }
    return t('profile.na');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('profile.na');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return t('profile.na');
    }
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return t('profile.na');
    return `$${salary.toFixed(2)}`;
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditablePhone(customerDetails?.phoneNumber || "");
      setEditableAddress(customerDetails?.address || "");
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Here you would typically call an API to update the customer details
      // Example:
      // const response = await callMobileApi(
      //   'UpdateCustomerDetails',
      //   {
      //     phoneNumber: editablePhone,
      //     address: editableAddress
      //   },
      //   'mobile-app-update-customer',
      //   '',
      //   'customer'
      // );

      // For now, we'll just update the local state
      setCustomerDetails(prev => prev ? {
        ...prev,
        phoneNumber: editablePhone,
        address: editableAddress
      } : null);

      setIsEditing(false);
      Alert.alert(t('common.success'), t('userProfile.profileUpdatedSuccessfully'));
      
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert(t('common.error'), t('userProfile.failedToSaveChanges'));
    } finally {
      setSaving(false);
    }
  };

  const InfoItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={20} color="#6B7280" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const EditableInfoItem = ({ 
    icon, 
    label, 
    value, 
    onChangeText, 
    placeholder,
    multiline = false
  }: { 
    icon: string;
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
  }) => (
    <View style={styles.editableInfoItem}>
      <Text style={styles.editableLabel}>{label}</Text>
      <View style={styles.editableInputWrapper}>
        <View style={styles.editableIconContainer}>
          <Ionicons name={icon as any} size={20} color="#bdbdbd" />
        </View>
        <TextInput
          style={[styles.editableInput, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
    </View>
  );

  const StatusBadge = ({ status, type }: { status: boolean, type: string }) => (
    <View style={[styles.statusBadge, status ? styles.statusActive : styles.statusInactive]}>
      <Text style={[styles.statusText, status ? styles.statusActiveText : styles.statusInactiveText]}>
        {status ? t('userProfile.verified') : t('userProfile.pending')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>{t('navigation.profile')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>{t('userProfile.loadingProfile')}</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Profile Header Card - Fixed at top */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={pickImage}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
              {customerDetails?.kycStatus && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>

            <Text style={styles.name}>{getCustomerName()}</Text>
            <Text style={styles.email}>{customerDetails?.email || t('profile.na')}</Text>

            <View style={styles.memberSinceContainer}>
              <Text style={styles.memberSinceText}>
                {t('userProfile.memberSince')} {formatDate(customerDetails?.createdDate)}
              </Text>
            </View>
          </View>

          {/* Scrollable content */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('userProfile.personalInformation')}</Text>
              
              <View style={styles.sectionContent}>
                {isEditing ? (
                  <>
                    <EditableInfoItem
                      icon="call-outline"
                      label={t('userProfile.phoneNumber')}
                      value={editablePhone}
                      onChangeText={setEditablePhone}
                      placeholder={t('userProfile.enterPhoneNumber')}
                    />
                    <EditableInfoItem
                      icon="location-outline"
                      label={t('userProfile.address')}
                      value={editableAddress}
                      onChangeText={setEditableAddress}
                      placeholder={t('userProfile.enterAddress')}
                      multiline={true}
                    />
                  </>
                ) : (
                  <>
                    <InfoItem
                      icon="call-outline"
                      label={t('userProfile.phoneNumber')}
                      value={customerDetails?.phoneNumber || t('userProfile.notProvided')}
                    />
                    <InfoItem
                      icon="location-outline"
                      label={t('userProfile.address')}
                      value={customerDetails?.address || t('userProfile.notProvided')}
                    />
                  </>
                )}
              </View>

              <View style={styles.sectionFooter}>
                <TouchableOpacity
                  onPress={handleEditToggle}
                  style={[styles.editButton, isEditing && styles.cancelButton]}
                  disabled={saving}
                >
                  <Ionicons 
                    name={isEditing ? "close" : "create-outline"} 
                    size={18} 
                    color={isEditing ? "#8B4513" : "#8B4513"} 
                  />
                  <Text style={[styles.editButtonText, isEditing && styles.cancelButtonText]}>
                    {isEditing ? t('common.cancel') : t('common.edit')}
                  </Text>
                </TouchableOpacity>

                {isEditing && (
                  <TouchableOpacity
                    onPress={handleSaveChanges}
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="save-outline" size={18} color="#8B4513" />
                        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Verification Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('userProfile.verificationStatus')}</Text>
              <View style={styles.sectionContent}>
                <View style={styles.verificationItem}>
                  <View style={styles.verificationLeft}>
                    <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                    <Text style={styles.verificationLabel}>{t('userProfile.kycVerification')}</Text>
                  </View>
                  <StatusBadge status={customerDetails?.kycStatus || false} type="kyc" />
                </View>

                <View style={styles.verificationItem}>
                  <View style={styles.verificationLeft}>
                    <Ionicons name="receipt-outline" size={20} color="#6B7280" />
                    <Text style={styles.verificationLabel}>{t('userProfile.billProof')}</Text>
                  </View>
                  <StatusBadge status={customerDetails?.billProofStatus || false} type="bill" />
                </View>

                <View style={styles.verificationItem}>
                  <View style={styles.verificationLeft}>
                    <Ionicons name="wallet-outline" size={20} color="#6B7280" />
                    <Text style={styles.verificationLabel}>{t('userProfile.salarySlip')}</Text>
                  </View>
                  <StatusBadge status={customerDetails?.salarySlipStatus || false} type="salary" />
                </View>
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

export default UserProfileScreen;

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  profileCard: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
  },
  editImageButton: {
    position: "absolute",
    bottom: 2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  memberSinceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memberSinceText: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  verificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  verificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  verificationLabel: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusActive: {
    backgroundColor: "#E8F5E8",
  },
  statusInactive: {
    backgroundColor: "#FFF8F0",
    borderWidth: 1,
    borderColor: "#8B4513",
    borderStyle: "solid",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  statusActiveText: {
    color: "#2D5016",
  },
  statusInactiveText: {
    color: "#8B4513",
  },
  bottomPadding: {
    height: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FFF8F0",
    borderWidth: 1,
    borderColor: "#8B4513",
    borderStyle: "solid",
    minWidth: 90, // Increased from 80 to 90
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#FFF8F0",
    borderColor: "#8B4513",
    borderStyle: "solid",
  },
  editButtonText: {
    fontSize: 12,
    color: "#8B4513",
    fontWeight: "500",
    marginLeft: 4,
  },
  cancelButtonText: {
    color: "#8B4513",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F0",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#8B4513",
    borderStyle: "solid",
    minWidth: 90, // Increased from 80 to 90
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#8B4513",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },

  editableInfoItem: {
    marginBottom: 16,
  },
  editableLabel: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    marginBottom: 8,
  },
  editableInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 12,
    elevation: 2,
    minHeight: 48,
  },
  editableIconContainer: {
    marginRight: 12,
  },
  editableInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: '#000',
    fontWeight: '500',
  },
  multilineInput: {
    minHeight: 80,
    maxHeight: 120,
    paddingVertical: 12,
  },
});
