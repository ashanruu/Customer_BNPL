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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { callMobileApi } from '../scripts/api';
import { Ionicons } from "@expo/vector-icons";

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
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={22} color="#666" />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>Profile Details</Text>
            {/* <Text style={styles.subText}>View and track your support requests</Text> */}
          </View>
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
            <Text style={styles.sectionTitle}>Personal Information</Text>

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
            <Text style={styles.sectionTitle}>Document Status</Text>
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
    paddingTop: 40,
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
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  titleSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  profileSection: {
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
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
    color: "#333",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusApproved: {
    backgroundColor: "#E8F5E8",
  },
  statusPending: {
    backgroundColor: "#FFF4E6",
  },
  statusInactive: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
