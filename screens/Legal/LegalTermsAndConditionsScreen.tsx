import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TermsAndConditionsContent, { TermsSection } from '../../components/TermsAndConditionsContent';

const LegalTermsAndConditionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isAccepted, setIsAccepted] = useState(false);
  const [termsData, setTermsData] = useState<TermsSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch terms data - this can be from API or local storage
  useEffect(() => {
    fetchTermsData();
  }, []);

  const fetchTermsData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('YOUR_API_ENDPOINT/terms-and-conditions');
      // const data = await response.json();
      // setTermsData(data.sections);
      
      // For now, using static data that can be easily updated
      const defaultTerms: TermsSection[] = [
        {
          title: '1. Acceptance of Terms',
          content: 'By creating a PayMedia BNPL account, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.',
        },
        {
          title: '2. Service Description',
          content: 'PayMedia BNPL enables Buy Now Pay Later services allowing you to make purchases and pay in installments. Credit limits are determined based on your credit assessment and payment history.',
        },
        {
          title: '3. User Responsibilities',
          content: 'You agree to:',
          subItems: [
            'Provide accurate and complete information during registration',
            'Maintain confidentiality of your account credentials',
            'Make timely payments according to agreed schedules',
            'Notify us of any unauthorized account access',
            'Use the service only for lawful purposes',
          ],
        },
        {
          title: '4. Credit and Payment Terms',
          content: 'Your credit limit is subject to approval and may be adjusted based on your payment behavior. Late payments may incur fees and affect your credit score.',
        },
      ];
      
      setTermsData(defaultTerms);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading terms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.contentContainer}>
        <TermsAndConditionsContent
          sections={termsData}
          showCheckbox={true}
          checkboxLabel="I have read and agree to the Terms & Conditions"
          onCheckboxChange={(checked) => setIsAccepted(checked)}
          initialChecked={false}
          lastUpdated={new Date().toLocaleDateString()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});

export default LegalTermsAndConditionsScreen;