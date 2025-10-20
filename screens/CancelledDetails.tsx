import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { callMobileApi } from '../scripts/api';

const DetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { order } = route.params;

  const [loanData, setLoanData] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);

  // Fetch loan details from API
  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching loan details for loan ID:", order.loanId);
      
      const response = await callMobileApi(
        'GetLoanDetail',
        { loanId: order.loanId },
        'mobile-app-loan-detail',
        '',
        'payment'
      );

      console.log("=== FULL GetLoanDetail RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      if (response.statusCode === 200) {
        const responseData = response.data;
        setLoanData(responseData.loan);
        setInstallments(responseData.installments || []);
        setPaymentMethods(responseData.installments?.map(() => "Credit Card") || []);
        console.log("Loan details fetched successfully");
      } else {
        console.error('Failed to fetch loan details:', response.message);
      }
    } catch (error: any) {
      console.error('GetLoanDetail error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order.loanId) {
      fetchLoanDetails();
    }
  }, [order.loanId]);

  const handlePaymentChange = (index: number, value: string) => {
    const updated = [...paymentMethods];
    updated[index] = value;
    setPaymentMethods(updated);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#20222e" />
          <Text style={styles.loadingText}>Loading loan details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancelled Orders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.orderPrice}>
          {loanData ? formatAmount(loanData.totLoanValue) : order.price}
        </Text>
        <Text style={styles.orderId}>Loan ID: {order.loanId}</Text>
        <Text style={styles.orderDate}>
          Date: {loanData ? formatDate(loanData.createdOn) : order.date}
        </Text>
        
        {loanData && (
          <>
            <Text style={styles.orderDetail}>
              Status: {loanData.loanStatus}
            </Text>
            <Text style={styles.orderDetail}>
              Total Installments: {loanData.noOfInstallments}
            </Text>
            <Text style={styles.orderDetail}>
              Credit Value: {formatAmount(loanData.totCreditValue)}
            </Text>
            <Text style={styles.orderDetail}>
              Down Payment: {formatAmount(loanData.downPaymentet)}
            </Text>
          </>
        )}

        {/* Vertical timeline */}
        <View style={styles.timeline}>
          {installments.length > 0 ? installments.map((item, index) => (
            <View key={item.installId} style={styles.installmentContainer}>
              {/* Circle & Line */}
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.circle,
                    item.instStatus === "Returned" || item.instStatus === "Cancelled" ? styles.circleCancelled : styles.circleEmpty,
                  ]}
                />
                {index < installments.length - 1 && <View style={styles.line} />}
              </View>

              {/* Card */}
              <View style={styles.card}>
                {/* Status at top-right */}
                <View style={[
                  styles.cardTopRight,
                  { backgroundColor: item.instStatus === "Returned" || item.instStatus === "Cancelled" ? "#FF5722" : "#ddd" }
                ]}>
                  <Text style={[
                    styles.statusTextTop,
                    { color: item.instStatus === "Returned" || item.instStatus === "Cancelled" ? "#fff" : "#000" }
                  ]}>
                    {item.instStatus}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>
                  Installment {index + 1} ({item.instType})
                </Text>
                <Text style={styles.cardPrice}>
                  {formatAmount(item.instAmount)}
                </Text>
                <Text style={styles.cardDate}>
                  Due: {formatDate(item.dueDate)}
                </Text>
                {item.settleDate && (
                  <Text style={styles.cardSettleDate}>
                    Cancelled: {formatDate(item.settleDate)}
                  </Text>
                )}
              </View>
            </View>
          )) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No installment data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  content: { padding: 20, paddingLeft:30, },
  orderId: { fontSize: 16, color: "#555" },
  orderDate: { fontSize: 16, color: "#555", marginBottom: 30 },
  orderPrice: { fontSize: 28, fontWeight: "700", marginBottom: 10 },
  orderDetail: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 5 
  },
  cardSettleDate: { 
    fontSize: 12, 
    color: "#FF5722", 
    marginTop: 2,
    fontWeight: "500"
  },

  timeline: { flexDirection: "column" },
  installmentContainer: { flexDirection: "row", marginBottom: 20 },
  timelineLeft: { width: 40, alignItems: "center" },
  circle: { width: 20, height: 20, borderRadius: 10, marginBottom: 5 },
  circleFilled: { backgroundColor: "#20222e" },
  circleEmpty: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#20222e" },
  line: { width: 2, flex: 1, backgroundColor: "#20222e" },
  circleCancelled: { 
    backgroundColor: "#FF5722" 
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginLeft: 10,
    position: "relative",
  },
  cardTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ddd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusTextTop: { fontSize: 12, fontWeight: "600" },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  cardPrice: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  cardDate: { fontSize: 14, color: "#888", marginBottom: 10 },

  picker: {
    height: Platform.OS === "ios" ? 50 : 50,
    width: Platform.OS === "ios" ? "50%" : "50%",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  rescheduleButton: {
    borderWidth: 1,
    backgroundColor: "#20222e",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  rescheduleText: { fontSize: 12, fontWeight: "600", color: "white" },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
