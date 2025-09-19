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
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from '@react-navigation/stack';
import { callMobileApi, callMerchantApi } from '../scripts/api';

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
};
type RootStackParamList = {
  UserProfileScreen: undefined;
  PlansScreen: undefined;
  WebViewScreen: { url?: string; jobId?: number };
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  const documents = [
    { id: "1", name: "NIC", date: "18 Aug 6:30 pm", status: "Submitted" },
    { id: "2", name: "Pay Slip", date: "17 Aug 9:23 pm", status: "To Upload" },
    { id: "3", name: "Utility bills", date: "16 Aug 10:43 am", status: "Submitted" },
  ];

  // Fetch customer details when component mounts
  useEffect(() => {
    fetchCustomerDetails();
  }, []);

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
    return customerDetails?.planPrice || customerDetails?.creditLimit || "$300000"; // fallback
  };

  // Helper function to get plan name
  const getPlanName = () => {
    return customerDetails?.planName || "Plan"; // fallback
  };

  // Helper function to get avatar URL
  const getAvatarUrl = () => {
    return customerDetails?.profileImage || customerDetails?.avatar || "https://randomuser.me/api/portraits/men/17.jpg"; // fallback
  };

  // Mock payment method data - replace with actual API data
  const getPaymentMethodData = () => {
    // Check if customer has payment method (you can get this from API)
    const hasCard = customerDetails?.hasPaymentMethod || false; // Set to true to test card display
    
    if (hasCard) {
      return {
        cardNumber: customerDetails?.cardNumber || "**** **** **** 1234",
        cardExpiry: customerDetails?.cardExpiry || "12/26",
        cardType: customerDetails?.cardType || "VISA",
        cardholderName: getCustomerName().toUpperCase(),
      };
    }
    return null;
  };

  const paymentData = getPaymentMethodData();

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#20222E" />
        </View>
      )}

      {/* Name Section */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: getAvatarUrl() }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{getCustomerName()}</Text>
          <Text style={styles.email}>{getCustomerEmail()}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate("UserProfileScreen")}
        >
          <Text style={styles.editText}>View Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Plan Section */}
      <LinearGradient colors={["#20222E", "#090B1A"]} style={styles.planCard}>
        <Text style={styles.planTitle}>{getPlanName()}</Text>
        <Text style={styles.planPrice}>{getPlanPrice()}</Text>
        <Text style={styles.planDetails}>
          {customerDetails?.planDetails || "xxxxxxxxxxxxx Other Details"}
        </Text>
        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => navigation.navigate("PlansScreen")} 
        >
          <Text style={styles.upgradeText}>Upgrade</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Scrollable Area for Payment + Documents */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {paymentData ? (
            // Show existing card
            <View style={styles.cardContainer}>
              <LinearGradient 
                colors={["#1e3c72", "#2a5298"]} 
                style={styles.debitCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Card Type Logo */}
                <View style={styles.cardHeader}>
                  <Text style={styles.cardType}>{paymentData.cardType}</Text>
                  <View style={styles.cardChip} />
                </View>
                
                {/* Card Number */}
                <Text style={styles.cardNumber}>{paymentData.cardNumber}</Text>
                
                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel}>CARDHOLDER NAME</Text>
                    <Text style={styles.cardValue}>{paymentData.cardholderName}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardValue}>{paymentData.cardExpiry}</Text>
                  </View>
                </View>
              </LinearGradient>
              
              {/* Edit Button */}
              <TouchableOpacity 
                style={styles.editCardBtn}
                onPress={() => navigation.navigate("WebViewScreen", { 
                  url: undefined, 
                  jobId: undefined 
                })}
              >
                <Text style={styles.editCardText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Show add payment method
            <View style={styles.noCardContainer}>
              <View style={styles.noCardContent}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>💳</Text>
                </View>
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
                    <ActivityIndicator size="small" color="#FF4444" style={{ marginRight: 8 }} />
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
                <Text style={styles.docDate}>{item.date}</Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.statusBadge,
                    item.status === "Submitted"
                      ? styles.submitted
                      : styles.toUpload,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Other Document Upload</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    backgroundColor: "#20222E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editText: {
    fontSize: 12,
    color: "#ffffffff",
  },
  planCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
  upgradeBtn: {
    backgroundColor: "#ffb347",
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    color: "#242424ff",
    fontWeight: "600",
  },
  scrollArea: {
    flex: 1,
  },
  paymentCard: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  cardContainer: {
    position: 'relative',
  },
  debitCard: {
    borderRadius: 12,
    padding: 20,
    height: 200,
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardType: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardChip: {
    width: 35,
    height: 25,
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 2,
    marginTop: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    color: '#E0E0E0',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 5,
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editCardBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editCardText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noCardContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noCardContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardIconText: {
    fontSize: 24,
  },
  noCardTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FF4444",
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  addPaymentBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPaymentIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: "#FF4444",
    marginRight: 8,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4444",
  },
  docCard: {  },    fontSize: 16,    fontWeight: "600",    textAlign: "center",    color: "#fff",  uploadBtn: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  uploadText: {
    color: "#555",
    fontWeight: "600",
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
    fontSize: 12,
    width: 90,
    fontWeight: "600",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    overflow: "hidden",
    textAlign: "center",
  },
  submitted: {
    backgroundColor: "#c7c7c7ff",
    color: "#fff",
  },
  toUpload: {
    backgroundColor: "#f5f5f5ff",
    color: "#585858ff",
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
