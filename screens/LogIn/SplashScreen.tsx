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
  OrderPageScreen: { 
    saleCode?: string; 
    merchantId?: string; 
    url?: string; 
  };
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
        const [pinEnabled, biometricEnabled, hasUserToken, pendingDeepLink] = await Promise.all([
          AsyncStorage.getItem('pinEnabled'),
          AsyncStorage.getItem('biometricEnabled'),
          AsyncStorage.getItem('bearerToken'),
          AsyncStorage.getItem('pendingDeepLink'),
        ]);

        const hasSecuritySetup = pinEnabled === 'true' || biometricEnabled === 'true';
        const isAuthenticated = !!hasUserToken;
        
        console.log('=== SPLASH SCREEN DEBUG ===');
        console.log('Authentication status:', { isAuthenticated, hasSecuritySetup });
        console.log('Pending deep link found:', pendingDeepLink);
        console.log('Is authenticated:', isAuthenticated);
        console.log('Has pending deep link:', !!pendingDeepLink);
        
        // Check if there's a valid pending deep link
        if (pendingDeepLink) {
          console.log('Found pending deep link:', pendingDeepLink);
          
          // Validate that the pending deep link is actually a valid URL before processing
          if (isAuthenticated && isValidDeepLink(pendingDeepLink)) {
            console.log('Processing valid pending deep link for authenticated user:', pendingDeepLink);
            
            // Clear the pending deep link
            await AsyncStorage.removeItem('pendingDeepLink');
            
            // Parse the deep link and navigate to OrderPageScreen
            handlePendingDeepLink(pendingDeepLink);
            return;
          } else if (isValidDeepLink(pendingDeepLink)) {
            // Valid deep link but user not authenticated - keep it for after login
            console.log('Valid deep link found but user not authenticated, keeping for after login');
            navigation.replace('Login');
            return;
          } else {
            // Clear invalid deep link
            console.log('Clearing invalid pending deep link:', pendingDeepLink);
            await AsyncStorage.removeItem('pendingDeepLink');
          }
        }
        
        // Normal app open - always require login
        console.log('Normal app open - redirecting to login');
        navigation.replace('Login');

      } catch (error) {
        console.error('Error checking authentication status:', error);
        navigation.replace('Login');
      }
    }, 2000);
    
    const isValidDeepLink = (url: string): boolean => {
      if (!url || typeof url !== 'string') return false;
      
      try {
        // Check for custom scheme
        if (url.startsWith('bnplcustomer://')) {
          return true;
        }
        
        // Check for valid HTTPS URLs
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname;
        
        // Valid domains and patterns
        if (hostname === 'merchant.bnpl.hexdive.com') {
          return pathname.startsWith('/sale/') || pathname.startsWith('/merchant/') || urlObj.searchParams.has('salecode') || urlObj.searchParams.has('saleCode') || urlObj.searchParams.has('merchantId') || urlObj.searchParams.has('merchantid');
        }
        
        if (hostname === 'bnplqr.hexdive.com') {
          return pathname.startsWith('/sale/');
        }
        
        return false;
      } catch (error) {
        console.log('Invalid URL format:', url);
        return false;
      }
    };
    
    const handlePendingDeepLink = (url: string) => {
      try {
        console.log('Handling pending deep link:', url);
        
        // Handle custom scheme: bnplcustomer://order?saleCode=123&merchantId=32
        if (url.startsWith('bnplcustomer://')) {
          const urlObj = new URL(url);
          const searchParams = urlObj.searchParams;
          
          const saleCode = searchParams.get('saleCode') || searchParams.get('salecode');
          const merchantId = searchParams.get('merchantId') || searchParams.get('merchantid');
          
          navigation.replace('OrderPageScreen', {
            saleCode: saleCode || undefined,
            merchantId: merchantId || undefined,
            url: url
          });
          return;
        }

        // Handle HTTPS URLs
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // Handle verified domain: https://merchant.bnpl.hexdive.com/...
        if (hostname === 'merchant.bnpl.hexdive.com') {
          // Handle merchant URLs with sale codes
          if (pathname.startsWith('/sale/')) {
            const saleCode = pathname.split('/sale/')[1];
            if (saleCode) {
              navigation.replace('OrderPageScreen', {
                saleCode: saleCode,
                url: url
              });
              return;
            }
          }
          
          // Handle merchant URLs with merchant ID
          if (pathname.startsWith('/merchant/')) {
            const merchantId = pathname.split('/merchant/')[1];
            if (merchantId) {
              navigation.replace('OrderPageScreen', {
                merchantId: merchantId,
                url: url
              });
              return;
            }
          }
          
          // Handle query parameters
          const saleCode = searchParams.get('salecode') || searchParams.get('saleCode');
          const merchantId = searchParams.get('merchantId') || searchParams.get('merchantid');
          
          if (saleCode || merchantId) {
            navigation.replace('OrderPageScreen', {
              saleCode: saleCode || undefined,
              merchantId: merchantId || undefined,
              url: url
            });
            return;
          }
        }

        // Handle other QR patterns like https://bnplqr.hexdive.com/sale/{orderId}
        if (hostname === 'bnplqr.hexdive.com' && pathname.startsWith('/sale/')) {
          const saleCode = pathname.split('/sale/')[1];
          if (saleCode) {
            navigation.replace('OrderPageScreen', {
              saleCode: saleCode,
              url: url
            });
            return;
          }
        }

        // Fallback: navigate with raw URL
        navigation.replace('OrderPageScreen', { url: url });

      } catch (error) {
        console.error('Error handling pending deep link:', error);
        // Fallback to main screen
        navigation.replace('Main');
      }
    };

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