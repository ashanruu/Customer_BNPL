import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  BiometricPinLogin: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Check authentication status and navigate after 2 seconds
    const timeout = setTimeout(async () => {
      try {
        const [pinEnabled, biometricEnabled, hasUserToken] = await Promise.all([
          AsyncStorage.getItem('pinEnabled'),
          AsyncStorage.getItem('biometricEnabled'),
          AsyncStorage.getItem('bearerToken'),
        ]);

        const hasSecuritySetup = pinEnabled === 'true' || biometricEnabled === 'true';
        navigation.replace('Login');

      } catch (error) {
        console.error('Error checking authentication status:', error);
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#20222E', '#090B1A']}
        style={styles.container}
      >
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logo}>BNPL</Text>
      </Animated.View>
      <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
        Shop Today, Pay Your Way.
      </Animated.Text>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={300} />
        <AnimatedDot delay={600} />
      </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const AnimatedDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        { transform: [{ scale }] },
      ]}
    />
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#020c1dff', // dark blue text
    marginLeft: 12,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280', // gray text
    fontWeight: '300',
    marginTop: 8,
    letterSpacing: 1,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#6B7280', // gray text
    fontWeight: '400',
  },
});
