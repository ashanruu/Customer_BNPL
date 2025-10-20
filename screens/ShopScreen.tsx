import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { callMerchantApi } from '../scripts/api';
import OptimizedImage from '../components/OptimizedImage';
import ImageCacheManager from '../utils/ImageCacheManager';

// NavButton Component
interface NavButtonProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color={active ? 'black' : '#999'} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const ShopScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('ShopScreen');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredShops, setFeaturedShops] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [creditLimitsLoading, setCreditLimitsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      console.log("Fetching promotions...");
      
      const response = await callMerchantApi(
        'GetPromotions',
        {},
        'mobile-app-promotions',
        ''
      );

      console.log("=== FULL GetPromotions RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      if (response.statusCode === 200) {
        const promotionsData = response.data || [];
        setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
        
        // Preload promotion images for better performance
        await ImageCacheManager.preloadPromotionImages(promotionsData);
        
        // Use promotions data for featured shops and new arrivals
        if (promotionsData.length > 0) {
          // Convert promotions to shop-like items
          const shopItems = promotionsData.map((promo: any, index: number) => ({
            id: `promo_${promo.promotionId}`,
            name: promo.promotionName,
            imageUrl: promo.promotionImageLink,
            description: promo.description,
            discount: promo.discount,
            merchantId: promo.fK_MerchantId,
            minOrder: promo.minimumOrderCount,
            fromDate: promo.promotionFromDate,
            toDate: promo.promotionToDate
          }));

          // Randomly distribute between featured and new arrivals
          const shuffled = [...shopItems].sort(() => 0.5 - Math.random());
          const midPoint = Math.ceil(shuffled.length / 2);
          
          setFeaturedShops(shuffled.slice(0, midPoint));
          setNewArrivals(shuffled.slice(midPoint));
          
          console.log("Featured shops from promotions:", shuffled.slice(0, midPoint).length);
          console.log("New arrivals from promotions:", shuffled.slice(midPoint).length);
        }
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
      setFeaturedShops([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      
      const response = await callMerchantApi(
        'GetAllCategories',
        {},
        'mobile-app-categories',
        ''
      );

      console.log("=== FULL GetAllCategories RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      // Log response structure details
      console.log("Response keys:", Object.keys(response));
      console.log("Response statusCode:", response.statusCode);
      console.log("Response message:", response.message);
      
      if (response.data) {
        console.log("Response.data keys:", Object.keys(response.data));
        console.log("Response.data:", JSON.stringify(response.data, null, 2));
      }

      if (response.payload) {
        console.log("Response.payload keys:", Object.keys(response.payload));
        console.log("Response.payload:", JSON.stringify(response.payload, null, 2));
      }
      
      if (response.statusCode === 200) {
        const categoriesData = response.data || response.payload || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        console.log("Categories loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      setCategories([]);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       {/* Search */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Find your favourite Shop"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
            <Ionicons name="search-outline" size={20} color="#999" />
          </View>
        </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.length > 0 ? categories.map((category, index) => (
            <TouchableOpacity key={category.categoryId || index} style={styles.categoryButton}>
              <Text style={styles.categoryText}>
                {category.categoryName || category.name || `Category ${index + 1}`}
              </Text>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyCategoriesContainer}>
              <Text style={styles.emptyCategoriesText}>No categories available</Text>
            </View>
          )}
        </ScrollView>

        {/* Promo Banner - Show latest promotion with text overlay */}
        {promotions.length > 0 && promotions[0].promotionImageLink ? (
          <View style={styles.bannerContainer}>
            <OptimizedImage
              source={{ uri: promotions[0].promotionImageLink }}
              style={styles.bannerImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              priority="high"
              showLoadingIndicator={true}
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>{promotions[0].promotionName}</Text>
              <Text style={styles.bannerDiscount}>{promotions[0].discount}% OFF</Text>
              <Text style={styles.bannerDescription}>{promotions[0].description}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyBannerContainer}>
            <Text style={styles.emptyBannerText}>No promotions available</Text>
          </View>
        )}

        {/* Featured */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
          {featuredShops.length > 0 ? featuredShops.map((shop, index) => (
            <TouchableOpacity key={shop.id || index} style={styles.shopCard}>
              {shop.imageUrl ? (
                <OptimizedImage 
                  source={{ uri: shop.imageUrl }} 
                  style={styles.shopImage}
                  cachePolicy="memory-disk"
                  priority="normal"
                  showLoadingIndicator={true}
                  fallbackIcon="storefront-outline"
                  fallbackText="Shop Image"
                />
              ) : (
                <View style={styles.noImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
              <View style={styles.shopCardOverlay}>
                <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                {shop.discount && (
                  <Text style={styles.shopDiscount}>{shop.discount}% OFF</Text>
                )}
                {shop.description && (
                  <Text style={styles.shopDescription} numberOfLines={2}>
                    {shop.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No featured shops available</Text>
            </View>
          )}
        </ScrollView>

        {/* New Arrivals */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
          {newArrivals.length > 0 ? newArrivals.map((item, index) => (
            <TouchableOpacity key={item.id || index} style={styles.shopCard}>
              {item.imageUrl ? (
                <OptimizedImage 
                  source={{ uri: item.imageUrl }} 
                  style={styles.shopImage}
                  cachePolicy="memory-disk"
                  priority="normal"
                  showLoadingIndicator={true}
                  fallbackIcon="bag-outline"
                  fallbackText="Product Image"
                />
              ) : (
                <View style={styles.noImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                  <Text style={styles.noImageText}>No Image</Text>
                </View>
              )}
              <View style={styles.shopCardOverlay}>
                <Text style={styles.shopName} numberOfLines={1}>{item.name}</Text>
                {item.discount && (
                  <Text style={styles.shopDiscount}>{item.discount}% OFF</Text>
                )}
                {item.description && (
                  <Text style={styles.shopDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No new arrivals available</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
   </View>
  );
};

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: '#eee',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  categoryScroll: {
    marginVertical: 12,
    paddingLeft: 16,
  },
  categoryButton: {
    backgroundColor: '#090B1A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  bannerContainer: {
    width: '92%',
    height: 100,
    alignSelf: 'center',
    borderRadius: 12,
    marginVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  bannerDiscount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 2,
  },
  bannerDescription: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  emptyBannerContainer: {
    width: '92%',
    height: 100,
    alignSelf: 'center',
    borderRadius: 12,
    marginVertical: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyBannerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingTop: 20
  },
  horizontalCards: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  shopCard: {
    marginRight: 12,
    width: 120,
    position: 'relative',
  },
  shopCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 8,
  },
  shopImage: {
    width: 120,
    height: 140,
    borderRadius: 10,
  },
  shopName: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  shopDiscount: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  shopDescription: {
    textAlign: 'center',
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#090B1A',
    fontWeight: 'bold',
  },
  emptySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    minWidth: 200,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  noImagePlaceholder: {
    width: 120,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noImageText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyCategoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyCategoriesText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
