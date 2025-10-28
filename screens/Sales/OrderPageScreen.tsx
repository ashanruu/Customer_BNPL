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
import CustomButton from '../../components/CustomButton';
import { fetchOrderDetails, createLoan } from '../../scripts/api';
import { useTranslation } from 'react-i18next';

const OrderPageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  // Get parameters from route (could come from QR code scan or deep link)
  const qrData = (route.params as any)?.qrData || '';
  const routeOrderId = (route.params as any)?.orderId || '';
  const saleCode = (route.params as any)?.saleCode || '';
  const merchantId = (route.params as any)?.merchantId || '';
  const deepLinkUrl = (route.params as any)?.url || '';
  
  // Determine order ID from various sources
  const orderId = routeOrderId || saleCode || merchantId || extractOrderIdFromQR(qrData) || extractOrderIdFromURL(deepLinkUrl);

  // State for order details and loading
  const [orderDetails, setOrderDetails] = useState({
    merchantName: '',
    orderId: '',
    saleId: 0,
    amount: '',
    note: '',
    status: '',
    createdDate: '',
    merchantId: '',
    customerId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creatingLoan, setCreatingLoan] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'once' | 'installments'>('installments');

  // Extract order ID from deep link URL
  function extractOrderIdFromURL(url: string): string {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      
      // Handle verified domain: https://merchant.bnpl.hexdive.com/...
      if (urlObj.hostname === 'merchant.bnpl.hexdive.com') {
        // Handle sale URLs: /sale/123
        if (urlObj.pathname.startsWith('/sale/')) {
          const saleCode = urlObj.pathname.split('/sale/')[1];
          return saleCode || '';
        }
        
        // Handle merchant URLs: /merchant/32
        if (urlObj.pathname.startsWith('/merchant/')) {
          const merchantId = urlObj.pathname.split('/merchant/')[1];
          return merchantId || '';
        }
        
        // Handle query parameters
        const saleCode = urlObj.searchParams.get('salecode') || urlObj.searchParams.get('saleCode');
        if (saleCode) return saleCode;
        
        const merchantId = urlObj.searchParams.get('merchantId') || urlObj.searchParams.get('merchantid');
        if (merchantId) return merchantId;
      }
      
      return '';
    } catch (error) {
      console.error('Error extracting order ID from URL:', error);
      return '';
    }
  }

  // Extract order ID from QR code data
  function extractOrderIdFromQR(qrString: string): string {
    try {
      if (qrString.startsWith('{')) {
        const qrJson = JSON.parse(qrString);
        return qrJson.orderId || qrJson.id || qrJson.orderNumber || qrJson.saleId || '';
      }

      if (qrString.includes('/sale/')) {
        const match = qrString.match(/\/sale\/([^\/\?&]+)/);
        return match ? match[1] : '';
      }

      if (qrString.includes('orderId=')) {
        const match = qrString.match(/orderId=([^&]+)/);
        return match ? match[1] : '';
      }

      if (qrString.includes('id=')) {
        const match = qrString.match(/id=([^&]+)/);
        return match ? match[1] : '';
      }

      if (qrString.includes('saleId=')) {
        const match = qrString.match(/saleId=([^&]+)/);
        return match ? match[1] : '';
      }

      return qrString;
    } catch (error) {
      console.error('Error extracting order ID from QR:', error);
      return '';
    }
  }

  const fetchOrderDetailsData = async (orderIdToFetch: string) => {
    if (!orderIdToFetch) {
      setError(t('orderPage.noOrderIdAvailable'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching order details for ID:', orderIdToFetch);

      const response = await fetchOrderDetails(orderIdToFetch);

      console.log('GetCusSaleDetailId response:', response);

      if (response.statusCode === 200 && response.data) {
        const orderData = response.data;

        setOrderDetails({
          merchantName: orderData.provider || t('orderPage.na'),
          orderId: orderData.saleCode || orderIdToFetch,
          saleId: orderData.saleId || 0,
          amount: orderData.salesAmount?.toString() || '0',
          note: orderData.productName || t('orderPage.noProductInfo'),
          status: orderData.paymentStatus || 'Unknown',
          createdDate: orderData.saleDate || new Date().toISOString(),
          merchantId: orderData.fK_MerchantId?.toString() || '',
          customerId: orderData.fK_CusId?.toString() || '',
        });
      } else {
        setError(response.message || t('orderPage.unableToLoadOrder'));
        Alert.alert(t('sales.error'), response.message || t('orderPage.unableToLoadOrder'));
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      const errorMessage = error.response?.data?.message || error.message || t('orderPage.unableToLoadOrder');
      setError(errorMessage);
      Alert.alert(t('sales.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load order details when component mounts
  useEffect(() => {
    if (orderId) {
      fetchOrderDetailsData(orderId);
    } else {
      setError(t('orderPage.noOrderIdAvailable'));
    }
  }, [orderId]);

  const handleContinue = async () => {
    if (!orderDetails.orderId || !orderDetails.saleId) {
      Alert.alert(t('sales.error'), t('orderPage.orderDetailsNotLoaded'));
      return;
    }

    setCreatingLoan(true);

    try {
      console.log('Creating loan for sale ID:', orderDetails.saleId);

      // Determine number of installments based on selected payment option
      const noOfInstallment = selectedPaymentOption === 'once' ? 1 : 3;
      console.log('Selected payment option:', selectedPaymentOption, 'Number of installments:', noOfInstallment);

      // Call CreateLoan API with the numeric saleId and noOfInstallment
      const loanResponse = await createLoan(orderDetails.saleId, noOfInstallment);

      console.log('CreateLoan response:', loanResponse);

      if (loanResponse.statusCode === 200) {
        console.log('Loan created successfully');

        // Navigate to PaymentProcessScreen with order data and loan response
        (navigation as any).navigate('PaymentProcessScreen', {
          orderDetails: orderDetails,
          orderId: orderDetails.orderId,
          saleId: orderDetails.saleId,
          loanData: loanResponse.data,
          paymentOption: selectedPaymentOption,
          installments: noOfInstallment,
        });
      } else {
        Alert.alert(t('sales.error'), loanResponse.message || t('orderPage.failedToCreateLoan'));
      }
    } catch (error: any) {
      console.error('Error creating loan:', error);
      const errorMessage = error.response?.data?.message || error.message || t('orderPage.failedToCreateLoan');
      Alert.alert(t('orderPage.loanCreationError'), errorMessage);
    } finally {
      setCreatingLoan(false);
    }
  };

  const handleRetry = () => {
    if (orderId) {
      fetchOrderDetailsData(orderId);
    } else {
      Alert.alert(t('sales.error'), t('orderPage.noOrderIdAvailable'));
    }
  };

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
          <Text style={styles.headerTitle}>{t('orderPage.title')}</Text>
          <Text style={styles.subText}>{t('orderPage.subtitle')}</Text>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {loading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>{t('orderPage.loadingOrderDetails')}</Text>
          </View>
        ) : error ? (
          // Error state
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>{t('orderPage.unableToLoadOrder')}</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>{t('orderPage.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Order details loaded successfully
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Order Details Display */}
            <View style={styles.inputSection}>
              {/* Order Status Badge */}
              {orderDetails.status && (
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge,
                  orderDetails.status.toLowerCase() === 'active' ? styles.statusActive :
                    orderDetails.status.toLowerCase() === 'completed' ? styles.statusCompleted :
                      orderDetails.status.toLowerCase() === 'pending' ? styles.statusPending :
                        styles.statusDefault
                  ]}>
                    <Text style={styles.statusText}>
                      {orderDetails.status.toLowerCase() === 'active' ? t('orderPage.active') :
                       orderDetails.status.toLowerCase() === 'completed' ? t('orderPage.completed') :
                       orderDetails.status.toLowerCase() === 'pending' ? t('orderPage.pending') :
                       orderDetails.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Order Details */}
              <View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconLabel}>
                    <Ionicons name="storefront-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>{t('orderPage.merchantName')}</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {orderDetails.merchantName || t('orderPage.na')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconLabel}>
                    <Ionicons name="barcode-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>{t('orderPage.salesCode')}</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {orderDetails.orderId || t('orderPage.na')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconLabel}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>{t('orderPage.orderDate')}</Text>
                  </View>
                  <Text style={styles.detailValue}>
                    {orderDetails.createdDate ? new Date(orderDetails.createdDate).toLocaleDateString() : t('orderPage.na')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconLabel}>
                    <Ionicons name="cube-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>{t('orderPage.product')}</Text>
                  </View>
                  <Text style={styles.detailValue} numberOfLines={2}>
                    {orderDetails.note || t('orderPage.noProductInfo')}
                  </Text>
                </View>
              </View>

              {/* Amount Card */}
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>{t('orderPage.totalAmount')}</Text>
                <Text style={styles.amountValue}>
                  LKR {orderDetails.amount ? parseFloat(orderDetails.amount).toFixed(2) : '0.00'}
                </Text>
              </View>
            </View>

            {/* Payment Options Section Title */}
            <Text style={styles.detailLabel}>{t('orderPage.paymentOptions')}</Text>

            {/* Payment Option Selection */}
            <View style={styles.paymentOptionsContainer}>
              {/* Pay Once Option */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentOption === 'once' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPaymentOption('once')}
              >
                <View style={styles.paymentOptionHeader}>
                  <View style={styles.paymentOptionTitleRow}>
                    <Ionicons
                      name="wallet-outline"
                      size={20}
                      color={selectedPaymentOption === 'once' ? '#4CAF50' : '#666'}
                    />
                    <Text style={[
                      styles.paymentOptionTitle,
                      selectedPaymentOption === 'once' && styles.paymentOptionTitleSelected
                    ]}>
                      {t('orderPage.payOnce')}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentOption === 'once' && styles.radioButtonSelected
                  ]}>
                    {selectedPaymentOption === 'once' && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
                <Text style={[
                  styles.paymentOptionDescription,
                  selectedPaymentOption === 'once' && styles.paymentOptionDescriptionSelected
                ]}>
                  {t('orderPage.completePaymentFull')}
                </Text>
                <Text style={[
                  styles.paymentOptionAmount,
                  selectedPaymentOption === 'once' && styles.paymentOptionAmountSelected
                ]}>
                  LKR {orderDetails.amount ? parseFloat(orderDetails.amount).toFixed(2) : '0.00'}
                </Text>
              </TouchableOpacity>

              {/* Installments Option */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  selectedPaymentOption === 'installments' && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPaymentOption('installments')}
              >
                <View style={styles.paymentOptionHeader}>
                  <View style={styles.paymentOptionTitleRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={selectedPaymentOption === 'installments' ? '#4CAF50' : '#666'}
                    />
                    <Text style={[
                      styles.paymentOptionTitle,
                      selectedPaymentOption === 'installments' && styles.paymentOptionTitleSelected
                    ]}>
                      {t('orderPage.installments')}
                    </Text>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedPaymentOption === 'installments' && styles.radioButtonSelected
                  ]}>
                    {selectedPaymentOption === 'installments' && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
                <Text style={[
                  styles.paymentOptionDescription,
                  selectedPaymentOption === 'installments' && styles.paymentOptionDescriptionSelected
                ]}>
                  {t('orderPage.splitPayment')}
                </Text>
                <Text style={[
                  styles.paymentOptionAmount,
                  selectedPaymentOption === 'installments' && styles.paymentOptionAmountSelected
                ]}>
                  LKR {orderDetails.amount ? (parseFloat(orderDetails.amount) / 3).toFixed(2) : '0.00'} {t('orderPage.perInstallment')}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Continue Button - only show when order details are loaded and no error */}
        {!loading && !error && orderDetails.orderId && (
          <View style={styles.submitButtonContainer}>
            <CustomButton
              title={creatingLoan ? t('orderPage.creatingLoan') :
                selectedPaymentOption === 'once' ? t('orderPage.payFullAmount') : t('orderPage.continueToInstallments')}
              size="medium"
              variant="primary"
              onPress={handleContinue}
              loading={creatingLoan}
              disabled={creatingLoan}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flex: 1,
    paddingBottom: 20,
  },
  inputSection: {
    flex: 1,
  },
  submitButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  statusActive: {
    backgroundColor: '#E8F5E8',
  },
  statusCompleted: {
    backgroundColor: '#E3F2FD',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusDefault: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.5,
  },
  paymentOptionsContainer: {
    marginTop: 12,
    marginBottom: 24,
    gap: 16,
  },
  paymentOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderColor: '#E5E5E5',
    borderWidth: 2,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  paymentOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
    elevation: 4,
    shadowOpacity: 0.1,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentOptionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  paymentOptionTitleSelected: {
    color: '#4CAF50',
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  paymentOptionDescriptionSelected: {
    color: '#333',
  },
  paymentOptionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  paymentOptionAmountSelected: {
    color: '#4CAF50',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  amountCard: {
    padding: 18,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: -0.5,
  },
});