import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
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
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet" size={50} color="#020c1dff" />
          <Text style={styles.logo}>BNPL</Text>
        </View>
        <Text style={styles.tagline}>Buy Now Pay Later</Text>
      </Animated.View>
      
      <Animated.View style={[styles.versionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
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
    fontWeight: '400',
  },
});