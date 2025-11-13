import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import OnboardingCard from '../../components/OnboardingCard';


type RootStackParamList = {
  IntroThreeScreen : undefined;
  regWithMobileNo : undefined;
};

type IntroThreeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IntroThreeScreen'>;

interface IntroThreeScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
}

const IntroThreeScreen: React.FC<IntroThreeScreenProps> = ({ onNext, onSkip }) => {
  const navigation = useNavigation<IntroThreeScreenNavigationProp>();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      navigation.replace('regWithMobileNo');
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
        image={require('../../assets/images/men.png')}
        backgroundColor="#FFFFFF"
        topBackgroundColor="#cfcfcfc1"
        title="Track Every Purchase &"
        subtitle="Stay in Control"
        description="Track spending limits, monitor upcoming payments, and manage your credit all in one clear dashboard."
        currentStep={2}
        totalSteps={3}
        activeIndicatorColor="#1F2937"
        inactiveIndicatorColor="#E5E7EB"
        onNext={handleNext}
        onSkip={handleSkip}
        nextButtonText="Get Started"
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

export default IntroThreeScreen;
