import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  OrderPageScreen: { saleCode?: string; merchantId?: string; url?: string };
  HomeScreen: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const DeepLinkHandler: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    // Handle the initial URL when the app is opened from a cold start
    const handleInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        handleDeepLink(initialURL);
      }
    };

    // Handle URLs when the app is already running
    const handleURL = (event: { url: string }) => {
      handleDeepLink(event.url);
    };

    handleInitialURL();

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleURL);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    console.log('Deep link received:', url);
    
    try {
      // Handle custom scheme: bnplcustomer://order?saleCode=123&merchantId=32
      if (url.startsWith('bnplcustomer://')) {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        
        const saleCode = searchParams.get('saleCode') || searchParams.get('salecode');
        const merchantId = searchParams.get('merchantId') || searchParams.get('merchantid');
        
        navigation.navigate('OrderPageScreen', {
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

      // Handle static QR: https://shop.bnplqr.hexdive.com/merchant/32
      if (hostname === 'shop.bnplqr.hexdive.com' && pathname.startsWith('/merchant/')) {
        const merchantId = pathname.split('/merchant/')[1];
        if (merchantId) {
          navigation.navigate('OrderPageScreen', {
            merchantId: merchantId,
            url: url
          });
          return;
        }
      }

      // Handle dynamic QR: https://bnplqr.hexdive.com?salecode=32
      if (hostname === 'bnplqr.hexdive.com') {
        const saleCode = searchParams.get('salecode');
        if (saleCode) {
          navigation.navigate('OrderPageScreen', {
            saleCode: saleCode,
            url: url
          });
          return;
        }
      }

      // If we couldn't parse the URL properly, still try to navigate with the raw URL
      navigation.navigate('OrderPageScreen', { url: url });

    } catch (error) {
      console.error('Error parsing deep link URL:', error);
      // Fallback: navigate with raw URL
      navigation.navigate('OrderPageScreen', { url: url });
    }
  };

  return null; // This component doesn't render anything
};

export default DeepLinkHandler;