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
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.date}>
        {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : 'N/A'}
      </Text>
      <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
        <View>
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
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ongoing" && styles.activeTab]}
          onPress={() => setActiveTab("ongoing")}
        >
          <Text style={[styles.tabText, activeTab === "ongoing" && styles.activeTabText]}>
            Ongoing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "cancelled" && styles.activeTab]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text style={[styles.tabText, activeTab === "cancelled" && styles.activeTabText]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        /* List */
        <FlatList
          data={data}
          renderItem={renderCard}
          keyExtractor={(item, index) => item.id?.toString() || item.loanId?.toString() || index.toString()}
          contentContainerStyle={{ paddingVertical: 10 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default OrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  tabContainer: { flexDirection: "row", backgroundColor: "#e6e6e6", borderRadius: 25, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 20 },
  activeTab: { backgroundColor: "#000" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#555" },
  activeTabText: { color: "#fff" },
  card: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    backgroundColor: "#f5f5f5ff", 
    padding: 16, 
    borderRadius: 12 
  },
  orderName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  details: { fontSize: 14, color: "#666", marginBottom: 2 },
  subDetails: { fontSize: 12, color: "#888" },
  date: { fontSize: 13, color: "#999", marginBottom: 6, marginLeft: 4 },
  priceContainer: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: "600", color: "#333" },
  creditValue: { fontSize: 12, color: "#666", marginTop: 2 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#666' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 50 
  },
  emptyText: { 
    fontSize: 16, 
    color: '#999' 
  },
});
