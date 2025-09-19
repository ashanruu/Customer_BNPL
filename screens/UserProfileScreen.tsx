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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { callMobileApi } from '../scripts/api';

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
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(false);

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
      Alert.alert("Error", "Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = () => {
    if (customerDetails) {
      return customerDetails.firstName && customerDetails.lastName 
        ? `${customerDetails.firstName} ${customerDetails.lastName}`
        : customerDetails.firstName || customerDetails.lastName || "Customer";
    }
    return "N/A";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return "N/A";
    return `$${salary.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#20222E" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/17.jpg" }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{getCustomerName()}</Text>
            <Text style={styles.email}>{customerDetails?.email || "N/A"}</Text>
            
            {/* KYC Status */}
            <View style={styles.kycContainer}>
              {customerDetails?.kycStatus ? (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ KYC Verified</Text>
                </View>
              ) : (
                <View style={styles.unverifiedContainer}>
                  <Text style={styles.unverifiedText}>You should complete KYC verification</Text>
                  <TouchableOpacity style={styles.kycButton} disabled>
                    <Text style={styles.kycButtonText}>KYC Verification Process</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer ID:</Text>
              <Text style={styles.infoValue}>{customerDetails?.customerId || "N/A"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number:</Text>
              <Text style={styles.infoValue}>{customerDetails?.phoneNumber || "N/A"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{customerDetails?.address || "N/A"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Salary:</Text>
              <Text style={styles.infoValue}>{formatSalary(customerDetails?.salary)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since:</Text>
              <Text style={styles.infoValue}>{formatDate(customerDetails?.createdDate)}</Text>
            </View>
          </View>

          {/* Document Status */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Document Status</Text>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Bill Proof:</Text>
              <View style={[styles.statusBadge, customerDetails?.billProofStatus ? styles.statusApproved : styles.statusPending]}>
                <Text style={styles.statusText}>
                  {customerDetails?.billProofStatus ? "Approved" : "Pending"}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Salary Slip:</Text>
              <View style={[styles.statusBadge, customerDetails?.salarySlipStatus ? styles.statusApproved : styles.statusPending]}>
                <Text style={styles.statusText}>
                  {customerDetails?.salarySlipStatus ? "Approved" : "Pending"}
                </Text>
              </View>
            </View>
            
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Account Status:</Text>
              <View style={[styles.statusBadge, customerDetails?.isActive ? styles.statusApproved : styles.statusInactive]}>
                <Text style={styles.statusText}>
                  {customerDetails?.isActive ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#20222E",
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#20222E",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  kycContainer: {
    alignItems: "center",
    width: "100%",
  },
  verifiedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  verifiedText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  unverifiedContainer: {
    alignItems: "center",
  },
  unverifiedText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  kycButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    opacity: 0.6,
  },
  kycButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#20222E",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#20222E",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusApproved: {
    backgroundColor: "#E8F5E8",
  },
  statusPending: {
    backgroundColor: "#FFF3E0",
  },
  statusInactive: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});
