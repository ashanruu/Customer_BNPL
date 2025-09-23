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
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';

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
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Order Details Display */}
          <View style={styles.inputSection}>

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
              <View style={styles.displayField}>
                <View style={styles.instalmentContent}>
                  <Text style={styles.displayText}>{orderDetails.instalments} Months</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.submitButtonContainer}>
          <CustomButton
            title="Continue"
            size="medium"
            variant="primary"
            onPress={handleContinue}
          />
        </View>
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
});