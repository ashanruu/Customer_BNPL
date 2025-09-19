import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { callMobileApi } from '../scripts/api';

const paymentOptions = [
  { type: "MasterCard", last4: "8295" },
  { type: "Visa", last4: "5445" },
  { type: "PayPal", name: "Alexei Sidorenko" },
];

const DetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { order } = route.params;

  const [loanData, setLoanData] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(0);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());

  const openPaymentModal = (index: number) => {
    setSelectedInstallment(index);
    setModalVisible(true);
  };

  const openDatePicker = (index: number) => {
    setSelectedInstallment(index);
    setRescheduleDate(new Date(installments[index].dueDate));
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date && selectedInstallment !== null) {
      const updated = [...installments];
      updated[selectedInstallment].dueDate = date.toISOString();
      setInstallments(updated);
    }
  };

  const handleSelectPayment = (index: number) => {
    setSelectedPayment(index);
  };

  const handleRefill = () => {
    // Handle refill/payment action here
    setModalVisible(false);
  };

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
        console.log("Loan details fetched successfully");
      } else {
        console.error('Failed to fetch loan details:', response.message);
        Alert.alert('Error', 'Failed to load loan details');
      }
    } catch (error: any) {
      console.error('GetLoanDetail error:', error);
      Alert.alert('Error', 'Failed to load loan details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order.loanId) {
      fetchLoanDetails();
    }
  }, [order.loanId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
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
        <Text style={styles.headerTitle}>
          {loanData?.loanTitle || order.name || `Loan #${order.loanId}`}
        </Text>
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
                    item.instStatus === "Paid" ? styles.circleFilled : styles.circleEmpty,
                  ]}
                />
                {index < installments.length - 1 && <View style={styles.line} />}
              </View>

              {/* Card */}
              <View style={styles.card}>
                <View style={[
                  styles.cardTopRight,
                  { backgroundColor: item.instStatus === "Paid" ? "#4CAF50" : "#FFA500" }
                ]}>
                  <Text style={[
                    styles.statusTextTop,
                    { color: "#fff" }
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
                    Settled: {formatDate(item.settleDate)}
                  </Text>
                )}

                {item.instStatus !== "Paid" && (
                  <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.rescheduleButton}
                      onPress={() => openPaymentModal(index)}
                    >
                      <Text style={styles.rescheduleText}>Payment method</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rescheduleButton, { marginLeft: 10, backgroundColor: "#ff9e30ff" }]}
                      onPress={() => openDatePicker(index)}
                    >
                      <Text style={styles.rescheduleText}>Reschedule</Text>
                    </TouchableOpacity>
                  </View>
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

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentProfessional}>
            <Text style={styles.modalTitleProfessional}>Select Payment Method</Text>

            {paymentOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paymentOptionProfessional,
                  selectedPayment === index && styles.paymentOptionSelected,
                ]}
                onPress={() => handleSelectPayment(index)}
              >
                {/* Payment Icon */}
                <View style={styles.paymentIcon}>
                  {option.type === "MasterCard" && <MaterialIcons name="credit-card" size={24} color="#818181ff" />}
                  {option.type === "Visa" && <MaterialIcons name="credit-card" size={24} color="#818181ff" />}
                  {option.type === "PayPal" && <MaterialIcons name="account-balance-wallet" size={24} color="#818181ff" />}
                </View>

                {/* Payment Text */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentTextProfessional}>
                    {option.type === "PayPal" ? option.name : `${option.type} **** ${option.last4}`}
                  </Text>
                </View>

                {/* Selected Checkmark */}
                {selectedPayment === index && (
                  <MaterialIcons name="check-circle" size={24} color="#19192bff" />
                )}
              </TouchableOpacity>
            ))}

            <View style={{ marginTop: 20 }}>
              <Text style={styles.amountLabelProfessional}>Amount</Text>
              <Text style={styles.amountProfessional}>
                {selectedInstallment !== null && installments[selectedInstallment] 
                  ? formatAmount(installments[selectedInstallment].instAmount)
                  : 'Rs. 0'
                }
              </Text>
            </View>

            <TouchableOpacity style={styles.refillButtonProfessional} onPress={handleRefill}>
              <Text style={styles.refillTextProfessional}>Pay Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseProfessional}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#4d4d4dff" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={rescheduleDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
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
  content: { padding: 20, paddingLeft: 30 },
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
    color: "#4CAF50", 
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

  rescheduleButton: {
    backgroundColor: "#20222e",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  rescheduleText: { fontSize: 12, fontWeight: "600", color: "white" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContentProfessional: {
  backgroundColor: "#fff",
  padding: 25,
  borderTopLeftRadius: 25,
  borderTopRightRadius: 25,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
},
modalTitleProfessional: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
paymentOptionProfessional: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 12,
  marginBottom: 10,
  backgroundColor: "#F7F7F7",
},
paymentOptionSelected: {
  borderWidth: 1.5,
  borderColor: "#deddf5ff",
  backgroundColor: "#e7e6f4ff",
},
paymentIcon: { width: 30, alignItems: "center" },
paymentTextProfessional: { fontSize: 16, marginLeft: 10 },
amountLabelProfessional: { fontSize: 14, fontWeight: "600", color: "#555" },
amountProfessional: { fontSize: 22, fontWeight: "700", marginTop: 5 },
refillButtonProfessional: {
  backgroundColor: "#20222e",
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 20,
},
refillTextProfessional: { color: "#fff", fontSize: 16, fontWeight: "700" },
modalCloseProfessional: {
  backgroundColor: "#ffffffff",
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 5,
},
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
