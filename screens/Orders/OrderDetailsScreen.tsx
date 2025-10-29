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
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { callMobileApi, fetchCustomerCard, payInstallment } from '../../scripts/api';

const OrderDetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
        settleLabel: t('orderDetails.cancelled')
      };
    } else if (screenType === 'history') {
      return {
        tag: getStatusTagStyle(status),
        text: getStatusTextStyle(status),
        settleLabel: t('orderDetails.settled')
      };
    } else {
      // ongoing
      return {
        tag: getStatusTagStyle(status),
        text: getStatusTextStyle(status),
        settleLabel: t('orderDetails.settled')
      };
    }
  };

  // Fetch customer cards when payment modal opens (only for ongoing)
  const fetchPaymentMethods = async () => {
    if (!showPaymentModal) return;

    try {
      setPaymentLoading(true);
      console.log("Fetching payment methods...");

      if (!loanData || !loanData.fK_CusId) {
        console.error('Customer ID not found in loan data');
        Alert.alert(t('common.error'), t('orderDetails.customerIdNotFound'));
        setPaymentOptions([]);
        return;
      }

      const customerId = loanData.fK_CusId;
      console.log("Fetching payment methods for customer ID:", customerId);

      const response = await fetchCustomerCard(customerId);
      console.log("Payment methods response:", response);

      if (response.statusCode === 200 && response.data) {
        const cardData = response.data;

        if (cardData.cardNumber && cardData.cardNumber.trim() !== '') {
          const transformedCard = {
            cardId: cardData.jobId || `card_${Date.now()}`,
            brand: cardData.cardType || 'Unknown',
            type: cardData.cardType || 'Unknown',
            last4: cardData.cardNumber.slice(-4),
            cardNumber: cardData.cardNumber,
            cardDate: cardData.cardDate,
            isActive: cardData.isActive || true,
            isDefault: true,
            holderName: cardData.holderName || 'Card Holder'
          };

          console.log("Transformed card data:", transformedCard);
          setPaymentOptions([transformedCard]);
          setSelectedPayment(0); // Auto-select first (and likely only) card
        } else {
          console.log("No valid card data found");
          setPaymentOptions([]);
        }
      } else {
        console.log("Failed to fetch payment methods:", response.message);
        setPaymentOptions([]);
      }

    } catch (error: any) {
      console.error("Payment methods fetch error:", error);
      setPaymentOptions([]);
    } finally {
      setPaymentLoading(false);
    }
  };

  const openPaymentModal = (index: number) => {
    if (!showPaymentModal) return;

    console.log("Opening payment modal for installment:", index);
    setSelectedInstallment(index);
    setSelectedPayment(0); // Reset to first payment option
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
          t('orderDetails.dateUpdated'),
          t('orderDetails.dateUpdatedDesc', { 
            number: selectedInstallment + 1, 
            date: date.toLocaleDateString() 
          })
        );
      } else {
        Alert.alert(
          t('orderDetails.invalidDate'),
          t('orderDetails.invalidDateDesc', { 
            min: constraints.minimumDate.toLocaleDateString(), 
            max: constraints.maximumDate.toLocaleDateString() 
          })
        );
      }
    }
  };

  const handleSelectPayment = (index: number) => {
    console.log("Selected payment option:", index);
    setSelectedPayment(index);
  };

  const handleRefill = async () => {
    if (selectedInstallment === null || !loanData) {
      Alert.alert(t('common.error'), t('orderDetails.invalidSelection'));
      return;
    }

    if (paymentOptions.length === 0 || selectedPayment === null) {
      Alert.alert(t('common.error'), t('orderDetails.selectPaymentMethodError'));
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
        Alert.alert(t('common.error'), t('orderDetails.saleIdNotFound'));
        return;
      }

      const response = await payInstallment(installment.installId, saleId);

      if (response.statusCode === 200) {
        Alert.alert(
          t('orderDetails.paymentSuccessful'),
          t('orderDetails.paymentSuccessfulDesc'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                setModalVisible(false);
                fetchLoanDetails();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('orderDetails.paymentFailed'), response.message || t('orderDetails.paymentFailedDesc'));
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      Alert.alert(
        t('orderDetails.paymentError'),
        error.response?.data?.message || t('orderDetails.paymentErrorDesc')
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  const formatCardText = (card: any) => {
    if (!card || !card.cardNumber) return t('orderDetails.invalidCard');

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
        Alert.alert(t('common.error'), t('orderDetails.errorLoadingDetails'));
      }
    } catch (error: any) {
      console.error('GetLoanDetail error:', error);
      Alert.alert(t('common.error'), t('orderDetails.errorLoadingDetailsDesc'));
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
    return `Rs. ${amount.toFixed(2)}`;
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
          <Text style={styles.headerTitle}>{t('orderDetails.loading')}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2C2C2E" />
          <Text style={styles.loadingText}>{t('orderDetails.loadingLoanDetails')}</Text>
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
              <Text style={styles.loanAmountLabel}>{t('orderDetails.loanAmount')}</Text>
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
              <Text style={styles.loanDateLabel}>{t('orderDetails.loanDate')}</Text>
              <Text style={styles.loanDate}>
                {loanData?.createdOn ? formatDate(loanData.createdOn) : 'N/A'}
              </Text>
            </View>
          </View>

          {loanData && screenType === 'ongoing' && (
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t('orderDetails.installments')}</Text>
                <Text style={styles.detailValue}>{loanData ? `${numOfPaidInstallments}/${loanData.noOfInstallments}` : 'N/A'}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t('orderDetails.dueAmount')}</Text>
                <Text style={styles.detailValue}>{formatAmount(loanData.totCreditValue)}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{t('orderDetails.paidAmount')}</Text>
                <Text style={styles.detailValue}>{formatAmount(totalPaidAmount)}</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />
        </View>

        <Text style={styles.sectionTitle}>{t('orderDetails.paymentSchedule')}</Text>
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
                              <Text style={styles.actionButtonText}>{t('orderDetails.payButton')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.rescheduleButton]}
                              onPress={() => openDatePicker(index)}
                            >
                              <Text style={styles.rescheduleButtonText}>{t('orderDetails.reschedule')}</Text>
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
            <Text style={styles.noDataText}>{t('orderDetails.noInstallmentData')}</Text>
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
              <Text style={styles.modalTitle}>{t('orderDetails.selectPaymentMethod')}</Text>

              {paymentLoading ? (
                <View style={styles.paymentLoadingContainer}>
                  <ActivityIndicator size="small" color="#2C2C2E" />
                  <Text style={styles.paymentLoadingText}>{t('orderDetails.loadingPaymentMethods')}</Text>
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
                    {t('orderDetails.noPaymentMethods')}
                  </Text>
                  <Text style={styles.noPaymentMethodsSubtext}>
                    {t('orderDetails.addPaymentMethod')}
                  </Text>
                </View>
              )}

              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>{t('orderDetails.amount')}</Text>
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
                    <Text style={styles.payButtonText}>{t('orderDetails.processing')}</Text>
                  </View>
                ) : (
                  <Text style={styles.payButtonText}>
                    {paymentOptions.length === 0 ? t('orderDetails.noPaymentMethods') : t('orderDetails.payNow')}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('orderDetails.cancel')}</Text>
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
    backgroundColor: "#8B4513"
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
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#8B4513",
    borderStyle: "solid",
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
    color: '#8B4513', // Changed to brown - keep all other styling
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
    borderColor: '#8B4513', // Keep brown border
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
    backgroundColor: '#8B4513', // Keep brown
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: '120%',
    backgroundColor: '#E8E8E8',
    zIndex: 1,
  },
  timelineLineCompleted: {
    backgroundColor: '#8B4513', // Keep brown
  },
  installmentCard: {
    flex: 1,
    backgroundColor: "#FFF8F0", // Keep cream background
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#8B4513", // Keep brown border
    borderStyle: "solid",
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
    backgroundColor: '#000000', // Changed to black background
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: "center",
  },
  rescheduleButton: {
    backgroundColor: "#FFF", // Keep white background
    borderWidth: 1,
    borderColor: "#E8E8E8", // Keep gray border
    borderStyle: "solid",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff" // Keep white text for contrast with black background
  },
  rescheduleButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666" // Keep gray text
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
  // Update pending status to use brown color theme
  pendingStatusTag: {
    backgroundColor: '#FFF8F0', // Changed to cream background like other brown theme elements
    borderWidth: 1,
    borderColor: '#8B4513', // Added brown border
    borderStyle: 'solid',
  },
  pendingStatusText: {
    color: '#8B4513', // Changed to brown text
  },
  paidStatusTag: {
    backgroundColor: '#E8F5E8', // Keep original green background
  },
  paidStatusText: {
    color: '#4CAF50', // Keep original green text
  },
  overdueStatusTag: {
    backgroundColor: '#FFEBEE', // Keep original red background
  },
  overdueStatusText: {
    color: '#F44336', // Keep original red text
  },
  defaultStatusTag: {
    backgroundColor: '#F5F5F5', // Keep original gray background
  },
  defaultStatusText: {
    color: '#666', // Keep original gray text
  },
  
  // Update button colors only
  payButton: {
    backgroundColor: '#000000', // Changed to black background
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
  },
  paymentOptionSelected: {
    backgroundColor: "#E8F5E8", // Reverted to original light green background
    borderColor: "#4CAF50", // Reverted to original green border
  },
  
  // Update loading spinner colors only (keep positioning)
  circleCancelled: {
    backgroundColor: "#8B4513" // Changed to brown
  },
  
  // Fix payment modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Fix payment option styling
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderStyle: "solid",
  },
  
  paymentOptionSelected: {
    backgroundColor: "#E8F5E8", // Light green background
    borderColor: "#4CAF50", // Green border
    borderWidth: 2,
  },
  
  paymentIcon: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  
  cardHolderText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Fix loading and no payment methods containers
  paymentLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  
  paymentLoadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  
  noPaymentMethodsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  
  noPaymentMethodsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginTop: 16,
    textAlign: 'center',
  },
  
  noPaymentMethodsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Fix amount section
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginVertical: 16,
  },
  
  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  
  // Fix pay button
  payButton: {
    backgroundColor: '#000000', // Keep black background
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  
  payButtonDisabled: {
    backgroundColor: '#E8E8E8',
    opacity: 0.6,
  },
  
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: "#fff",
  },
  
  // Fix cancel button
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  
  // Fix loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  
  // Fix no data container
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // ...keep all other existing styles unchanged...
});