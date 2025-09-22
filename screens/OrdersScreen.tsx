import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { callMobileApi } from "../scripts/api";

const OrdersScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ongoing" | "history" | "cancelled">("ongoing");
  const [loanData, setLoanData] = useState<{
    activeLoans: any[];
    completedLoans: any[];
    returnedLoans: any[];
  }>({
    activeLoans: [],
    completedLoans: [],
    returnedLoans: []
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Fetch loan list data
  const fetchLoanList = async () => {
    try {
      setLoading(true);
      console.log("Fetching loan list...");
      
      const response = await callMobileApi(
        'GetLoanList',
        {},
        'mobile-app-loan-list',
        '',
        'payment'
      );

      console.log("=== FULL GetLoanList RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      // Log response structure details
      console.log("Response keys:", Object.keys(response));
      console.log("Response statusCode:", response.statusCode);
      console.log("Response message:", response.message);
      
      if (response.data) {
        console.log("Response.data keys:", Object.keys(response.data));
        console.log("Response.data:", JSON.stringify(response.data, null, 2));
        
        if (response.data.activeLoans) {
          console.log("Active loans count:", response.data.activeLoans.length);
          console.log("Active loans structure:", JSON.stringify(response.data.activeLoans, null, 2));
        }
        
        if (response.data.completedLoans) {
          console.log("Completed loans count:", response.data.completedLoans.length);
          console.log("Completed loans structure:", JSON.stringify(response.data.completedLoans, null, 2));
        }
        
        if (response.data.returnedLoans) {
          console.log("Returned loans count:", response.data.returnedLoans.length);
          console.log("Returned loans structure:", JSON.stringify(response.data.returnedLoans, null, 2));
        }
      }

      if (response.statusCode === 200) {
        const responseData = response.data || {};
        const loans = {
          activeLoans: Array.isArray(responseData.activeLoans) ? responseData.activeLoans : [],
          completedLoans: Array.isArray(responseData.completedLoans) ? responseData.completedLoans : [],
          returnedLoans: Array.isArray(responseData.returnedLoans) ? responseData.returnedLoans : []
        };
        
        setLoanData(loans);
        console.log("Loan list loaded successfully:");
        console.log("- Active loans:", loans.activeLoans.length);
        console.log("- Completed loans:", loans.completedLoans.length);
        console.log("- Returned loans:", loans.returnedLoans.length);
      } else {
        console.error('Failed to fetch loan list:', response.message);
        Alert.alert('Error', 'Failed to load orders. Please try again.');
        setLoanData({ activeLoans: [], completedLoans: [], returnedLoans: [] });
      }
    } catch (error: any) {
      console.error('GetLoanList error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to load orders. Please try again.');
      setLoanData({ activeLoans: [], completedLoans: [], returnedLoans: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanList();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchLoanList();
    }, [])
  );

  const handlePress = (item: any) => {
    if (activeTab === "ongoing") {
      navigation.navigate("DetailsScreen", { order: item });
    } else if (activeTab === "history") {
      navigation.navigate("HistoryDetails", { order: item });
    } else {
      navigation.navigate("CancelledDetails", { order: item });
    }
  };

  const renderCard = ({ item }: any) => (
    <View style={styles.orderWrapper}>
      <Text style={styles.date}>
        {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : 'N/A'}
      </Text>
      <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <Text style={styles.orderName}>
            Loan #{item.loanId || 'Unknown'}
          </Text>
          <Text style={styles.details}>
            {item.loanStatus || 'Status Unknown'} • {item.noOfInstallments || 0} Installments
          </Text>
          <Text style={styles.subDetails}>
            Down Payment: Rs. {item.downPaymentet?.toLocaleString() || '0'}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            Rs. {item.totLoanValue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.creditValue}>
            Credit: Rs. {item.totCreditValue?.toLocaleString() || '0'}
          </Text>
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={20} color="#C1C1C1" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Filter data based on active tab and loan status
  const getFilteredData = () => {
    // Combine all loans from all categories
    const allLoans = [
      ...(loanData.activeLoans || []),
      ...(loanData.completedLoans || []),
      ...(loanData.returnedLoans || [])
    ];

    switch (activeTab) {
      case "ongoing":
        return allLoans.filter(item => 
          item.loanStatus === 'Active'  // Shows Active status loans
        );
      case "history":
        return allLoans.filter(item => 
          item.loanStatus === 'Completed'  // Shows Completed status loans
        );
      case "cancelled":
        return allLoans.filter(item => 
          item.loanStatus === 'Returned'  // Shows Returned status loans
        );
      default:
        return [];
    }
  };

  const data = getFilteredData();

  return (
    <View style={styles.screenContainer}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>

          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.subText}>Track your loans and payment history</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
            onPress={() => setActiveTab("ongoing")}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === "ongoing" && styles.activeTabText,
            ]}>
              Ongoing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}>
              History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "cancelled" && styles.activeTab]}
            onPress={() => setActiveTab("cancelled")}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === "cancelled" && styles.activeTabText,
            ]}>
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2C2C2E" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          /* List */
          <FlatList
            data={data}
            renderItem={renderCard}
            keyExtractor={(item, index) => item.id?.toString() || item.loanId?.toString() || index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="receipt-outline" size={64} color="#E5E5E7" />
                </View>
                <Text style={styles.emptyText}>
                  {activeTab === "ongoing" ? "No ongoing orders" : 
                   activeTab === "history" ? "No order history" : "No cancelled orders"}
                </Text>
                <Text style={styles.emptySubtext}>
                  {activeTab === "ongoing" ? "Your active loans will appear here" :
                   activeTab === "history" ? "Your completed orders will appear here" : 
                   "Your cancelled orders will appear here"}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 22,
  },
  titleSection: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  tabContainer: { 
    flexDirection: "row", 
    backgroundColor: "#F2F2F7", 
    borderRadius: 12, 
    padding: 3, 
    marginBottom: 24,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: "center", 
    borderRadius: 9,
  },
  activeTab: { 
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: "#8E8E93",
    letterSpacing: -0.2,
  },
  activeTabText: { 
    color: "#2C2C2E",
  },
  listContainer: {
    paddingBottom: 20,
  },
  orderWrapper: {
    marginBottom: 16,
  },
  card: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    backgroundColor: "#FFFFFF", 
    paddingVertical: 20,
    paddingHorizontal: 16, 
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  cardContent: {
    flex: 1,
  },
  orderName: { 
    fontSize: 17, 
    fontWeight: "600", 
    marginBottom: 6,
    color: "#2C2C2E",
    letterSpacing: -0.2,
  },
  details: { 
    fontSize: 15, 
    color: "#6D6D70", 
    marginBottom: 6,
    lineHeight: 20,
  },
  subDetails: { 
    fontSize: 13, 
    color: "#8E8E93",
  },
  date: { 
    fontSize: 13, 
    color: "#8E8E93", 
    marginBottom: 8, 
    marginLeft: 4,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  priceContainer: { 
    alignItems: 'flex-end',
  },
  price: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#2C2C2E",
    marginBottom: 4,
  },
  creditValue: { 
    fontSize: 12, 
    color: "#8E8E93", 
    marginBottom: 8,
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#8E8E93',
    fontWeight: '500',
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyText: { 
    fontSize: 20,
    fontWeight: '600',
    color: '#6D6D70',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});
