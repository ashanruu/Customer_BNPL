import React from 'react';
import { View, StyleSheet } from 'react-native';
import OnboardingCard from '../../components/OnboardingCard';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  IntroOneScreen: undefined;
  IntroTwoScreen: undefined;
};

type IntroOneScreenNavigationProp = StackNavigationProp<RootStackParamList, 'IntroOneScreen'>;

interface IntroOneScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
}

const IntroOneScreen: React.FC<IntroOneScreenProps> = ({ onNext, onSkip }) => {
  const navigation = useNavigation<IntroOneScreenNavigationProp>();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      navigation.replace('IntroTwoScreen');
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
        image={require('../../assets/images/girl.png')}
        backgroundColor="#FFFFFF"
        topBackgroundColor="#cfcfcfc1"
        title="Shop Smarter Today, Pay"
        subtitle="Later with Ease"
        description="Enjoy the freedom to get what you love today and spread the cost over easy, flexible installments."
        currentStep={0}
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

export default IntroOneScreen;
