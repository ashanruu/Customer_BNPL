import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { callMobileApi } from '../../scripts/api';

type RootStackParamList = {
  Main: undefined;
  KycScreen: undefined;
  AddressDetailsScreen: undefined;
};

const KycScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const [hasSkipped, setHasSkipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Execute CustomerOnboard API when component mounts
  useEffect(() => {
    const executeCustomerOnboard = async () => {
      try {
        console.log('Executing CustomerOnboard API...');
        
        const response = await callMobileApi(
          'CustomerOnboard',
          {}, // empty payload as requested
          'api/payment',
          '',
          'payment'
        );

        console.log('CustomerOnboard response:', response);
        
        if (response.statusCode === 200) {
          setOnboardingComplete(true);
          console.log('Customer onboarding completed successfully');
        } else {
          console.warn('CustomerOnboard failed:', response.message);
          Alert.alert('Warning', 'Customer onboarding process encountered an issue, but you can continue.');
        }
      } catch (error: any) {
        console.error('CustomerOnboard error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to complete onboarding process.';
        Alert.alert('Error', errorMessage);
      }
    };

    executeCustomerOnboard();
  }, []);

  const handleVerifyKyc = () => {
    if (hasSkipped) return; 

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      //navigation.navigate('HomeScreen'); 
    }, 1500);
  };

  const handleSkip = () => {
    setHasSkipped(true);
    // Navigate to main after 1 second
    setTimeout(() => {
      try {
        navigation.navigate('Main');
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        navigation.goBack();
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <Text style={styles.headerSubtitle}>
            Verify your identity to unlock all features
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="shield-check" 
              size={80} 
              color={hasSkipped ? "#ccc" : "#4CAF50"} 
            />
          </View>

          {/* Main Content */}
          <View style={styles.textContent}>
            <Text style={[styles.title, hasSkipped && styles.disabledText]}>
              Secure Your Account
            </Text>
            <Text style={[styles.description, hasSkipped && styles.disabledText]}>
              KYC (Know Your Customer) verification helps us ensure the security of your account and comply with financial regulations.
            </Text>

            {/* Benefits List */}
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color={hasSkipped ? "#ccc" : "#4CAF50"} 
                />
                <Text style={[styles.benefitText, hasSkipped && styles.disabledText]}>
                  Higher transaction limits
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color={hasSkipped ? "#ccc" : "#4CAF50"} 
                />
                <Text style={[styles.benefitText, hasSkipped && styles.disabledText]}>
                  Enhanced security features
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={20} 
                  color={hasSkipped ? "#ccc" : "#4CAF50"} 
                />
                <Text style={[styles.benefitText, hasSkipped && styles.disabledText]}>
                  Access to premium services
                </Text>
              </View>
            </View>

            {hasSkipped && (
              <View style={styles.skippedMessage}>
                <Text style={styles.skippedText}>
                  KYC verification skipped. You can complete it later from your profile.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (hasSkipped || loading) && styles.disabledButton
            ]}
            onPress={handleVerifyKyc}
            disabled={hasSkipped || loading}
          >
            <Text style={[
              styles.verifyButtonText,
              (hasSkipped || loading) && styles.disabledButtonText
            ]}>
              {loading ? 'Processing...' : 'Verify KYC'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipButton, hasSkipped && styles.disabledButton]}
            onPress={handleSkip}
            disabled={hasSkipped}
          >
            <Text style={[
              styles.skipButtonText,
              hasSkipped && styles.disabledButtonText
            ]}>
              {hasSkipped ? 'Skipped' : 'Skip for Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your information is secure and encrypted
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KycScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  textContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  skippedMessage: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
    marginTop: 20,
  },
  skippedText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  disabledButtonText: {
    color: '#999',
  },
  disabledText: {
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

