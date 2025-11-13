import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import CustomCheckbox from '../../components/CustomCheckbox';

type RootStackParamList = {
  RegWithAgreementScreen: undefined;
  RegWithPasswordScreen: undefined;
};

type RegWithAgreementNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithAgreementScreen'
>;

const RegWithAgreementScreen: React.FC = () => {
  const navigation = useNavigation<RegWithAgreementNavigationProp>();
  const [isAgreed, setIsAgreed] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleNext = () => {
    if (isAgreed) {
      // Navigate to next screen
      navigation.navigate('RegWithPasswordScreen');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={false}
      topTitle="Read & Agree to our"
      mainTitle="Terms & Conditions"
      description=""
      buttonText="Next"
      onButtonPress={handleNext}
      buttonDisabled={!isAgreed}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* Terms Content - Scrollable */}
        <ScrollView 
          style={styles.termsScrollView}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.termsContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By creating a PayMedia BNPL account, you agree to be bound by these Terms and Conditions. Please read them carefully before proceeding.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Service Description</Text>
            <Text style={styles.sectionText}>
              PayMedia BNPL provides Buy Now Pay Later services allowing you to make purchases and pay in installments. Credit limits are determined based on your credit assessment and payment history.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Provide accurate and complete information during registration</Text>
              <Text style={styles.bulletItem}>• Maintain the confidentiality of your account credentials</Text>
              <Text style={styles.bulletItem}>• Make timely payments according to agreed schedules</Text>
              <Text style={styles.bulletItem}>• Notify us of any unauthorized account access</Text>
              <Text style={styles.bulletItem}>• Use the service only for lawful purposes</Text>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Credit and Payment Terms</Text>
            <Text style={styles.sectionText}>
              Your credit limit is subject to approval and may be adjusted based on your payment behavior. Late payments may result in fees and impact your credit score.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Privacy and Data Protection</Text>
            <Text style={styles.sectionText}>
              We collect and process your personal information in accordance with our Privacy Policy. Your data is used to assess creditworthiness and provide services.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Account Termination</Text>
            <Text style={styles.sectionText}>
              We reserve the right to suspend or terminate your account for violation of these terms, fraudulent activity, or non-payment.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We may update these Terms and Conditions periodically. Continued use of the service after changes constitutes acceptance of new terms.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={[styles.section, { marginBottom: 0 }]}>
            <Text style={styles.sectionTitle}>8. Contact Information</Text>
            <Text style={styles.sectionText}>
              For questions or concerns about these terms, please contact our customer support team.
            </Text>
          </View>
        </ScrollView>

        {/* Checkbox Agreement */}
        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            checked={isAgreed}
            onToggle={() => setIsAgreed(!isAgreed)}
            size="medium"
            checkboxColor="#0066CC"
            disabled={!hasScrolledToEnd}
            label={
              <Text style={styles.checkboxLabel}>
                I have read and agree to the{' '}
                <Text style={styles.linkText}>Terms & Conditions</Text>
              </Text>
            }
          />
          {!hasScrolledToEnd && (
            <Text style={styles.scrollHintText}>
              Please scroll to the end to continue
            </Text>
          )}
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },
  termsScrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
  },
  termsContent: {
    padding: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  sectionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  checkboxContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  linkText: {
    color: '#0066CC',
    fontWeight: '500',
  },
  scrollHintText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#DC2626',
    marginTop: 8,
    marginLeft: 36,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
});

export default RegWithAgreementScreen;
