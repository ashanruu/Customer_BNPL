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
import { callMobileApi, fetchCustomerCard, payInstallment } from '../../scripts/api';

const OrderDetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { order, screenType } = route.params;

  const [loanData, setLoanData] = useState<any>(null);
  const [installments, setInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  // Add state for the new fields from API
  const [numOfPaidInstallments, setNumOfPaidInstallments] = useState<number>(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(0);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(new Date());

  // Determine if actions should be shown based on screen type
  const showActions = screenType === 'ongoing';
  const showPaymentModal = screenType === 'ongoing';

  // Get header title (same for all cases)
  const getHeaderTitle = () => `LOAN #${order.loanId}`;

  // Get status styling based on screen type and status
  const getStatusStyling = (status: string) => {
    if (screenType === 'cancelled') {
      return {
        circle: styles.circleCancelled,
        tag: { backgroundColor: "#FF5722" },
        text: { color: "#fff" },
        settleLabel: "Cancelled:"
      };
    } else if (screenType === 'history') {
      return {
        tag: getStatusTagStyle(status),
        text: getStatusTextStyle(status),
        settleLabel: "Settled:"
      };
    } else {
      // ongoing
      return {
        tag: getStatusTagStyle(status),
        text: getStatusTextStyle(status),
        settleLabel: "Settled:"
      };
    }
  };

  // Fetch customer cards when payment modal opens (only for ongoing)
  const fetchPaymentMethods = async () => {
    if (!showPaymentModal) return;

    try {
      setPaymentLoading(true);

      if (!loanData || !loanData.fK_CusId) {
        Alert.alert('Error', 'Customer ID not found in loan data');
        setPaymentOptions([]);
        return;
      }

      const customerId = loanData.fK_CusId;
      console.log("Fetching payment methods for customer ID:", customerId);

      const response = await fetchCustomerCard(customerId);

      if (response.statusCode === 200 && response.data) {
        const cardData = response.data;

        if (cardData.cardNumber && cardData.cardNumber.trim() !== '') {
          const transformedCard = {
            cardId: cardData.jobId,
            brand: cardData.cardType,
            type: cardData.cardType,
            last4: cardData.cardNumber.slice(-4),
            cardNumber: cardData.cardNumber,
            cardDate: cardData.cardDate,
            isActive: cardData.isActive,
            isDefault: true
          };

          setPaymentOptions([transformedCard]);
        } else {
          setPaymentOptions([]);
        }
      } else {
        setPaymentOptions([]);
      }

    } catch (error: any) {
      setPaymentOptions([]);
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPaymentModal = (index: number) => {
    if (!showPaymentModal) return;

    setSelectedInstallment(index);
    setModalVisible(true);
    fetchPaymentMethods();
  };

  const openDatePicker = (index: number) => {
    if (!showActions) return;

    setSelectedInstallment(index);
    setRescheduleDate(new Date(installments[index].dueDate));
    setShowDatePicker(true);
  };

  const getRescheduleDateConstraints = () => {
    if (installments.length < 2) {
      return {
        minimumDate: new Date(),
        maximumDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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

      const saleId = loanData.fK_SaleId;

      if (!saleId) {
        Alert.alert('Error', 'Sale ID not found in loan data');
        return;
      }

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

        // Set the new fields from API response
        setNumOfPaidInstallments(responseData.numOfPaidInstallments || 0);
        setTotalPaidAmount(responseData.totalPaidAmount || 0);

        // Filter installments based on screen type and installment status
        let filteredInstallments = responseData.installments || [];

        // First filter out down payment installments for all types
        filteredInstallments = filteredInstallments.filter(
          (installment: any) => installment.instType?.toLowerCase()
        );

        // Then filter based on screen type and installment status
        switch (screenType) {
          case 'ongoing':
            // Show ALL installments for ongoing tab (paid, pending, overdue, etc.)
            // Don't filter by status - show complete loan history
            break;
          case 'history':
            // Show only Paid installments for history tab
            filteredInstallments = filteredInstallments.filter(
              (installment: any) => installment.instStatus?.toLowerCase() === 'paid'
            );
            break;
          case 'cancelled':
            // Show only Cancelled installments for cancelled tab
            filteredInstallments = filteredInstallments.filter(
              (installment: any) => installment.instStatus?.toLowerCase() === 'cancelled'
            );
            break;
          default:
            // Keep all installments if screenType is not recognized
            break;
        }

        setInstallments(filteredInstallments);
        console.log(`Loan details fetched successfully for ${screenType} tab`);
        console.log(`Filtered ${filteredInstallments.length} installments for ${screenType} tab`);
        console.log(`Number of paid installments: ${responseData.numOfPaidInstallments}`);
        console.log(`Total paid amount: ${responseData.totalPaidAmount}`);
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

  // Helper function for status styling (for ongoing tab)
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
        return styles.pendingStatusText;
      case 'overdue':
        return styles.overdueStatusText;
      default:
        return styles.defaultStatusText;
    }
  };

  const getTimelineLineStyle = (index: number) => {
    const currentCompleted = installments[index]?.instStatus?.toLowerCase() === 'completed' ||
      installments[index]?.instStatus?.toLowerCase() === 'paid';

    if (currentCompleted) {
      return [styles.timelineLine, styles.timelineLineCompleted];
    }
    return styles.timelineLine;
  };

  const getFirstActiveInstallmentIndex = () => {
    if (screenType === 'ongoing') {
      // For ongoing tab, find the first pending installment
      return installments.findIndex(installment =>
        installment.instStatus?.toLowerCase() === 'pending'
      );
    }
    // For other tabs, no active installments (no action buttons)
    return -1;
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
          {getHeaderTitle()}
        </Text>
      </View>

      {/* Fixed content - Loan Summary */}
      <View style={styles.fixedContent}>
        {/* Loan Summary Section */}
        <View style={styles.loanSummary}>
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
              <Text style={styles.loanDateLabel}>Loan Date</Text>
              <Text style={styles.loanDate}>
                {loanData?.createdOn ? formatDate(loanData.createdOn) : 'N/A'}
              </Text>
            </View>
          </View>

          {loanData && screenType === 'ongoing' && (
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Installments</Text>
                <Text style={styles.detailValue}>{loanData ? `${numOfPaidInstallments}/${loanData.noOfInstallments}` : 'N/A'}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Due Amount</Text>
                <Text style={styles.detailValue}>{formatAmount(loanData.totCreditValue)}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Paid Amount</Text>
                <Text style={styles.detailValue}>{formatAmount(totalPaidAmount)}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />
        </View>

        <Text style={styles.sectionTitle}>Payment Schedule</Text>
      </View>

      {/* Scrollable content - Installments */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {installments.length > 0 ? (
          <View style={styles.timelineContainer}>
            {installments.map((item, index) => {
              const statusStyling = getStatusStyling(item.instStatus);

              return (
                <View key={item.installId} style={styles.timelineItemContainer}>
                  {/* Timeline Circle and Line */}
                  <View style={styles.timelineWrapper}>
                    <View style={[
                      styles.timelineCircle,
                      statusStyling.circle
                    ]}>
                      {(item.instStatus?.toLowerCase() === 'completed' || item.instStatus?.toLowerCase() === 'paid') && (
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
                    <View style={[
                      styles.statusTag,
                      statusStyling.tag
                    ]}>
                      <Text style={[
                        styles.statusText,
                        statusStyling.text
                      ]}>
                        {item.instStatus}
                      </Text>
                    </View>

                    {/* Installment Header */}
                    <View style={styles.installmentHeader}>
                      <Text style={styles.installmentTitle}>
                        Installment {index + 1} {item.instType && `(${item.instType})`}
                      </Text>
                    </View>

                    {/* Amount */}
                    <Text style={styles.installmentAmount}>
                      {formatAmount(item.instAmount)}
                    </Text>

                    {/* Dates */}
                    <View style={styles.datesRow}>
                      {(item.instStatus?.toLowerCase() === 'completed' || item.instStatus?.toLowerCase() === 'paid') ? (
                        item.settleDate && (
                          <Text style={styles.settledDate}>
                            {statusStyling.settleLabel} {formatDate(item.settleDate)}
                          </Text>
                        )
                      ) : (
                        <Text style={styles.dateLabel}>
                          Due: {formatDate(item.dueDate)}
                        </Text>
                      )}
                    </View>

                    {/* Action Buttons - Only for ongoing */}
                    {showActions && screenType === 'ongoing' && item.instStatus?.toLowerCase() === 'pending' && (
                      <View style={styles.actionButtonsRow}>
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
              );
            })}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No installment data available</Text>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal - Only show for ongoing */}
      {showPaymentModal && (
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
      )}

      {/* Date Picker - Only for ongoing */}
      {showActions && showDatePicker && (() => {
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

export default OrderDetailsScreen;

// ... (include all the existing styles from DetailsScreen.tsx, plus these additional ones)
const styles = StyleSheet.create({
  // Include all existing styles from DetailsScreen.tsx
  // Add these new styles for cancelled state
  circleCancelled: {
    backgroundColor: "#FF5722"
  },
  // Timeline styles for history/cancelled (from old screens)
  timeline: { flexDirection: "column" },
  installmentContainer: { flexDirection: "row", marginBottom: 20 },
  timelineLeft: { width: 40, alignItems: "center" },
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
  cardSettleDate: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 2,
    fontWeight: "500"
  },

  // ... (rest of the existing styles)
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
  fixedContent: {
    padding: 20,
    paddingBottom: 0,
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  loanAmount: {
    fontSize: 24,
    fontWeight: "600",
    color: 'rgba(32, 34, 46, 1)',
    marginBottom: 4,
  },
  loanDateSection: {
    alignItems: "flex-end",
  },
  loanDateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: 'rgba(32, 34, 46, 1)',
    marginBottom: 20,
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  // timelineCircleCompleted: {
  //   borderColor: '#000000',
  //   backgroundColor: '#FFFFFF',
  // },
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
  payButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
});