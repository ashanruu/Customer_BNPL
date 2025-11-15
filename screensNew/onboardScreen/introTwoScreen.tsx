import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import OnboardingCard from '../../components/OnboardingCard';

type RootStackParamList = {
  IntroOneScreen: undefined;
  IntroThreeScreen: undefined;
};

type IntroTwoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IntroOneScreen'>;

interface IntroTwoScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
}

const IntroTwoScreen: React.FC<IntroTwoScreenProps> = ({ onNext, onSkip }) => {
  const navigation = useNavigation<IntroTwoScreenNavigationProp>();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      navigation.replace('IntroThreeScreen');
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
    // Add skip navigation logic here if needed
  };
  return (
    <View style={styles.container}>
      <OnboardingCard
        image={require('../../assets/images/family.png')}
        backgroundColor="#FFFFFF"
        topBackgroundColor="#cfcfcfc1"
        title="Fast, Secure, & Seamless"
        subtitle="Payments Anytime"
        description="Pay in seconds with QR or phone & securely protected by PIN or biometrics."
        currentStep={1}
        totalSteps={3}
        activeIndicatorColor="#1F2937"
        inactiveIndicatorColor="#E5E7EB"
        onNext={handleNext}
        onSkip={handleSkip}
        nextButtonText="Next"
        showSkipButton={true}
        skipButtonText="Skip"
        titleColor="#1F2937"
        subtitleColor="#0066CC"
        descriptionColor="#6B7280"
        nextButtonColor="#0066CC"
        nextButtonTextColor="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default IntroTwoScreen;
