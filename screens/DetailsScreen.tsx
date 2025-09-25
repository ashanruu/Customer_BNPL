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
// Remove DateTimePicker import as we don't need it anymore
// import DateTimePicker from "@react-native-community/datetimepicker";
import { callMobileApi } from '../scripts/api';

const paymentOptions = [
  { type: "MasterCard", last4: "8295" },
  { type: "Visa", last4: "5445" },
  { type: "PayPal", name: "Alexei Sidorenko" },
];

// Add reschedule options
const rescheduleOptions = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "21 Days", value: 21 },
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

  // Replace date picker states with reschedule modal states
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedRescheduleOption, setSelectedRescheduleOption] = useState<number | null>(0);

  const openPaymentModal = (index: number) => {
    setSelectedInstallment(index);
    setModalVisible(true);
  };

  // Replace openDatePicker with openRescheduleModal
  const openRescheduleModal = (index: number) => {
    setSelectedInstallment(index);
    setRescheduleModalVisible(true);
  };

  // Replace handleDateChange with handleReschedule
  const handleReschedule = () => {
    if (selectedInstallment !== null && selectedRescheduleOption !== null) {
      const daysToAdd = rescheduleOptions[selectedRescheduleOption].value;
      const currentDueDate = new Date(installments[selectedInstallment].dueDate);
      const newDueDate = new Date(currentDueDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      
      const updated = [...installments];
      updated[selectedInstallment].dueDate = newDueDate.toISOString();
      setInstallments(updated);
      
      setRescheduleModalVisible(false);
      // Optionally show a success message
      Alert.alert('Success', `Due date rescheduled by ${daysToAdd} days`);
    }
  };

  const handleSelectPayment = (index: number) => {
    setSelectedPayment(index);
  };

  // Add handler for reschedule option selection
  const handleSelectRescheduleOption = (index: number) => {
    setSelectedRescheduleOption(index);
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
        
        // Filter out down payment installments
        const filteredInstallments = (responseData.installments || []).filter(
          (installment: any) => installment.instType?.toLowerCase() !== 'downpayment'
        );
        
        setInstallments(filteredInstallments);
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

  // Helper function for status styling
  const getStatusTagStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return styles.paidStatusTag;
      case 'pending':
      case 'unpaid':
        return styles.pendingStatusTag;
      case 'overdue':
        return styles.overdueStatusTag;
      default:
        return styles.defaultStatusTag;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return styles.paidStatusText;
      case 'pending':
      case 'unpaid':
        return styles.pendingStatusText;
      case 'overdue':
        return styles.overdueStatusText;
      default:
        return styles.defaultStatusText;
    }
  };

  // Helper function for timeline circle styling
  const getTimelineCircleStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return styles.timelineCirclePaid;
      case 'pending':
      case 'unpaid':
        return styles.timelineCirclePending;
      case 'overdue':
        return styles.timelineCircleOverdue;
      default:
        return styles.timelineCircleDefault;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C2C2E" />
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
          <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {`LOAN #${order.loanId}`}
        </Text>
      </View>

      {/* Fixed content - Loan Summary */}
      <View style={styles.fixedContent}>
        {/* Loan Summary Section - Redesigned */}
        <View style={styles.loanSummary}>
          {/* Main loan info - now in a single row */}
          <View style={styles.topRow}>
            <View style={styles.loanAmountSection}>
              <Text style={styles.loanAmountLabel}>Loan Amount</Text>
              <View style={styles.loanAmountRow}>
                <Text style={styles.loanAmount}>
                  {loanData ? formatAmount(loanData.totLoanValue) : order.price}
                </Text>
                {loanData && (
                  <View style={[styles.statusTagInline, getStatusTagStyle(loanData.loanStatus)]}>
                    <Text style={[styles.statusText, getStatusTextStyle(loanData.loanStatus)]}>
                      {loanData.loanStatus}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.loanDateSection}>
              <Text style={styles.loanDateLabel}>Installments</Text>
              <Text style={styles.loanDate}>
                {loanData ? loanData.noOfInstallments : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Loan details grid */}
          {loanData && (
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Loan Date</Text>
                <Text style={styles.detailValue}>{formatDate(loanData.createdOn)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Credit Value</Text>
                <Text style={styles.detailValue}>{formatAmount(loanData.totCreditValue)}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Down Payment</Text>
                <Text style={styles.detailValue}>{formatAmount(loanData.downPaymentet)}</Text>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />
        </View>

        {/* Section Title - Fixed */}
        <Text style={styles.sectionTitle}>Payment Schedule</Text>
      </View>

      {/* Scrollable content - Only installments */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {installments.length > 0 ? (
          <View style={styles.timelineContainer}>
            {installments.map((item, index) => (
              <View key={item.installId} style={styles.timelineItemContainer}>
                {/* Timeline Circle and Line */}
                <View style={styles.timelineWrapper}>
                  <View style={[styles.timelineCircle, getTimelineCircleStyle(item.instStatus)]}>
                    {item.instStatus?.toLowerCase() === 'paid' && (
                      <MaterialIcons name="check" size={16} color="#2D5016" />
                    )}
                  </View>
                  {index < installments.length - 1 && <View style={styles.timelineLine} />}
                </View>

                {/* Installment Card */}
                <View style={styles.installmentCard}>
                  {/* Status Tag */}
                  <View style={[styles.statusTag, getStatusTagStyle(item.instStatus)]}>
                    <Text style={[styles.statusText, getStatusTextStyle(item.instStatus)]}>
                      {item.instStatus}
                    </Text>
                  </View>

                  {/* Installment Header */}
                  <View style={styles.installmentHeader}>
                    <Text style={styles.installmentTitle}>
                      Installment {index + 1}
                    </Text>
                    <Text style={styles.installmentType}>
                      ({item.instType})
                    </Text>
                  </View>

                  {/* Amount */}
                  <Text style={styles.installmentAmount}>
                    {formatAmount(item.instAmount)}
                  </Text>

                  {/* Dates */}
                  <View style={styles.datesRow}>
                    <Text style={styles.dateLabel}>Due: {formatDate(item.dueDate)}</Text>
                    {item.settleDate && (
                      <Text style={styles.settledDate}>
                        Settled: {formatDate(item.settleDate)}
                      </Text>
                    )}
                  </View>

                  {/* Action Buttons */}
                  {item.instStatus !== "Paid" && (
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openPaymentModal(index)}
                      >
                        <Text style={styles.actionButtonText}>Pay Now</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.rescheduleButton]}
                        onPress={() => openRescheduleModal(index)}
                      >
                        <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No installment data available</Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>

            {paymentOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paymentOption,
                  selectedPayment === index && styles.paymentOptionSelected,
                ]}
                onPress={() => handleSelectPayment(index)}
              >
                <View style={styles.paymentIcon}>
                  {option.type === "MasterCard" && <MaterialIcons name="credit-card" size={24} color="#8E8E93" />}
                  {option.type === "Visa" && <MaterialIcons name="credit-card" size={24} color="#8E8E93" />}
                  {option.type === "PayPal" && <MaterialIcons name="account-balance-wallet" size={24} color="#8E8E93" />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentText}>
                    {option.type === "PayPal" ? option.name : `${option.type} **** ${option.last4}`}
                  </Text>
                </View>

                {selectedPayment === index && (
                  <MaterialIcons name="check-circle" size={24} color="#2C2C2E" />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountText}>
                {selectedInstallment !== null && installments[selectedInstallment] 
                  ? formatAmount(installments[selectedInstallment].instAmount)
                  : 'Rs. 0'
                }
              </Text>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handleRefill}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={rescheduleModalVisible}
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Payment</Text>

            {rescheduleOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paymentOption,
                  selectedRescheduleOption === index && styles.paymentOptionSelected,
                ]}
                onPress={() => handleSelectRescheduleOption(index)}
              >
                <View style={styles.paymentIcon}>
                  <MaterialIcons name="schedule" size={24} color="#8E8E93" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentText}>
                    {option.label}
                  </Text>
                </View>

                {selectedRescheduleOption === index && (
                  <MaterialIcons name="check-circle" size={24} color="#2C2C2E" />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Current Due Date</Text>
              <Text style={styles.amountText}>
                {selectedInstallment !== null && installments[selectedInstallment] 
                  ? formatDate(installments[selectedInstallment].dueDate)
                  : 'N/A'
                }
              </Text>
              {selectedRescheduleOption !== null && (
                <Text style={styles.newDueDateText}>
                  New Date: {selectedInstallment !== null && installments[selectedInstallment] 
                    ? formatDate(new Date(new Date(installments[selectedInstallment].dueDate).getTime() + 
                        (rescheduleOptions[selectedRescheduleOption].value * 24 * 60 * 60 * 1000)).toISOString())
                    : 'N/A'
                  }
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handleReschedule}>
              <Text style={styles.payButtonText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setRescheduleModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Remove Date Picker component */}
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: { 
    marginRight: 16,
    padding: 4,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "500",
    color: 'rgba(32, 34, 46, 1)',
  },
  
  // New styles for fixed and scrollable content
  fixedContent: {
    padding: 20,
    paddingBottom: 0,
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: "#FFFFFF",
  },
  loanAmount: { 
    fontSize: 24, 
    fontWeight: "600",
    color: 'rgba(32, 34, 46, 1)',
    marginBottom: 4,
  },
  loanDate: { 
    fontSize: 14, 
    color: "#666", 
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: { 
    fontSize: 14, 
    color: "#666",
  },
  summaryValue: { 
    fontSize: 14, 
    color: 'rgba(32, 34, 46, 1)',
    fontWeight: "500",
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: 'rgba(32, 34, 46, 1)',
    marginBottom: 20,
  },

  // Timeline Styles - Updated
  timelineContainer: {
    position: 'relative',
  },
  timelineItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20, // Spacing between items
  },
  timelineWrapper: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
    position: 'relative',
  },
  timelineCircle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Ensure circle is above the line
  },
  timelineCirclePaid: {
    borderColor: '#2D5016',
    backgroundColor: '#2D5016',
  },
  timelineCirclePending: {
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  timelineCircleOverdue: {
    borderColor: '#fa828eff',
    backgroundColor: '#FFFFFF',
  },
  timelineCircleDefault: {
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: '120%',
    backgroundColor: '#E8E8E8',
    zIndex: 1,
  },

  // Installment Cards
  installmentCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    position: 'relative',
  },
  installmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  installmentTitle: { 
    fontSize: 14, 
    fontWeight: "500",
    color: 'rgba(32, 34, 46, 1)',
    marginRight: 8,
  },
  installmentType: {
    fontSize: 12,
    color: "#999",
  },
  installmentAmount: { 
    fontSize: 18, 
    fontWeight: "600",
    color: 'rgba(32, 34, 46, 1)',
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateLabel: { 
    fontSize: 12, 
    color: "#666",
  },
  settledDate: { 
    fontSize: 12, 
    color: 'rgba(32, 34, 46, 1)',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(32, 34, 46, 1)',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: "center",
  },
  rescheduleButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  actionButtonText: { 
    fontSize: 13, 
    fontWeight: "500", 
    color: "#fff" 
  },
  rescheduleButtonText: { 
    fontSize: 13, 
    fontWeight: "500", 
    color: "rgba(32, 34, 46, 1)" 
  },
  // Updated Status Tags - matching ProfileScreen style
  statusTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTagInline: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Updated Status colors - matching ProfileScreen
  paidStatusTag: {
    backgroundColor: '#E8F5E8',
  },
  paidStatusText: {
    color: '#2D5016',
  },
  pendingStatusTag: {
    backgroundColor: '#FFF4E6',
  },
  pendingStatusText: {
    color: '#8B4513',
  },
  overdueStatusTag: {
    backgroundColor: '#ffebee',
  },
  overdueStatusText: {
    color: '#fa828eff',
  },
  defaultStatusTag: {
    backgroundColor: '#F5F5F5',
  },
  defaultStatusText: {
    color: '#666',
  },

  // Loading and No Data
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Modal Styles - minimal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: "500",
    color: 'rgba(32, 34, 46, 1)',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  paymentOptionSelected: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E8E8E8",
  },
  paymentIcon: { 
    width: 24, 
    alignItems: "center" 
  },
  paymentText: { 
    fontSize: 14,
    marginLeft: 12,
    color: 'rgba(32, 34, 46, 1)',
  },
  amountSection: { 
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  amountLabel: { 
    fontSize: 12, 
    color: "#666",
    marginBottom: 4,
  },
  amountText: { 
    fontSize: 20, 
    fontWeight: "600",
    color: 'rgba(32, 34, 46, 1)',
  },
  payButton: {
    backgroundColor: 'rgba(32, 34, 46, 1)',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
  },
  payButtonText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "500" 
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  cancelButtonText: { 
    color: "#666",
    fontSize: 14,
  },

  // New styles for loan summary redesign
  loanSummary: {
    backgroundColor: "#FFFFFF",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  loanAmountSection: {
    flex: 1,
  },
  loanAmountLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  loanAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusTagInline: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
  },
  loanDateSection: {
    alignItems: "flex-end",
  },
  loanDateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: 'rgba(32, 34, 46, 1)',
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginTop: 16,
    marginBottom: 16,
  },

  // Add new style for new due date text
  newDueDateText: {
    fontSize: 14,
    color: '#2C2C2E',
    fontWeight: '500',
    marginTop: 8,
  },
});