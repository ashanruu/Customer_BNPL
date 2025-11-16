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
    store: StoreData;
  };
};

const ShoppingSelectedScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ShoppingSelectedScreen'>>();
  const storeData = route.params?.store;

  const [isFavorite, setIsFavorite] = useState(false);
  const [showLocations, setShowLocations] = useState(false);

  // Default locations if not provided
  const locations = storeData?.locations || [
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
          storeLogo={storeData?.image || require('../../assets/images/temp/adidas.jpg')}
          storeName={storeData?.name || 'Store'}
          backgroundImage={storeData?.image || require('../../assets/images/temp/adidas.jpg')}
          discountText={storeData?.discount || undefined}
          websiteUrl={storeData?.websiteUrl || (storeData?.storepType ? 'https://store.com' : undefined)}
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
