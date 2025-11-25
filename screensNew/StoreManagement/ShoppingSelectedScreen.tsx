import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import StoreDetailCard from '../../components/StoreDetailCard';
import OfferBanner from '../../components/OfferBanner';
import LocationsModal from '../../components/LocationsModal';

type StoreData = {
  id: string;
  name: string;
  type?: string | null;
  discount?: string | null;
  storepType?: string | null;
  image: any;
  websiteUrl?: string;
  socialMediaUrl?: string;
  locations?: string[];
};

type RouteParams = {
  ShoppingSelectedScreen: {
    // Backwards compatible: single store object
    store?: StoreData;
    // New merchant grouped params
    merchantId?: number | string;
    stores?: StoreData[];
  };
};

const ShoppingSelectedScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ShoppingSelectedScreen'>>();
  // Prefer `stores` (merchant group) when provided, otherwise fallback to single `store` param
  const merchantId = route.params?.merchantId;
  const storesParam = route.params?.stores;
  const storeData = (storesParam && storesParam.length > 0) ? storesParam[0] : route.params?.store;

  // Debug/log incoming params for verification
  console.log('ShoppingSelectedScreen params:', {
    merchantId,
    storesCount: storesParam ? storesParam.length : undefined,
    storeProvided: !!route.params?.store,
  });

  const [isFavorite, setIsFavorite] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  // Default locations if not provided
  // Normalize incoming store shape (API may use storeName/storeProfileImageUrl)
  const normalizedStore = storeData
    ? {
        ...storeData,
        name: (storeData as any).storeName ?? storeData.name,
        image: (storeData as any).storeProfileImageUrl ? { uri: (storeData as any).storeProfileImageUrl } : storeData.image,
      }
    : undefined;

  const locations = normalizedStore?.locations || [
    '50 Galle Rd, Colombo 00600',
    '40 D. S. Senanayake MW, Colombo 00800',
    'No. 152 High Level Rd, Nugegoda 10250',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <StoreDetailCard
          storeLogo={normalizedStore?.image || require('../../assets/images/temp/adidas.jpg')}
          storeName={normalizedStore?.name || 'Store'}
          backgroundImage={normalizedStore?.image || require('../../assets/images/temp/adidas.jpg')}
          discountText={normalizedStore?.discount || undefined}
          websiteUrl={normalizedStore?.websiteUrl || (normalizedStore?.storepType ? 'https://store.com' : undefined)}
          isFavorite={isFavorite}
          onFavoritePress={() => setIsFavorite(!isFavorite)}
          actions={[
            {
              id: '1',
              label: 'Shop online',
              type: 'shop',
              onPress: () => {
                if (storeData?.websiteUrl) {
                  (navigation.navigate as any)('StoreWebViewScreen', {
                    url: storeData.websiteUrl,
                    storeName: storeData.name,
                  });
                } else {
                  console.log('No website URL available');
                }
              },
            },
            {
              id: '2',
              label: 'Shop via social media',
              type: 'shop',
              onPress: () => {
                if (storeData?.socialMediaUrl) {
                  (navigation.navigate as any)('StoreWebViewScreen', {
                    url: storeData.socialMediaUrl,
                    storeName: storeData.name + ' - Social Media',
                  });
                } else {
                  console.log('No social media URL available');
                }
              },
            },
            {
              id: '3',
              label: 'Shop In-store',
              type: 'view',
              onPress: () => setShowLocations(!showLocations),
            },
          ]}
        />

        {/* If merchant stores were passed, show a small summary badge */}
        {storesParam && storesParam.length > 0 && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={{ fontSize: 12, color: '#374151' }}>{storesParam.length} store(s) available for this merchant</Text>
          </View>
        )}

        {/* Locations Section - Expanded when Shop In-store is clicked */}
        {showLocations && (
          <LocationsModal
            locations={locations}
            onClose={() => setShowLocations(false)}
          />
        )}
      </ScrollView>

      {/* Offer Banner - Fixed at Bottom - Hidden when locations are shown */}
      {!showLocations && (
        <>
          <OfferBanner
            title="Pay now offer"
            description="Stand a chance to obtain a 6% discount while paying via PayHere BNPL!"
            backgroundColor="#E0F2FE"
            image={require('../../assets/images/cute.png')}
          />

          {/* Bottom Text */}
          <Text style={styles.bottomText}>
            You'll be redirected to this store's official site to complete your purchase.
          </Text>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  bottomText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
});

export default ShoppingSelectedScreen;
