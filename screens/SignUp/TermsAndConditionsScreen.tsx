import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { MainText, SubText } from '../../components/CustomText';
import CustomCheckbox from '../../components/CustomCheckbox';
import CustomButton from '../../components/CustomButton';

type NavigationProp = {
  goBack: () => void;
  navigate: (screen: string, params?: any) => void;
};

type Props = {
  navigation: NavigationProp;
  route: any;
};

const TermsAndConditionsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [accepted, setAccepted] = useState(false);
  const { onAccept } = route.params || {};

  const handleAccept = () => {
    if (!accepted) {
      Alert.alert('Please Accept', 'You must accept the terms and conditions to continue.');
      return;
    }
    
    if (onAccept) {
      onAccept(true);
    }
    navigation.goBack();
  };

  const termsContent = [
    {
      title: "1. Acceptance of Terms",
      content: "By using our Buy Now, Pay Later (BNPL) service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and our company."
    },
    {
      title: "2. Eligibility Criteria",
      content: "• You must be at least 18 years old\n• You must have a valid government-issued photo identification\n• You must provide accurate and complete personal information\n• You must have a valid email address and phone number\n• You must meet our credit assessment criteria"
    },
    {
      title: "3. Payment Terms and Schedule",
      content: "• Initial payment: 25% of the total purchase amount due at checkout\n• Remaining payments: 3 equal installments due every 2 weeks\n• Late fee: $10 for payments overdue by more than 7 days\n• Failed payment fee: $5 per failed payment attempt\n• All payments are automatically charged to your selected payment method"
    },
    {
      title: "4. Credit Assessment",
      content: "We perform a soft credit check that does not affect your credit score. We may decline your application based on:\n• Credit history\n• Payment history with BNPL services\n• Current debt-to-income ratio\n• Other risk factors"
    },
    {
      title: "5. Privacy and Data Collection",
      content: "We collect and process your personal information including:\n• Contact information (name, address, phone, email)\n• Financial information (income, payment methods)\n• Credit information (credit score, payment history)\n• Transaction data\nYour data is protected according to our Privacy Policy and applicable data protection laws."
    },
    {
      title: "6. Merchant Partnerships",
      content: "• We partner with approved merchants to offer BNPL services\n• Returns and refunds are subject to the merchant's policy\n• We are not responsible for product quality or delivery issues\n• Disputes should first be addressed with the merchant"
    },
    {
      title: "7. Account Management",
      content: "• You can view payment schedules and make early payments through our app\n• Update your payment methods and personal information as needed\n• Contact customer service for payment modifications or concerns\n• Account statements are available electronically"
    },
    {
      title: "8. Limitation of Liability",
      content: "Our liability is limited to the maximum extent permitted by law. We are not responsible for:\n• Indirect, incidental, or consequential damages\n• Lost profits or business opportunities\n• Merchant-related issues\n• Service interruptions due to technical issues"
    },
    {
      title: "9. Termination",
      content: "We may suspend or terminate your account if you:\n• Fail to make payments as scheduled\n• Provide false or misleading information\n• Violate these terms and conditions\n• Engage in fraudulent activity"
    },
    {
      title: "10. Changes to Terms",
      content: "We reserve the right to modify these terms at any time. You will be notified of significant changes via email or app notification. Continued use of our service constitutes acceptance of the modified terms."
    },
    {
      title: "11. Contact Information",
      content: "Customer Service: support@bnplservice.com\nPhone: 1-800-BNPL-HELP\nAddress: 123 Finance Street, City, State 12345\n\nFor disputes or complaints, please contact our customer service team first. If unresolved, you may file a complaint with relevant financial authorities."
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color="#374151"
          />
        </TouchableOpacity>
        <MainText size="large" weight="bold" style={styles.headerTitle}>
          Terms and Conditions
        </MainText>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <SubText size="medium" style={styles.subtitle}>
            BNPL Service Terms and Conditions
          </SubText>

          {termsContent.map((section, index) => (
            <View key={index} style={styles.section}>
              <MainText size="medium"  style={styles.sectionTitle}>
                {section.title}
              </MainText>
              <SubText size="small" style={styles.sectionContent}>
                {section.content}
              </SubText>
            </View>
          ))}

          <SubText size="small" style={styles.lastUpdated}>
            Last updated: {new Date().toLocaleDateString()}
          </SubText>
        </View>
      </ScrollView>

      {/* Fixed Footer with Checkbox and Accept Button */}
      <View style={styles.footer}>
        <View style={styles.acceptanceContainer}>
          <CustomCheckbox
            checked={accepted}
            onToggle={() => setAccepted(!accepted)}
            size="medium"
          />
          <SubText size="medium" style={styles.acceptanceText}>
            I have read and agree to the Terms and Conditions
          </SubText>
        </View>

        <CustomButton
          title="Accept & Continue"
          onPress={handleAccept}
          disabled={!accepted}
          style={[
            styles.acceptButton,
            !accepted && styles.disabledButton
          ]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: Colors.light.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    color: Colors.light.text,
    paddingTop: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    color: Colors.light.mutedText,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  sectionContent: {
    color: Colors.light.mutedText,
    lineHeight: 20,
    textAlign: 'justify',
  },
  lastUpdated: {
    color: Colors.light.mutedText,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: Colors.light.background,
  },
  acceptanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  acceptanceText: {
    flex: 1,
    marginLeft: 12,
    color: Colors.light.text,
  },
  acceptButton: {
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TermsAndConditionsScreen;