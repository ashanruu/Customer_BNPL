import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Text fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Navigate after 2 seconds
    const timeout = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={['#20222E', '#090B1A']}
      style={styles.container}
    >
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logo}>🚀 BNPL</Text>
      </Animated.View>
      <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
        Welcome to My App
      </Animated.Text>
      <View style={styles.dotsContainer}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={300} />
        <AnimatedDot delay={600} />
      </View>
    </LinearGradient>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#fff',
  },
  text: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
});
