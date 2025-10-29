import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  OrderPageScreen: { saleCode?: string; merchantId?: string; url?: string };
  HomeScreen: undefined;
  Login: undefined;
  Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DeepLinkHandler: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isProcessingInitialLink, setIsProcessingInitialLink] = useState(false);

  useEffect(() => {
    // Handle the initial URL when the app is opened from a cold start
    const handleInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        setIsProcessingInitialLink(true);
        console.log('=== DEEP LINK HANDLER ===');
        console.log('Initial deep link detected:', initialURL);
        
        // Store the deep link immediately for SplashScreen to handle
        await AsyncStorage.setItem('pendingDeepLink', initialURL);
        console.log('Stored initial deep link for splash screen processing');
      } else {
        console.log('=== DEEP LINK HANDLER ===');
        console.log('No initial deep link detected - normal app open');
      }
    };

    // Handle URLs when the app is already running
    const handleURL = (event: { url: string }) => {
      console.log('Deep link received while app running:', event.url);
      handleDeepLink(event.url);
    };

    handleInitialURL();

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleURL);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    console.log('Processing deep link:', url);
    
    try {
      // Check if user is authenticated
      const bearerToken = await AsyncStorage.getItem('bearerToken');
      const isAuthenticated = !!bearerToken;
      
      console.log('User authenticated:', isAuthenticated);
      
      if (!isAuthenticated) {
        // Store the deep link for later use after authentication
        await AsyncStorage.setItem('pendingDeepLink', url);
        console.log('Stored pending deep link for unauthenticated user:', url);
        
        // Try to navigate to Login screen, but don't fail if navigation state is not ready
        try {
          console.log('Attempting to navigate to Login screen');
          navigation.navigate('Login');
        } catch (navError) {
          console.log('Navigation not ready yet, deep link will be handled by SplashScreen');
        }
        return;
      }

      // User is authenticated, process the deep link immediately
      navigateToOrderPage(url);
      
    } catch (error) {
      console.error('Error processing deep link:', error);
      // Fallback: navigate with raw URL if authenticated
      try {
        const bearerToken = await AsyncStorage.getItem('bearerToken');
        if (bearerToken) {
          navigation.navigate('OrderPageScreen', { url: url });
        }
      } catch (navError) {
        console.log('Navigation fallback failed, storing deep link for later processing');
        await AsyncStorage.setItem('pendingDeepLink', url);
      }
    }
  };

  const navigateToOrderPage = async (url: string) => {
    try {
      console.log('Navigating to OrderPageScreen with URL:', url);

      // Handle custom scheme: bnplcustomer://order?saleCode=123&merchantId=32
      if (url.startsWith('bnplcustomer://')) {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        
        const saleCode = searchParams.get('saleCode') || searchParams.get('salecode');
        const merchantId = searchParams.get('merchantId') || searchParams.get('merchantid');
        
        try {
          navigation.navigate('OrderPageScreen', {
            saleCode: saleCode || undefined,
            merchantId: merchantId || undefined,
            url: url
          });
        } catch (navError) {
          console.log('Navigation failed, storing deep link for later');
          await AsyncStorage.setItem('pendingDeepLink', url);
        }
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
            try {
              navigation.navigate('OrderPageScreen', {
                saleCode: saleCode,
                url: url
              });
            } catch (navError) {
              console.log('Navigation failed, storing deep link for later');
              await AsyncStorage.setItem('pendingDeepLink', url);
            }
            return;
          }
        }
        
        // Handle merchant URLs with merchant ID
        if (pathname.startsWith('/merchant/')) {
          const merchantId = pathname.split('/merchant/')[1];
          if (merchantId) {
            try {
              navigation.navigate('OrderPageScreen', {
                merchantId: merchantId,
                url: url
              });
            } catch (navError) {
              console.log('Navigation failed, storing deep link for later');
              await AsyncStorage.setItem('pendingDeepLink', url);
            }
            return;
          }
        }
        
        // Handle query parameters
        const saleCode = searchParams.get('salecode') || searchParams.get('saleCode');
        const merchantId = searchParams.get('merchantId') || searchParams.get('merchantid');
        
        if (saleCode || merchantId) {
          try {
            navigation.navigate('OrderPageScreen', {
              saleCode: saleCode || undefined,
              merchantId: merchantId || undefined,
              url: url
            });
          } catch (navError) {
            console.log('Navigation failed, storing deep link for later');
            await AsyncStorage.setItem('pendingDeepLink', url);
          }
          return;
        }
      }

      // Handle other QR patterns like https://bnplqr.hexdive.com/sale/{orderId}
      if (hostname === 'bnplqr.hexdive.com' && pathname.startsWith('/sale/')) {
        const saleCode = pathname.split('/sale/')[1];
        if (saleCode) {
          try {
            navigation.navigate('OrderPageScreen', {
              saleCode: saleCode,
              url: url
            });
          } catch (navError) {
            console.log('Navigation failed, storing deep link for later');
            await AsyncStorage.setItem('pendingDeepLink', url);
          }
          return;
        }
      }

      // If we couldn't parse the URL properly, still try to navigate with the raw URL
      try {
        navigation.navigate('OrderPageScreen', { url: url });
      } catch (navError) {
        console.log('Navigation failed, storing deep link for later');
        await AsyncStorage.setItem('pendingDeepLink', url);
      }

    } catch (error) {
      console.error('Error parsing deep link URL:', error);
      // Fallback: navigate with raw URL
      try {
        navigation.navigate('OrderPageScreen', { url: url });
      } catch (navError) {
        console.log('Navigation fallback failed, storing deep link for later');
        await AsyncStorage.setItem('pendingDeepLink', url);
      }
    }
  };

  return null; // This component doesn't render anything
};

export default DeepLinkHandler;