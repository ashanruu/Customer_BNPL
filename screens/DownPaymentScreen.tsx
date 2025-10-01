import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

const DownPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get data from route params
  const {
    orderDetails,
    orderId,
    saleId,
    loanData,
    paymentOption,
    installments
  } = (route.params as any) || {};

  const [processing, setProcessing] = useState(false);
  const [downPaymentAmount, setDownPaymentAmount] = useState(0);

  useEffect(() => {
    // Calculate down payment amount (typically 30-40% of total amount for installments)
    if (orderDetails?.amount && paymentOption === 'installments') {
      const totalAmount = parseFloat(orderDetails.amount);
      const downPayment = totalAmount * 0.33; // 33% down payment
      setDownPaymentAmount(downPayment);
    }
  }, [orderDetails, paymentOption]);

  const handlePayDownPayment = async () => {
    if (!orderDetails?.orderId || !orderDetails?.saleId) {
      Alert.alert('Error', 'Order details not available. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      // Simulate processing down payment
      // In a real app, you would call your payment API here
      console.log('Processing down payment for:', {
        saleId: orderDetails.saleId,
        downPaymentAmount: downPaymentAmount,
        totalAmount: orderDetails.amount,
        installments: installments
      });

      // Simulate API call delay
      setTimeout(() => {
        console.log('Down payment processed successfully');
        
        // Navigate to PaymentProcessScreen with all the necessary data
        (navigation as any).navigate('PaymentProcessScreen', {
          orderDetails: orderDetails,
          orderId: orderId,
          saleId: saleId,
          loanData: loanData,
          paymentOption: paymentOption,
          installments: installments,
          downPaymentAmount: downPaymentAmount,
          isDownPaymentFlow: true
        });
        
        setProcessing(false);
      }, 2000);

    } catch (error: any) {
      console.error('Error processing down payment:', error);
      Alert.alert('Payment Error', 'Failed to process down payment. Please try again.');
      setProcessing(false);
    }
  };

  const remainingAmount = orderDetails?.amount ? 
    parseFloat(orderDetails.amount) - downPaymentAmount : 0;

  const monthlyInstallment = remainingAmount / (installments - 1); // Minus 1 because down payment is the first installment

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={22} color="#666" />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>Down Payment</Text>
          <Text style={styles.subText}>Complete your down payment to proceed</Text>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Payment Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="card-outline" size={24} color="#4CAF50" />
              <Text style={styles.summaryTitle}>Payment Summary</Text>
            </View>

            {/* Total Amount */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>
                LKR {orderDetails?.amount ? parseFloat(orderDetails.amount).toLocaleString() : '0'}
              </Text>
            </View>

            {/* Down Payment */}
            <View style={[styles.summaryRow, styles.highlightRow]}>
              <Text style={styles.summaryLabelHighlight}>Down Payment (33%)</Text>
              <Text style={styles.summaryValueHighlight}>
                LKR {downPaymentAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </Text>
            </View>

            {/* Remaining Amount */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining Amount</Text>
              <Text style={styles.summaryValue}>
                LKR {remainingAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Installment Info */}
            <View style={styles.installmentInfo}>
              <Text style={styles.installmentTitle}>Remaining Installments</Text>
              <Text style={styles.installmentDetails}>
                {installments - 1} monthly payments of{' '}
                <Text style={styles.installmentAmount}>
                  LKR {monthlyInstallment.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </Text>
              </Text>
            </View>
          </View>

          {/* Order Details Card */}
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Ionicons name="receipt-outline" size={20} color="#666" />
              <Text style={styles.orderTitle}>Order Details</Text>
            </View>

            <View style={styles.orderDetail}>
              <Text style={styles.orderLabel}>Provider</Text>
              <Text style={styles.orderValue}>{orderDetails?.merchantName || 'N/A'}</Text>
            </View>

            <View style={styles.orderDetail}>
              <Text style={styles.orderLabel}>Sale Code</Text>
              <Text style={styles.orderValue}>{orderDetails?.orderId || 'N/A'}</Text>
            </View>

            <View style={styles.orderDetail}>
              <Text style={styles.orderLabel}>Product</Text>
              <Text style={styles.orderValue}>{orderDetails?.note || 'No product information'}</Text>
            </View>
          </View>

          {/* Payment Method Info */}
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodHeader}>
              <Text style={styles.paymentMethodTitle}>Payment Method</Text>
            </View>
            <Text style={styles.paymentMethodText}>
              You will be redirected to complete your down payment using Visa or Mastercard
            </Text>
          </View>

        </ScrollView>

        {/* Pay Down Payment Button */}
        <View style={styles.submitButtonContainer}>
          <CustomButton
            title={processing ? "Processing..." : `Pay Down Payment - LKR ${downPaymentAmount.toLocaleString(undefined, {maximumFractionDigits: 2})}`}
            size="medium"
            variant="primary"
            onPress={handlePayDownPayment}
            loading={processing}
            disabled={processing}
          />
        </View>
      </View>
    </View>
  );
};

export default DownPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flex: 1,
  },
  
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  highlightRow: {
    backgroundColor: '#F8FFF8',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  summaryLabelHighlight: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
  },
  installmentInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  installmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  installmentDetails: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  installmentAmount: {
    fontWeight: '600',
    color: '#4CAF50',
  },

  // Order Card Styles
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  orderLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },

  // Payment Method Card Styles
  paymentMethodCard: {
    backgroundColor: '#FFF8F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFE0D6',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5722',
    marginLeft: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  submitButtonContainer: {
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 30,
  },
});