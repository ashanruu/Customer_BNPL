import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const OrderPageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  

  // Predefined values (not editable)
  const orderDetails = {
    merchantName: '',
    orderId: '',
    amount: '',
    note: '',
    instalments: 3
  };

  const handleContinue = () => {
    console.log('Order data:', orderDetails);
    
    // Navigate to PaymentProcessScreen with order data
    (navigation as any).navigate('PaymentProcessScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Order Details Display */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Order Information</Text>

          {/* Merchant Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Merchant Name</Text>
            <View style={styles.displayField}>
              <Text style={styles.displayText}>{orderDetails.merchantName}</Text>
            </View>
          </View>

          {/* Order ID */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Order ID</Text>
            <View style={styles.displayField}>
              <Text style={styles.displayText}>{orderDetails.orderId}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.displayField}>
              <Text style={styles.amountText}>LKR {orderDetails.amount}</Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Note</Text>
            <View style={[styles.displayField, styles.noteField]}>
              <Text style={styles.displayText}>{orderDetails.note}</Text>
            </View>
          </View>

          {/* Instalments */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Instalments</Text>
            <View style={styles.instalmentContainer}>
              <Text style={styles.instalmentText}>{orderDetails.instalments} Months</Text>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#007AFF" />
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderPageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  qrDataContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  qrDataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 5,
  },
  qrDataText: {
    fontSize: 14,
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  displayField: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  displayText: {
    fontSize: 16,
    color: '#333',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  noteField: {
    minHeight: 60,
  },
  instalmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  instalmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});