import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import ScreenTemplate from '../../components/ScreenTemplate';
import TermsAndConditionsContent, { TermsSection } from '../../components/TermsAndConditionsContent';

const TermsAndConditionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [isAccepted, setIsAccepted] = useState(false);
  const [termsData, setTermsData] = useState<TermsSection[]>([]);

  useEffect(() => {
    // Load terms data
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
  }, []);

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      topTitle="Read & Agree to our"
      mainTitle="Terms & Conditions"
      showButton={false}
      scrollable={false}
      backgroundColor="#FFFFFF"
    >
      <TermsAndConditionsContent
        sections={termsData}
        showCheckbox={false}
        checkboxLabel="I have read and agree to the Terms & Conditions"
        onCheckboxChange={(checked) => setIsAccepted(checked)}
        initialChecked={false}
      />
    </ScreenTemplate>
  );
};

export default TermsAndConditionsScreen;
