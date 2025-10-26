import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

// Define your stack param list according to your navigator setup
type RootStackParamList = {
  Main: undefined;
 
};

const PaymentProcessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { t } = useTranslation();

  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Simulate payment processing
    const processPayment = async () => {
      // Show processing for 3 seconds
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
        
        // Animate the success screen
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 3000);
    };

    processPayment();
  }, []);

  const handleNavigateToDashboard = () => {
   
    navigation.navigate('Main');
    
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color="#007AFF" style={styles.loadingSpinner} />
          <Text style={styles.processingTitle}>{t('payment.processingPayment')}</Text>
          <Text style={styles.processingSubtitle}>
            {t('payment.purchasingProcessing')}
          </Text>
          <Text style={styles.processingNote}>
            {t('payment.pleaseWait')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successContainer}>
        {/* Success Icon */}
        <Animated.View 
          style={[
            styles.successIconContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check" size={40} color="#fff" />
          </View>
        </Animated.View>

        {/* Success Content */}
        <Animated.View 
          style={[
            styles.successContent,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.successTitle}>{t('payment.paymentSuccessful')}</Text>
          
          {/* <Text style={styles.amount}>Rs. {orderData?.amount || '50.00'}</Text> */}
          
          <Text style={styles.paymentMethod}>{t('payment.paidUsing')}</Text>
          
          <Text style={styles.successMessage}>
            {t('payment.transactionMessage')}
          </Text>
        </Animated.View>

        {/* OK Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.okButton} 
            onPress={handleNavigateToDashboard}
          >
            <Text style={styles.okButtonText}>{t('payment.ok')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default PaymentProcessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginBottom: 30,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  processingNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  successIconContainer: {
    marginBottom: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successContent: {
    alignItems: 'center',
    marginBottom: 50,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: '300',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  paymentMethod: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  okButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
