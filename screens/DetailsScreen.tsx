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
import { callMobileApi, fetchCustomerCard, payInstallment } from '../scripts/api';

const DetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { order } = route.params;

  const [loanData, setLoanData] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());

  // Fetch customer cards when payment modal opens
  const fetchPaymentMethods = async () => {
    try {
      setPaymentLoading(true);

      // Get customer ID from loan data instead of AsyncStorage
      if (!loanData || !loanData.fK_CusId) {
        Alert.alert('Error', 'Customer ID not found in loan data');
        setPaymentOptions([]); // Ensure empty array
        return;
      }

      const customerId = loanData.fK_CusId;

      console.log("Fetching payment methods for customer ID:", customerId);

      const response = await fetchCustomerCard(customerId);

      // Check if response is successful and has data
      if (response.statusCode === 200 && response.data) {
        // Validate that we have proper card data
        const cardData = response.data;

        // Only create card if we have valid card number
        if (cardData.cardNumber && cardData.cardNumber.trim() !== '') {
          const transformedCard = {
            cardId: cardData.jobId,
            brand: cardData.cardType,
            type: cardData.cardType,
            last4: cardData.cardNumber.slice(-4), // Get last 4 digits
            cardNumber: cardData.cardNumber,
            cardDate: cardData.cardDate,
            isActive: cardData.isActive,
            isDefault: true // Since it's the only card, make it default
          };

          setPaymentOptions([transformedCard]);
        } else {
          // No valid card data
          setPaymentOptions([]);
        }
      } else {
        // No successful response or no data
        setPaymentOptions([]);
      }

    } catch (error: any) {
      setPaymentOptions([]); // Ensure empty array on error
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPaymentModal = (index: number) => {
    setSelectedInstallment(index);
    setModalVisible(true);
    fetchPaymentMethods(); // Fetch payment methods when modal opens
  };

  const openDatePicker = (index: number) => {
    setSelectedInstallment(index);
    setRescheduleDate(new Date(installments[index].dueDate));
    setShowDatePicker(true);
  };

  // Get minimum and maximum dates for reschedule
  const getRescheduleDateConstraints = () => {
    if (installments.length < 2) {
      return {
        minimumDate: new Date(),
        maximumDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };
    }

    const firstInstallmentDate = new Date(installments[0].dueDate);
    const secondInstallmentDate = new Date(installments[1].dueDate);

    return {
      minimumDate: firstInstallmentDate,
      maximumDate: secondInstallmentDate
    };
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date && selectedInstallment !== null) {
      const constraints = getRescheduleDateConstraints();

      // Validate the selected date is within constraints
      if (date >= constraints.minimumDate && date <= constraints.maximumDate) {
        const updated = [...installments];
        updated[selectedInstallment].dueDate = date.toISOString();
        setInstallments(updated);

        Alert.alert(
          'Date Updated',
          `Installment ${selectedInstallment + 1} has been rescheduled to ${date.toLocaleDateString()}`
        );
      } else {
        Alert.alert(
          'Invalid Date',
          `Please select a date between ${constraints.minimumDate.toLocaleDateString()} and ${constraints.maximumDate.toLocaleDateString()}`
        );
      }
    }
  };

  const handleSelectPayment = (index: number) => {
    setSelectedPayment(index);
  };

  const handleRefill = async () => {
    if (selectedInstallment === null || !loanData) {
      Alert.alert('Error', 'Invalid installment selection');
      return;
    }

    if (paymentOptions.length === 0 || selectedPayment === null) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    try {
      setPaymentProcessing(true);
      
      const installment = installments[selectedInstallment];
      const selectedCard = paymentOptions[selectedPayment];
      
      console.log("Processing payment for installment:", installment.installId);
      console.log("Using payment method:", selectedCard);
      console.log("=== LOAN DATA DEBUG ===");
      console.log("Full loanData:", JSON.stringify(loanData, null, 2));
      console.log("loanData.fK_SaleId:", loanData.fK_SaleId);
      console.log("Type of loanData.fK_SaleId:", typeof loanData.fK_SaleId);
      console.log("=== END LOAN DATA DEBUG ===");

      // Use the correct property name from the API response
      const saleId = loanData.fK_SaleId;
      
      if (!saleId) {
        Alert.alert('Error', 'Sale ID not found in loan data');
        return;
      }

      console.log("Using saleId:", saleId, "Type:", typeof saleId);

      const response = await payInstallment(installment.installId, saleId);

      if (response.statusCode === 200) {
        Alert.alert(
          'Payment Successful',
          'Your installment payment has been processed successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                // Refresh loan details to show updated payment status
                fetchLoanDetails();
              }
            }
          ]
        );
      } else {
        Alert.alert('Payment Failed', response.message || 'Unable to process payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      Alert.alert(
        'Payment Error',
        error.response?.data?.message || 'Failed to process payment. Please check your connection and try again.'
      );
    } finally {
      setPaymentProcessing(false);
    }
  };


  // Format card display text - add validation
  const formatCardText = (card: any) => {
    if (!card || !card.cardNumber) return 'Invalid Card';

    const cardType = card.brand || card.type;
    const last4 = card.last4 || card.cardNumber?.slice(-4);
    return `${cardType} **** ${last4}`;
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
    if (status?.toLowerCase() === 'completed') {
      return styles.timelineCircleCompleted;
    }
    return styles.timelineCircleDefault;
  };

  // Helper function for timeline line styling
  const getTimelineLineStyle = (index: number) => {
    // Check if current installment is completed
    const currentCompleted = installments[index]?.instStatus?.toLowerCase() === 'completed';

    if (currentCompleted) {
      return [styles.timelineLine, styles.timelineLineCompleted];
    }
    return styles.timelineLine;
  };

  // Helper function to find the first active installment index
  const getFirstActiveInstallmentIndex = () => {
    return installments.findIndex(installment =>
      installment.instStatus?.toLowerCase() === 'pending'
    );
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
                <Text style={styles.detailLabel}>Due Amount</Text>
                <Text style={styles.detailValue}>{formatAmount(loanData.totCreditValue)}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Paid Amount</Text>
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
                    {item.instStatus?.toLowerCase() === 'completed' && (
                      <View style={styles.innerCircle} />
                    )}
                  </View>
                  {index < installments.length - 1 && (
                    <View style={getTimelineLineStyle(index)} />
                  )}
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
                  </View>

                  {/* Amount */}
                  <Text style={styles.installmentAmount}>
                    {formatAmount(item.instAmount)}
                  </Text>

                  {/* Dates */}
                  <View style={styles.datesRow}>
                    {item.instStatus?.toLowerCase() === 'completed' ? (
                      // Show only settled date for completed installments
                      item.settleDate && (
                        <Text style={styles.settledDate}>
                          Settled: {formatDate(item.settleDate)}
                        </Text>
                      )
                    ) : (
                      // Show only due date for unpaid installments
                      <Text style={styles.dateLabel}>Due: {formatDate(item.dueDate)}</Text>
                    )}
                  </View>

                  {/* Action Buttons */}
                  {item.instStatus !== "Paid" && (
                    <View style={styles.actionButtonsRow}>
                      {/* Show reschedule and pay now buttons only for first active installment */}
                      {index === getFirstActiveInstallmentIndex() && (
                        <>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => openPaymentModal(index)}
                          >
                            <Text style={styles.actionButtonText}>Pay Now</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.rescheduleButton]}
                            onPress={() => openDatePicker(index)}
                          >
                            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                          </TouchableOpacity>
                        </>
                      )}
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

            {paymentLoading ? (
              <View style={styles.paymentLoadingContainer}>
                <ActivityIndicator size="small" color="#2C2C2E" />
                <Text style={styles.paymentLoadingText}>Loading payment methods...</Text>
              </View>
            ) : paymentOptions.length > 0 ? (
              paymentOptions.map((option, index) => (
                <TouchableOpacity
                  key={option.cardId || index}
                  style={[
                    styles.paymentOption,
                    selectedPayment === index && styles.paymentOptionSelected,
                  ]}
                  onPress={() => handleSelectPayment(index)}
                >
                  <View style={styles.paymentIcon}>
                    <MaterialIcons name="credit-card" size={24} color="#666" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentText}>
                      {formatCardText(option)}
                    </Text>
                    {option.holderName && (
                      <Text style={styles.cardHolderText}>
                        {option.holderName}
                      </Text>
                    )}
                  </View>

                  {selectedPayment === index && (
                    <MaterialIcons name="check-circle" size={24} color="#2C2C2E" />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              // Show this only when there are genuinely no payment methods
              <View style={styles.noPaymentMethodsContainer}>
                <MaterialIcons name="credit-card-off" size={48} color="#E8E8E8" />
                <Text style={styles.noPaymentMethodsText}>
                  No payment methods found
                </Text>
                <Text style={styles.noPaymentMethodsSubtext}>
                  Add a payment method to continue
                </Text>
              </View>
            )}

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountText}>
                {selectedInstallment !== null && installments[selectedInstallment]
                  ? formatAmount(installments[selectedInstallment].instAmount)
                  : 'Rs. 0'
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.payButton,
                (paymentOptions.length === 0 || paymentLoading || paymentProcessing) && styles.payButtonDisabled
              ]}
              onPress={handleRefill}
              disabled={paymentOptions.length === 0 || paymentLoading || paymentProcessing}
            >
              {paymentProcessing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.payButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.payButtonText}>
                  {paymentOptions.length === 0 ? 'No Payment Method' : 'Pay Now'}
                </Text>
              )}
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

      {/* Date Picker */}
      {showDatePicker && (() => {
        const constraints = getRescheduleDateConstraints();
        return (
          <DateTimePicker
            value={rescheduleDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={constraints.minimumDate}
            maximumDate={constraints.maximumDate}
          />
        );
      })()}
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
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineCircleCompleted: {
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  timelineCircleDefault: {
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: '120%',
    backgroundColor: '#E8E8E8',
    zIndex: 1,
  },
  timelineLineCompleted: {
    backgroundColor: '#000000',
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 2,
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

  // New styles for payment loading and no payment methods
  paymentLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  paymentLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  noPaymentMethodsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noPaymentMethodsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
  },
  noPaymentMethodsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  cardHolderText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  defaultCardText: {
    fontSize: 11,
    color: '#2C2C2E',
    fontWeight: '500',
    marginTop: 2,
  },
  payButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
});