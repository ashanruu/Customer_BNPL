import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import { fetchOrderDetails } from '../scripts/api';

const OrderPageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get order ID from route params (could come from QR code scan)
  const qrData = (route.params as any)?.qrData || '';
  const orderId = (route.params as any)?.orderId || extractOrderIdFromQR(qrData);
  
  // State for order details and loading
  const [orderDetails, setOrderDetails] = useState({
    merchantName: '',
    orderId: '',
    amount: '',
    note: '',
    instalments: 3,
    status: '',
    createdDate: '',
    merchantId: '',
    customerId: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract order ID from QR code data
  function extractOrderIdFromQR(qrString: string): string {
    try {
      // If QR contains JSON, parse it
      if (qrString.startsWith('{')) {
        const qrJson = JSON.parse(qrString);
        return qrJson.orderId || qrJson.id || qrJson.orderNumber || qrJson.saleId || '';
      }
      
      // If QR contains URL with sale ID in path (e.g., https://bnplqr.hexdive.com/sale/512820250923215100)
      if (qrString.includes('/sale/')) {
        const match = qrString.match(/\/sale\/([^\/\?&]+)/);
        return match ? match[1] : '';
      }
      
      // If QR contains URL with order ID parameter
      if (qrString.includes('orderId=')) {
        const match = qrString.match(/orderId=([^&]+)/);
        return match ? match[1] : '';
      }
      
      // If QR contains URL with id parameter
      if (qrString.includes('id=')) {
        const match = qrString.match(/id=([^&]+)/);
        return match ? match[1] : '';
      }
      
      // If QR contains URL with saleId parameter
      if (qrString.includes('saleId=')) {
        const match = qrString.match(/saleId=([^&]+)/);
        return match ? match[1] : '';
      }
      
      // If QR is just the order ID
      return qrString;
    } catch (error) {
      console.error('Error extracting order ID from QR:', error);
      return '';
    }
  }

  // Fetch order details using the API
  const fetchOrderDetailsData = async (orderIdToFetch: string) => {
    if (!orderIdToFetch) {
      setError('No order ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching order details for ID:', orderIdToFetch);

      const response = await fetchOrderDetails(orderIdToFetch);

      console.log('GetCusSaleDetailId response:', response);

      if (response.statusCode === 200 && response.payload) {
        const orderData = response.payload;
        
        setOrderDetails({
          merchantName: orderData.merchantName || orderData.MerchantName || 'N/A',
          orderId: orderData.orderId || orderData.OrderId || orderIdToFetch,
          amount: orderData.amount || orderData.Amount || orderData.totalAmount || '0',
          note: orderData.note || orderData.Note || orderData.description || 'No notes available',
          instalments: orderData.instalments || orderData.Instalments || orderData.installmentCount || 3,
          status: orderData.status || orderData.Status || 'Unknown',
          createdDate: orderData.createdDate || orderData.CreatedDate || new Date().toISOString(),
          merchantId: orderData.merchantId || orderData.MerchantId || '',
          customerId: orderData.customerId || orderData.CustomerId || '',
        });
      } else {
        setError(response.message || 'Failed to fetch order details');
        Alert.alert('Error', response.message || 'Failed to fetch order details');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order details';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load order details when component mounts
  useEffect(() => {
    if (orderId) {
      fetchOrderDetailsData(orderId);
    } else {
      setError('No order ID found in QR code or parameters');
      
      // For testing purposes, you can uncomment this line to use a demo order ID
      // fetchOrderDetailsData('DEMO123');
    }
  }, [orderId]);

  const handleContinue = () => {
    if (!orderDetails.orderId) {
      Alert.alert('Error', 'Order details not loaded. Please try again.');
      return;
    }

    console.log('Order data:', orderDetails);
    
    // Navigate to PaymentProcessScreen with order data
    (navigation as any).navigate('PaymentProcessScreen', {
      orderDetails: orderDetails,
      orderId: orderDetails.orderId,
    });
  };

  const handleRetry = () => {
    if (orderId) {
      fetchOrderDetailsData(orderId);
    } else {
      Alert.alert('Error', 'No order ID available to retry');
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.subText}>Review your order information below</Text>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {loading ? (
          // Loading state
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading order details...</Text>
          </View>
        ) : error ? (
          // Error state
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Unable to Load Order</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
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
                    <Text style={styles.statusText}>{orderDetails.status.toUpperCase()}</Text>
                  </View>
                </View>
              )}

              {/* Merchant Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Merchant Name</Text>
                <View style={styles.displayField}>
                  <Text style={styles.displayText}>{orderDetails.merchantName || 'Loading...'}</Text>
                </View>
              </View>

              {/* Order ID */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Order ID</Text>
                <View style={styles.displayField}>
                  <Text style={styles.displayText}>{orderDetails.orderId || 'Loading...'}</Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount</Text>
                <View style={styles.displayField}>
                  <Text style={styles.amountText}>
                    LKR {orderDetails.amount ? parseFloat(orderDetails.amount).toLocaleString() : 'Loading...'}
                  </Text>
                </View>
              </View>

              {/* Note */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Note</Text>
                <View style={[styles.displayField, styles.noteField]}>
                  <Text style={styles.displayText}>{orderDetails.note || 'No notes available'}</Text>
                </View>
              </View>

              {/* Instalments */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Instalments</Text>
                <View style={styles.displayField}>
                  <View style={styles.instalmentContent}>
                    <Text style={styles.displayText}>{orderDetails.instalments} Months</Text>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                  </View>
                </View>
              </View>

              {/* Created Date */}
              {orderDetails.createdDate && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Order Date</Text>
                  <View style={styles.displayField}>
                    <Text style={styles.displayText}>
                      {new Date(orderDetails.createdDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {/* Continue Button - only show when order details are loaded and no error */}
        {!loading && !error && orderDetails.orderId && (
          <View style={styles.submitButtonContainer}>
            <CustomButton
              title="Continue to Payment"
              size="medium"
              variant="primary"
              onPress={handleContinue}
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
  inputSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    marginTop: 6,
    marginBottom: 10,
  },
  displayField: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    elevation: 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  displayText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  noteField: {
    minHeight: 80,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  instalmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitButtonContainer: {
    alignSelf: 'center',
    width: '75%',
    paddingBottom: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});