import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import { callMobileApi, callMerchantApi, fetchCustomerCard, deleteCustomerCard, uploadDocument } from '../scripts/api';
import CustomButton from "../components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

type CustomerDetails = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  planPrice?: string;
  creditLimit?: string;
  planName?: string;
  profileImage?: string;
  avatar?: string;
  planDetails?: string;
  paymentMethod?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardType?: string;
  hasPaymentMethod?: boolean;
  customerId?: string;
  id?: string;
};

type CardData = {
  cardDate: string | undefined;
  cardNumber?: string;
  cardExpiry?: string;
  cardType?: string;
  isActive?: boolean;
  jobId?: string; // Changed from cardId to jobId
  maskedCardNumber?: string;
  expiryDate?: string;
  brand?: string;
  status?: string;
};

type RootStackParamList = {
  UserProfileScreen: undefined;
  PlansScreen: undefined;
  WebViewScreen: { url?: string; jobId?: number };
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [customerPlan, setCustomerPlan] = useState<any>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [removingCard, setRemovingCard] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const [documents, setDocuments] = useState([
    { id: "nic_front", name: "NIC Front Side", date: "", status: "To Upload", type: "nic_front" },
    { id: "nic_back", name: "NIC Back Side", date: "", status: "To Upload", type: "nic_back" },
    { id: "address_proof", name: "Address Proof Document", date: "", status: "To Upload", type: "address_proof" },
    { id: "salary_slip", name: "Salary Slip", date: "", status: "To Upload", type: "salary_slip" },
  ]);

  // Fetch customer details when component mounts
  useEffect(() => {
    fetchCustomerDetails();
    fetchCustomerPlan();
  }, []);

  // Fetch card data when customer details are loaded
  useEffect(() => {
    if (customerDetails && (customerDetails.customerId || customerDetails.id)) {
      fetchCardData();
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
        Alert.alert("Error", "Failed to load customer details");
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer plan details
  const fetchCustomerPlan = async () => {
    try {
      setPlanLoading(true);
      console.log("Fetching customer plan...");

      const response = await callMobileApi(
        'GetCustomerPlanByCustomerId',
        {},
        'mobile-app-customer-plan',
        '',
        'customer'
      );

      console.log("=== FULL GetCustomerPlanByCustomerId RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      if (response.statusCode === 200) {
        setCustomerPlan(response.data);
        console.log("Customer plan loaded successfully");
      } else {
        console.warn("Failed to fetch customer plan:", response.message);
      }
    } catch (error) {
      console.error("Error fetching customer plan:", error);
    } finally {
      setPlanLoading(false);
    }
  };

  // Fetch customer card data
  const fetchCardData = async () => {
    try {
      setCardLoading(true);
      console.log("Fetching customer card data...");

      // Get customer ID from customerDetails or AsyncStorage
      const customerId = customerDetails?.customerId || customerDetails?.id;

      if (!customerId) {
        console.warn("No customer ID available for card fetch");
        return;
      }

      const response = await fetchCustomerCard(customerId);

      console.log("=== FULL GetCusCard RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      if (response.statusCode === 200 && response.data) {
        setCardData(response.data);
        console.log("Customer card data loaded successfully");
      } else {
        console.warn("No card data found or failed to fetch:", response.message);
        setCardData(null);
      }
    } catch (error) {
      console.error("Error fetching customer card:", error);
      setCardData(null);
    } finally {
      setCardLoading(false);
    }
  };

  // Handle payment method onboarding
  const handleAddPaymentMethod = async () => {
    try {
      setOnboardingLoading(true);
      console.log("Creating onboard job...");

      const response = await callMobileApi(
        'CreateOnBoardJob',
        {},
        'mobile-app-onboard-job',
        '',
        'payment'
      );

      console.log("CreateOnBoardJob response:", response);

      if (response.statusCode === 200) {
        const jobId = response.data; // Extract job ID from response
        console.log("Onboard job created successfully with ID:", jobId);

        // Construct the URL with job ID
        const paymentUrl = `https://hexdive.com/dpay.php?jobid=${jobId}`;
        console.log("Payment URL:", paymentUrl);

        Alert.alert("Success", "Payment method onboarding initiated successfully", [
          {
            text: "OK",
            onPress: () => navigation.navigate("WebViewScreen", {
              url: paymentUrl,
              jobId: jobId
            })
          }
        ]);
      } else {
        console.error("Failed to create onboard job:", response.message);
        Alert.alert("Error", response.message || "Failed to initiate payment method setup");
      }
    } catch (error: any) {
      console.error("CreateOnBoardJob error:", error);
      const errorMessage = error.response?.data?.message || "Failed to initiate payment method setup. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Handle removing payment method
  const handleRemovePaymentMethod = () => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setRemovingCard(true);
              console.log("Removing payment method...");

              // Get job ID from card data
              const jobId = cardData?.jobId;
              console.log("Job ID for card removal:", jobId);

              if (!jobId) {
                Alert.alert("Error", "Job ID not found. Please try again.");
                return;
              }

              // Call the API to remove payment method
              const response = await deleteCustomerCard(jobId);

              if (response.statusCode === 200) {
                // Successfully removed - update local state
                setCardData(null);
                setCustomerDetails(prev => prev ? { ...prev, hasPaymentMethod: false } : null);

                Alert.alert("Success", "Payment method removed successfully");
                console.log("Payment method removed successfully");
              } else {
                // Handle API error response
                const errorMessage = response.message || "Failed to remove payment method";
                Alert.alert("Error", errorMessage);
                console.error("Failed to remove payment method:", response);
              }
            } catch (error: any) {
              console.error("Error removing payment method:", error);

              // Handle different types of errors
              let errorMessage = "Failed to remove payment method. Please try again.";

              if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
              } else if (error.message) {
                errorMessage = error.message;
              }

              Alert.alert("Error", errorMessage);
            } finally {
              setRemovingCard(false);
            }
          }
        }
      ]
    );
  };

  // Handle document upload
  const handleDocumentUpload = (documentId: string, documentName: string) => {
    Alert.alert(
      "Upload Document",
      `Select how you want to upload your ${documentName}`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Choose Image",
          onPress: () => pickImage(documentId, documentName)
        },
        {
          text: "Choose PDF",
          onPress: () => pickDocument(documentId, documentName)
        }
      ]
    );
  };

  // Pick image from gallery
  const pickImage = async (documentId: string, documentName: string) => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocumentFile(documentId, documentName, result.assets[0].uri, 'image');
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Pick PDF document
  const pickDocument = async (documentId: string, documentName: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadDocumentFile(documentId, documentName, result.assets[0].uri, 'pdf');
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  };

  // Upload document to server
  const uploadDocumentFile = async (documentId: string, documentName: string, uri: string, type: 'image' | 'pdf') => {
    try {
      setUploadingDocId(documentId);
      console.log(`Uploading ${documentName} (${type}):`, uri);

      // Convert file to base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Add data URI prefix based on file type
      const mimeType = type === 'pdf' ? 'application/pdf' : 'image/jpeg';
      const documentBase64 = `data:${mimeType};base64,${base64}`;

      // Find document type from documents array
      const documentItem = documents.find(doc => doc.id === documentId);
      const documentType = documentItem?.type || documentId;

      // Generate filename based on document type and file type
      const fileExtension = type === 'pdf' ? 'pdf' : 'jpg';
      const fileName = `${documentType}.${fileExtension}`;

      // Call the upload API
      const response = await uploadDocument(documentBase64, documentType, fileName);

      if (response.statusCode === 200) {
        // Update document status locally
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === documentId 
              ? { ...doc, status: "Submitted", date: new Date().toLocaleDateString() }
              : doc
          )
        );

        Alert.alert(
          "Success", 
          `${documentName} uploaded successfully!`
        );
        console.log(`Document ${documentId} uploaded successfully`);
      } else {
        throw new Error(response.message || 'Upload failed');
      }

    } catch (error: any) {
      console.error("Error uploading document:", error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to upload ${documentName}`;
      Alert.alert("Upload Error", errorMessage);
    } finally {
      setUploadingDocId(null);
    }
  };

  // Helper function to get customer name
  const getCustomerName = () => {
    if (customerDetails) {
      return customerDetails.firstName && customerDetails.lastName
        ? `${customerDetails.firstName} ${customerDetails.lastName}`
        : customerDetails.name || customerDetails.firstName || customerDetails.lastName || "Customer";
    }
    return "N/A"; // fallback
  };

  // Helper function to get customer email
  const getCustomerEmail = () => {
    return customerDetails?.email || "N/A"; // fallback
  };

  // Helper function to get plan details
  const getPlanPrice = () => {
    if (customerPlan) {
      return `Rs. ${customerPlan.creditLimit?.toLocaleString() || customerPlan.planPrice?.toLocaleString() || '0'}`;
    }
    return customerDetails?.planPrice || customerDetails?.creditLimit || "Rs. 300,000";
  };

  // Helper function to get plan name
  const getPlanName = () => {
    if (customerPlan) {
      return customerPlan.planName || customerPlan.planTitle || customerPlan.name || "Premium Plan";
    }
    return customerDetails?.planName || "Plan";
  };

  // Helper function to get plan details
  const getPlanDetails = () => {
    if (customerPlan) {
      const details = [];

      if (customerPlan.creditLimit) {
        details.push(`Credit Limit: Rs. ${customerPlan.creditLimit.toLocaleString()}`);
      }

      if (customerPlan.interestRate) {
        details.push(`Interest Rate: ${customerPlan.interestRate}%`);
      }

      if (customerPlan.maxInstallments) {
        details.push(`Max Installments: ${customerPlan.maxInstallments}`);
      }

      if (customerPlan.planFeatures) {
        details.push(customerPlan.planFeatures);
      }

      return details.length > 0 ? details.join(' • ') : "Premium features included";
    }
    return customerDetails?.planDetails || "Premium features included";
  };

  // Helper function to get plan status
  const getPlanStatus = () => {
    if (customerPlan) {
      return customerPlan.status || customerPlan.planStatus || "Active";
    }
    return "Active";
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    return customerDetails?.profileImage || customerDetails?.avatar || "https://randomuser.me/api/portraits/men/17.jpg"; // fallback
  };

  // Helper function to get payment method data from API response
  const getPaymentMethodData = () => {
    if (!cardData) {
      return null;
    }

    // Map API response to expected format
    return {
      cardNumber: cardData.maskedCardNumber || cardData.cardNumber || "**** **** **** ****",
      cardExpiry: cardData.cardDate || cardData.expiryDate || cardData.cardExpiry || "**/**",
      cardType: cardData.brand || cardData.cardType || "CARD",
      isActive: cardData.isActive || cardData.status === 'active' || true,
      jobId: cardData.jobId // Use jobId instead of cardId
    };
  };

  const paymentData = getPaymentMethodData();

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      {(loading || planLoading || cardLoading) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#20222E" />
        </View>
      )}

      {/* Top Profile Section */}
      <View style={styles.topSection}>
        <View style={styles.headerBackground} />

        {/* Profile Card Content */}
        <View style={styles.profileContent}>
          <Image
            source={{ uri: getAvatarUrl() }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{getCustomerName()}</Text>
            <Text style={styles.profileSubtitle}>Joined since 2023</Text>
          </View>
          <CustomButton
            title="Edit Profile"
            size="small"
            variant="outline"
            onPress={() => navigation.navigate("UserProfileScreen")}
          />
          {/* <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigation.navigate("UserProfileScreen")}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity> */}
        </View>
      </View>


      {/* Plan Section */}
      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleContainer}>
            <Text style={styles.planTitle}>{getPlanName()}</Text>
            <View style={[styles.planStatusBadge]}>
              <Text style={styles.planStatusText}>{getPlanStatus()}</Text>
            </View>
          </View>
          {planLoading && (
            <ActivityIndicator size="small" color="#fff" />
          )}
        </View>

        <Text style={styles.planPrice}>{getPlanPrice()}</Text>

        <Text style={styles.planDetails}>
          {getPlanDetails()}
        </Text>

        {customerPlan?.validUntil && (
          <Text style={styles.planExpiry}>
            Valid until: {new Date(customerPlan.validUntil).toLocaleDateString()}
          </Text>
        )}


      </View>

      {/* Scrollable Area for Payment + Documents */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {cardLoading ? (
            <View style={styles.cardLoadingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingText}>Loading payment methods...</Text>
            </View>
          ) : paymentData ? (
            // Show existing card AND add button
            <View>
              <View style={styles.cardContainer}>
                <View style={styles.debitCard}>
                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardNumber}>{paymentData.cardNumber}</Text>

                    {/* Active Tag - After Card Number */}
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>
                        {paymentData.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.cardInfoRow}>
                        <View style={styles.cardTypeContainer}>
                          <Text style={styles.cardTypeLabel}>Card Type</Text>
                          <Text style={styles.cardValue}>{paymentData.cardType}</Text>
                        </View>
                        <View style={styles.expiryContainer}>
                          <Text style={styles.expiryLabel}>Exp Date</Text>
                          <Text style={styles.cardValue}>{paymentData.cardExpiry}</Text>
                        </View>
                      </View>

                      {/* Remove Button - Bottom Right */}
                      <TouchableOpacity
                        style={[styles.removeBtn, removingCard && styles.disabledBtn]}
                        onPress={handleRemovePaymentMethod}
                        disabled={removingCard}
                      >
                        {removingCard ? (
                          <ActivityIndicator size="small" color="#666" />
                        ) : (
                          <Text style={styles.removeBtnText}>Remove</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Add New Payment Method Button */}
              <TouchableOpacity
                style={[styles.addPaymentBtn, styles.addPaymentBtnWithCard, onboardingLoading && styles.disabledBtn]}
                onPress={handleAddPaymentMethod}
                disabled={onboardingLoading}
              >
                <View style={styles.addPaymentBtnContent}>
                  {onboardingLoading ? (
                    <ActivityIndicator size="small" color="#666" style={{ marginRight: 8 }} />
                  ) : (
                    <Text style={styles.addPaymentIcon}>+</Text>
                  )}
                  <Text style={styles.addPaymentText}>
                    {onboardingLoading ? "Setting up..." : "Add New Payment Method"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            // Show add payment method only
            <View style={styles.noCardContainer}>
              <View style={styles.noCardContent}>
                <Text style={styles.noCardTitle}>No Payment Method Added</Text>
                <Text style={styles.noCardSubtitle}>
                  Add a payment method to make purchases easier
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.addPaymentBtn, onboardingLoading && styles.disabledBtn]}
                onPress={handleAddPaymentMethod}
                disabled={onboardingLoading}
              >
                <View style={styles.addPaymentBtnContent}>
                  {onboardingLoading ? (
                    <ActivityIndicator size="small" color="#666" style={{ marginRight: 8 }} />
                  ) : (
                    <Text style={styles.addPaymentIcon}>+</Text>
                  )}
                  <Text style={styles.addPaymentText}>
                    {onboardingLoading ? "Setting up..." : "Add New Payment Method"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Documents */}
        <View style={styles.docCard}>
          <Text style={styles.sectionTitle}>My Documents</Text>

          {documents.map((item, index) => (
            <View key={item.id} style={styles.docRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.docName}>{item.name}</Text>
                {item.date && <Text style={styles.docDate}>{item.date}</Text>}
              </View>
              <View>
                {item.status === "To Upload" ? (
                  <TouchableOpacity
                    style={[styles.statusBadge, styles.toUpload, styles.uploadButton]}
                    onPress={() => handleDocumentUpload(item.id, item.name)}
                    disabled={uploadingDocId === item.id}
                  >
                    {uploadingDocId === item.id ? (
                      <ActivityIndicator size="small" color="#8B4513" />
                    ) : (
                      <Text style={styles.uploadButtonText}>
                        {item.status}
                      </Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={[styles.statusBadge, styles.submitted]}
                  >
                    {item.status}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  topSection: {
    marginBottom: 30,
    position: 'relative',
  },
  headerBackground: {
    backgroundColor: 'rgba(32, 34, 46, 1)',
    height: 100,
    borderBottomRightRadius: 15,
  },
  profileContent: {
    position: 'absolute',
    top: 30,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  planCard: {
    backgroundColor: 'rgba(32, 34, 46, 1)',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planStatusBadge: {
    backgroundColor: '#444',
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginLeft: 10,
    borderRadius: 8
  },
  planStatusText: {
    color: '#fff'
  },
  planExpiry: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
  },
  planTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  planPrice: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginVertical: 8,
  },
  planDetails: {
    color: "#eee",
    marginBottom: 10,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  paymentCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  cardContainer: {
    position: 'relative',
  },
  debitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
    position: 'relative',
  },
  activeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  activeTagText: {
    color: '#2D5016',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    marginTop: 16,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  cardNumber: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardTypeContainer: {
    alignItems: 'flex-start',
  },
  cardTypeLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  noCardContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCardContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  noCardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  noCardSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  addPaymentBtn: {
    borderWidth: 1,
    borderColor: '#666',
    borderStyle: 'dashed',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  addPaymentBtnWithCard: {
    marginTop: 15,
  },
  addPaymentBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPaymentIcon: {
    fontSize: 18,
    fontWeight: '500',
    color: "#666",
    marginRight: 8,
  },
  addPaymentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  docCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  docName: {
    fontSize: 14,
    fontWeight: "500",
  },
  docDate: {
    fontSize: 12,
    color: "#777",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "500",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: "hidden",
    textAlign: "center",
    alignSelf: "flex-start",
  },
  submitted: {
    backgroundColor: "#E8F5E8",
    color: "#2D5016",
  },
  toUpload: {
    backgroundColor: "#FFF4E6",
    color: "#8B4513",
  },
  removeBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  removeBtnText: {
    color: '#fa828eff',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  cardLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  uploadButton: {
    // Make it look more clickable
    borderWidth: 1,
    borderColor: '#8B4513',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  uploadButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B4513",
  },
});
