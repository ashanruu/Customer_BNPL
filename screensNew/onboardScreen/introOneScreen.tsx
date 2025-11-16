import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, PanResponder } from 'react-native';
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
}

const IntroOneScreen: React.FC<IntroOneScreenProps> = ({ onNext}) => {
  const navigation = useNavigation<IntroOneScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Ease the card into view for a gentle onboarding transition.
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  const handleNext = useCallback(() => {
    if (hasNavigated.current) {
      return;
    }
    hasNavigated.current = true;
    if (onNext) {
      onNext();
    } else {
      navigation.replace('IntroTwoScreen');
    }
  }, [navigation, onNext]);

  useEffect(() => {
    const timer = setTimeout(handleNext, 3000);
    return () => clearTimeout(timer);
  }, [handleNext]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -60) {
          handleNext();
        }
      },
    })
  ).current;

  

  return (
    <View style={styles.container}>
      <Animated.View
        style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY }] }}
        {...panResponder.panHandlers}
      >
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
          nextButtonText="Next"
          showSkipButton={false}
          showNextButton={false}
          skipButtonText="Skip"
          titleColor="#1F2937"
          subtitleColor="#0066CC"
          descriptionColor="#6B7280"
          nextButtonColor="#0066CC"
          nextButtonTextColor="#FFFFFF"
          isFullScreen
        />
      </Animated.View>
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
