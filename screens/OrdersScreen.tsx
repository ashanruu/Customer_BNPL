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
  const navigation = useNavigation<any>();

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
        
        // Log loan statuses for debugging (Active, Clossed, Returned)
        const allLoans = [...loans.activeLoans, ...loans.completedLoans, ...loans.returnedLoans];
        const statusCounts = allLoans.reduce((acc, loan) => {
          const status = loan.loanStatus || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log("Loan status distribution:", statusCounts);
        console.log("Expected statuses: Active (Ongoing), Closed (History), Returned (Cancelled)");
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
        {/* Left Border Line */}
        <View style={[styles.leftBorderLine, getLeftBorderStyle(item.loanStatus)]} />
        
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Loan Value with Status Dot */}
          <View style={styles.loanAmountRow}>
            <Text style={styles.loanAmount}>
              Rs. {item.totLoanValue?.toFixed(2) || '0.00'}
            </Text>
            <View style={[styles.statusDot, getStatusDotStyle(item.loanStatus)]} />
          </View>
          
          {/* Product Name with Plan Tag */}
          <View style={styles.productNameMainContainer}>
            <View style={styles.productNameWithTag}>
              <Text style={styles.productNameMain}>
                {item.productName || 'iPhone 15 Pro'}
              </Text>
              <View style={styles.planTag}>
                <Text style={styles.planTagText}>
                  {item.planType || 'Premium'}
                </Text>
              </View>
            </View>
          </View>

          {/* Credit and Installments Info */}
          <View style={styles.loanDetailsRow}>
            <Text style={styles.creditInfo}>
              Due Amount : Rs. {item.totCreditValue?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.installmentInfo}>
              {(() => {
                const totalInstallments = item.noOfInstallments || 0;
                // Dummy logic for completed installments based on status
                let completedInstallments = 0;
                completedInstallments = 2;
                
                return `( ${completedInstallments}/${totalInstallments} )`;
              })()}
            </Text>
          </View>
        </View>

        {/* Right Side - Next Payment and Arrow */}
        <View style={styles.rightSection}>
          <View style={styles.downPaymentContainer}>
            <Text style={styles.downPaymentLabel}>Next Payment</Text>
            <Text style={styles.downPaymentAmount}>
              {(() => {
                // Dummy next payment date logic
                const today = new Date();
                const nextPaymentDate = new Date(today);
                nextPaymentDate.setDate(today.getDate() + 30); // 30 days from today
                return nextPaymentDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              })()}
            </Text>
          </View>
          
          {/* Arrow indicator */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Add helper function for left border styling
  const getLeftBorderStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.activeBorderLine;
      case 'clossed':
        return styles.closedBorderLine;
      case 'returned':
        return styles.returnedBorderLine;
      default:
        return styles.defaultBorderLine;
    }
  };

  // Add helper function for status dot styling
  const getStatusDotStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.activeStatusDot;
      case 'clossed':
        return styles.closedStatusDot;
      case 'returned':
        return styles.returnedStatusDot;
      default:
        return styles.defaultStatusDot;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return styles.activeStatusText;
      case 'clossed':
        return styles.closedStatusText;
      case 'returned':
        return styles.returnedStatusText;
      default:
        return styles.defaultStatusText;
    }
  };

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
          item.loanStatus === 'Clossed'  // Shows only Clossed status loans
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
    backgroundColor: "rgba(255,255,255,0.95)", // lowered opacity
    paddingTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)", // lowered opacity
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
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    //backgroundColor: "rgba(242,242,247,0.25)",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: 'hidden',
    position: 'relative',
  },

  // Left border line styles
  leftBorderLine: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    height: '30%',
    alignSelf: 'center',
  },

  // Border colors for different statuses
  activeBorderLine: {
    backgroundColor: '#000000',
  },
  
  completedBorderLine: {
    backgroundColor: '#2196F3',
  },
  
  closedBorderLine: {
    backgroundColor: '#4CAF50',
  },
  
  returnedBorderLine: {
    backgroundColor: '#F44336',
  },
  
  defaultBorderLine: {
    backgroundColor: '#9E9E9E',
  },

  cardContent: {
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 12,
  },

  // New style for loan amount row with status dot
  loanAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  loanAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: 8,
  },

  // Product name as main element - more prominent
  productNameMainContainer: {
    marginBottom: 8,
  },

  // New styles for product name with tag
  productNameWithTag: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  productNameMain: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
    lineHeight: 20,
    marginRight: 8,
  },

  planTag: {
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  planTagText: {
    fontSize: 11,
    color: '#2C2C2E',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Status dot styles
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  // Status dot colors
  activeStatusDot: {
    backgroundColor: '#4CAF50',
  },
  
  completedStatusDot: {
    backgroundColor: '#2196F3',
  },
  
  closedStatusDot: {
    backgroundColor: '#4CAF50',
  },
  
  returnedStatusDot: {
    backgroundColor: '#F44336',
  },
  
  defaultStatusDot: {
    backgroundColor: '#9E9E9E',
  },

  // Status text colors
  activeStatusText: {
    color: '#4CAF50',
  },
  
  completedStatusText: {
    color: '#2196F3',
  },
  
  closedStatusText: {
    color: '#4CAF50',
  },
  
  returnedStatusText: {
    color: '#F44336',
  },
  
  defaultStatusText: {
    color: '#9E9E9E',
  },

  loanDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 6,
  },

  creditInfo: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },

  installmentInfo: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
    marginLeft: 12,
  },

  rightSection: {
    paddingRight: 16,
    paddingLeft: 8,
    paddingTop: 18,
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },

  downPaymentContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },

  downPaymentLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  downPaymentAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
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
  date: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: -0.1,
    textAlign: 'center',
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

  arrowContainer: {
    marginTop: 0,
    alignItems: 'center',
  },

  // Remove these old styles as they're no longer needed:
  // planProductRow, planTypeContainer, planTypeLabel, planTypeValue
  // productNameContainer, productNameLabel, productNameValue

  // ...rest of existing styles...
});
