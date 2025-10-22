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
import { callMobileApi } from "../../scripts/api";

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
  const [enrichedLoans, setEnrichedLoans] = useState<{
    activeLoans: any[];
    completedLoans: any[];
    returnedLoans: any[];
  }>({
    activeLoans: [],
    completedLoans: [],
    returnedLoans: []
  });
  const navigation = useNavigation<any>();

  // Fetch detailed loan information for a single loan
  const fetchLoanDetail = async (loanId: number) => {
    try {
      const response = await callMobileApi(
        'GetLoanDetail',
        { loanId },
        'mobile-app-loan-detail',
        '',
        'payment'
      );

      if (response.statusCode === 200) {
        // Find the next unpaid installment
        const installments = response.data.installments || [];
        const nextUnpaidInstallment = installments.find(
          (installment: any) => installment.instStatus === 'Pending' && installment.instType === 'Installment'
        );

        return {
          numOfPaidInstallments: response.data.numOfPaidInstallments || 0,
          totalPaidAmount: response.data.totalPaidAmount || 0,
          nextPaymentDate: nextUnpaidInstallment ? nextUnpaidInstallment.dueDate : null
        };
      }
      return {
        numOfPaidInstallments: 0,
        totalPaidAmount: 0,
        nextPaymentDate: null
      };
    } catch (error) {
      console.error(`Error fetching detail for loan ${loanId}:`, error);
      return {
        numOfPaidInstallments: 0,
        totalPaidAmount: 0,
        nextPaymentDate: null
      };
    }
  };

  // Enrich loans with detailed information
  const enrichLoansWithDetails = async (loans: any[]) => {
    const enrichedLoans = await Promise.all(
      loans.map(async (loan) => {
        const details = await fetchLoanDetail(loan.loanId);
        return {
          ...loan,
          numOfPaidInstallments: details.numOfPaidInstallments,
          totalPaidAmount: details.totalPaidAmount,
          nextPaymentDate: details.nextPaymentDate
        };
      })
    );
    return enrichedLoans;
  };

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

        // Enrich each category with detailed information
        console.log("Enriching loans with detailed information...");
        const [enrichedActiveLoans, enrichedCompletedLoans, enrichedReturnedLoans] = await Promise.all([
          enrichLoansWithDetails(loans.activeLoans),
          enrichLoansWithDetails(loans.completedLoans),
          enrichLoansWithDetails(loans.returnedLoans)
        ]);

        const enrichedData = {
          activeLoans: enrichedActiveLoans,
          completedLoans: enrichedCompletedLoans,
          returnedLoans: enrichedReturnedLoans
        };

        setEnrichedLoans(enrichedData);
        console.log("Loans enriched with details successfully");
      } else {
        console.error('Failed to fetch loan list:', response.message);
        Alert.alert('Error', 'Failed to load orders. Please try again.');
        setLoanData({ activeLoans: [], completedLoans: [], returnedLoans: [] });
        setEnrichedLoans({ activeLoans: [], completedLoans: [], returnedLoans: [] });
      }
    } catch (error: any) {
      console.error('GetLoanList error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to load orders. Please try again.');
      setLoanData({ activeLoans: [], completedLoans: [], returnedLoans: [] });
      setEnrichedLoans({ activeLoans: [], completedLoans: [], returnedLoans: [] });
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
      navigation.navigate("OrderDetailsScreen", {
        order: item,
        screenType: 'ongoing'
      });
    } else if (activeTab === "history") {
      navigation.navigate("OrderDetailsScreen", {
        order: item,
        screenType: 'history'
      });
    } else {
      navigation.navigate("OrderDetailsScreen", {
        order: item,
        screenType: 'cancelled'
      });
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
                {item.productName || 'Product N/A'}
              </Text>
              <View style={styles.planTag}>
                <Text style={styles.planTagText}>
                  {item.planType || 'Plan N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Credit and Installments Info - Only show for ongoing tab */}
          {activeTab === "ongoing" && (
            <View style={styles.loanDetailsRow}>
              <Text style={styles.creditInfo}>
                Due Amount : Rs. {item.totCreditValue?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.installmentInfo}>
                {(() => {
                  const totalInstallments = item.noOfInstallments || 0;
                  // Use the numOfPaidInstallments from enriched data
                  const completedInstallments = item.numOfPaidInstallments || 0;

                  return `( ${completedInstallments}/${totalInstallments} )`;
                })()}
              </Text>
            </View>
          )}
        </View>

        {/* Right Side - Next Payment and Arrow - Only show for ongoing tab */}
        <View style={styles.rightSection}>
          {activeTab === "ongoing" && (
            <View style={styles.downPaymentContainer}>
              <Text style={styles.downPaymentLabel}>Next Payment</Text>
              <Text style={styles.downPaymentAmount}>
                {(() => {
                  if (item.nextPaymentDate) {
                    const nextPaymentDate = new Date(item.nextPaymentDate);
                    return nextPaymentDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  } else {
                    return 'No pending payments';
                  }
                })()}
              </Text>
            </View>
          )}

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
    return styles.defaultBorderLine;
  };

  // Add helper function for status dot styling
  const getStatusDotStyle = (status: string) => {

    if (activeTab === "history") {
      return styles.completedStatusDot;
    } else if (activeTab === "ongoing") {
      return styles.activeStatusDot;
    }

  };

  // Filter data based on active tab and loan status - use enriched data
  const getFilteredData = () => {
    // Use enriched loans data instead of original loan data
    if (!enrichedLoans) return [];

    let filteredData = [];
    switch (activeTab) {
      case "ongoing":
        filteredData = Array.isArray(enrichedLoans.activeLoans) ? enrichedLoans.activeLoans : [];
        break;
      case "history":
        filteredData = Array.isArray(enrichedLoans.completedLoans) ? enrichedLoans.completedLoans : [];
        break;
      case "cancelled":
        filteredData = Array.isArray(enrichedLoans.returnedLoans) ? enrichedLoans.returnedLoans : [];
        break;
      default:
        filteredData = [];
    }

    // Sort by createdOn date in descending order (most recent first)
    return filteredData.sort((a, b) => {
      const dateA = a.createdOn ? new Date(a.createdOn).getTime() : 0;
      const dateB = b.createdOn ? new Date(b.createdOn).getTime() : 0;
      return dateB - dateA; // Descending order (most recent first)
    });
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
    backgroundColor: '#8B4513',
  },
  returnedStatusDot: {
    backgroundColor: '#F44336',
  },

  defaultStatusDot: {
    backgroundColor: '#9E9E9E',
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

});
