import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const LegalTermsAndConditionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [termsContent, setTermsContent] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // Default terms content
  const getDefaultTermsContent = (): string => {
    return `
TERMS AND CONDITIONS

Last updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using this Buy Now Pay Later (BNPL) service, you accept and agree to be bound by the terms and provision of this agreement.

2. DESCRIPTION OF SERVICE
Our BNPL service allows you to make purchases and pay for them in installments over a predetermined period. This service is subject to credit approval and specific terms and conditions.

3. ELIGIBILITY
To use our service, you must:
• Be at least 18 years old
• Have a valid government-issued ID
• Provide accurate personal and financial information
• Meet our credit assessment criteria

4. PAYMENT TERMS
• Payments are due on the specified dates
• Late payment fees may apply
• Failure to make payments may affect your credit score
• We reserve the right to suspend services for non-payment

5. PRIVACY POLICY
We collect and use your personal information in accordance with our Privacy Policy. By using our service, you consent to such collection and use.

6. LIMITATION OF LIABILITY
Our liability is limited to the maximum extent permitted by law. We are not responsible for any indirect, incidental, or consequential damages.

7. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use of our service constitutes acceptance of modified terms.

8. CONTACT INFORMATION
For questions about these terms, please contact our customer service team.

9. GOVERNING LAW
These terms are governed by the laws of [Your Jurisdiction].

10. SEVERABILITY
If any provision of these terms is found to be unenforceable, the remaining provisions will continue to be in effect.
`;
  };

  useEffect(() => {
    setTermsContent(getDefaultTermsContent());
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Just refresh the content with the same default terms
    setTimeout(() => {
      setTermsContent(getDefaultTermsContent());
      setRefreshing(false);
    }, 1000);
  };

  const formatContent = (content: string) => {
    // Split content into sections for better formatting
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      const lines = section.split('\n');
      const title = lines[0];
      const body = lines.slice(1).join('\n');

      // Check if it's a numbered section
      const isNumberedSection = /^\d+\./.test(title);
      
      return (
        <View key={index} style={styles.section}>
          {title && (
            <Text style={[
              styles.sectionTitle,
              isNumberedSection && styles.numberedSectionTitle
            ]}>
              {title}
            </Text>
          )}
          {body && (
            <Text style={styles.sectionContent}>
              {body}
            </Text>
          )}
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('navigation.termsConditions')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor={'#4CAF50'}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Header Information */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
              <Text style={styles.infoTitle}>Legal Document</Text>
            </View>
            <Text style={styles.infoDescription}>
              Please read these terms and conditions carefully before using our service.
            </Text>
          </View>

          {/* Terms Content */}
          <View style={styles.termsCard}>
            {formatContent(termsContent)}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
            </View>
            <Text style={styles.footerText}>
              These terms are effective as of the last updated date shown above.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  
  // Content styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 16,
  },
  
  // Info card styles
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  
  // Terms card styles
  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  numberedSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    textAlign: 'justify',
  },
  
  // Footer styles
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  footerIcon: {
    marginRight: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default LegalTermsAndConditionsScreen;