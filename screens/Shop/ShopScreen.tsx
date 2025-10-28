import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { callMerchantApi } from '../../scripts/api';
import OptimizedImage from '../../components/OptimizedImage';
import ImageCacheManager from '../../utils/ImageCacheManager';

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
  
  // Add search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<any[]>([]);
  const [filteredFeaturedShops, setFilteredFeaturedShops] = useState<any[]>([]);
  const [filteredNewArrivals, setFilteredNewArrivals] = useState<any[]>([]);

  // Add banner rotation state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [bannerRotationInterval, setBannerRotationInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
  }, []);

  // Add filter effect when search query or data changes
  useEffect(() => {
    filterData();
  }, [searchQuery, promotions, categories, featuredShops, newArrivals]);

  // Banner rotation effect
  useEffect(() => {
    if (filteredPromotions.length > 1) {
      // Clear existing interval
      if (bannerRotationInterval) {
        clearInterval(bannerRotationInterval);
      }

      // Set up new rotation interval (change every 5 seconds)
      const interval = setInterval(() => {
        setCurrentBannerIndex(prevIndex => {
          const validPromotions = filteredPromotions.filter(promo => 
            promo.promotionImageLink && promo.promotionImageLink.trim() !== ''
          );
          return validPromotions.length > 0 ? (prevIndex + 1) % validPromotions.length : 0;
        });
      }, 5000); // Change banner every 5 seconds

      setBannerRotationInterval(interval);

      // Cleanup interval on unmount or when promotions change
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [filteredPromotions]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (bannerRotationInterval) {
        clearInterval(bannerRotationInterval);
      }
    };
  }, []);

  const filterData = () => {
    const query = searchQuery.toLowerCase().trim();
    
    if (query === '') {
      // If no search query, show all data
      setFilteredCategories(categories);
      setFilteredPromotions(promotions);
      setFilteredFeaturedShops(featuredShops);
      setFilteredNewArrivals(newArrivals);
    } else {
      // Filter categories
      const filteredCats = categories.filter(category => {
        const categoryName = (category.categoryName || category.name || '').toLowerCase();
        return categoryName.includes(query);
      });
      setFilteredCategories(filteredCats);

      // Filter promotions
      const filteredPromos = promotions.filter(promo => {
        const promotionName = (promo.promotionName || '').toLowerCase();
        const description = (promo.description || '').toLowerCase();
        const merchantName = (promo.merchantName || '').toLowerCase();
        return promotionName.includes(query) || 
               description.includes(query) || 
               merchantName.includes(query);
      });
      setFilteredPromotions(filteredPromos);

      // Filter featured shops (now all promotions)
      const filteredFeatured = featuredShops.filter(shop => {
        const shopName = (shop.name || '').toLowerCase();
        const description = (shop.description || '').toLowerCase();
        const merchantName = (shop.merchantName || '').toLowerCase(); // Add merchant name filtering
        return shopName.includes(query) || 
               description.includes(query) || 
               merchantName.includes(query);
      });
      setFilteredFeaturedShops(filteredFeatured);

      // Filter new arrivals
      const filteredArrivals = newArrivals.filter(item => {
        const itemName = (item.name || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const merchantName = (item.merchantName || '').toLowerCase();
        return itemName.includes(query) || 
               description.includes(query) || 
               merchantName.includes(query);
      });
      setFilteredNewArrivals(filteredArrivals);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

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
          // Convert ALL promotions to shop-like items for featured section
          const allPromotionItems = promotionsData.map((promo: any, index: number) => ({
            id: `promo_${promo.promotionId}`,
            name: promo.promotionName,
            imageUrl: promo.promotionImageLink,
            description: promo.description,
            discount: promo.discount,
            merchantId: promo.fK_MerchantId,
            merchantName: promo.merchantName,
            minOrder: promo.minimumOrderCount,
            fromDate: promo.promotionFromDate,
            toDate: promo.promotionToDate,
            type: 'promotion' // Add type to identify as promotion
          }));

          // Set ALL promotions to featured shops
          setFeaturedShops(allPromotionItems);
          
          // You can set new arrivals to a subset or different data
          // For now, setting it to the last half of promotions
          const midPoint = Math.ceil(allPromotionItems.length / 2);
          setNewArrivals(allPromotionItems.slice(midPoint));
          
          console.log("All promotions set to featured shops:", allPromotionItems.length);
          console.log("New arrivals from promotions:", allPromotionItems.slice(midPoint).length);
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

  const handleShopPress = (shop: any) => {
    navigation.navigate('ShopDetailsScreen', { shop });
  };

  // Enhanced banner selection function
  const getCurrentBannerPromotion = () => {
    const validPromotions = filteredPromotions.filter(promo => 
      promo.promotionImageLink && promo.promotionImageLink.trim() !== ''
    );
    
    if (validPromotions.length === 0) return null;
    
    return validPromotions[currentBannerIndex % validPromotions.length];
  };

  // Manual banner navigation functions
  const goToPreviousBanner = () => {
    const validPromotions = filteredPromotions.filter(promo => 
      promo.promotionImageLink && promo.promotionImageLink.trim() !== ''
    );
    
    if (validPromotions.length > 1) {
      setCurrentBannerIndex(prevIndex => 
        prevIndex === 0 ? validPromotions.length - 1 : prevIndex - 1
      );
    }
  };

  const goToNextBanner = () => {
    const validPromotions = filteredPromotions.filter(promo => 
      promo.promotionImageLink && promo.promotionImageLink.trim() !== ''
    );
    
    if (validPromotions.length > 1) {
      setCurrentBannerIndex(prevIndex => (prevIndex + 1) % validPromotions.length);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
       {/* Enhanced Search */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Find your favourite Shop"
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="search-outline" size={20} color="#999" />
            )}
          </View>
        </View>

        {/* Show search results count when filtering */}
        {searchQuery && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsText}>
              Found: {filteredCategories.length} categories, {filteredFeaturedShops.length} featured shops, {filteredNewArrivals.length} new arrivals
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {filteredCategories.length > 0 ? filteredCategories.map((category, index) => (
            <TouchableOpacity key={category.categoryId || index} style={styles.categoryButton}>
              <Text style={styles.categoryText}>
                {category.categoryName || category.name || `Category ${index + 1}`}
              </Text>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyCategoriesContainer}>
              <Text style={styles.emptyCategoriesText}>
                {searchQuery ? 'No categories match your search' : 'No categories available'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Enhanced Rotating Promo Banner */}
        {filteredPromotions.length > 0 ? (
          (() => {
            const currentPromotion = getCurrentBannerPromotion();
            const validPromotions = filteredPromotions.filter(promo => 
              promo.promotionImageLink && promo.promotionImageLink.trim() !== ''
            );
            
            return currentPromotion ? (
              <View style={styles.bannerWrapper}>
                <TouchableOpacity 
                  style={styles.bannerContainer}
                  onPress={() => {
                    console.log('Promotion pressed:', currentPromotion);
                    // Navigate to promotion details
                  }}
                >
                  <OptimizedImage
                    source={{ uri: currentPromotion.promotionImageLink }}
                    style={styles.bannerImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="high"
                    showLoadingIndicator={true}
                  />
                  <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerTitle} numberOfLines={2}>
                      {currentPromotion.promotionName}
                    </Text>
                    {currentPromotion.discount && currentPromotion.discount > 0 && (
                      <Text style={styles.bannerDiscount}>
                        {currentPromotion.discount}% OFF
                      </Text>
                    )}
                    {currentPromotion.description && (
                      <Text style={styles.bannerDescription} numberOfLines={2}>
                        {currentPromotion.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Navigation arrows for multiple promotions */}
                {validPromotions.length > 1 && (
                  <>
                    <TouchableOpacity 
                      style={styles.bannerArrowLeft}
                      onPress={goToPreviousBanner}
                    >
                      <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.bannerArrowRight}
                      onPress={goToNextBanner}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}

                {/* Dots indicator for multiple promotions */}
                {validPromotions.length > 1 && (
                  <View style={styles.bannerDotsContainer}>
                    {validPromotions.map((_, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={[
                          styles.bannerDot,
                          index === currentBannerIndex && styles.bannerDotActive
                        ]}
                        onPress={() => setCurrentBannerIndex(index)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyBannerContainer}>
                <Ionicons name="image-outline" size={40} color="#ccc" />
                <Text style={styles.emptyBannerText}>
                  {searchQuery ? 'No promotions with images match your search' : 'No promotion images available'}
                </Text>
              </View>
            );
          })()
        ) : (
          <View style={styles.emptyBannerContainer}>
            <Ionicons name="megaphone-outline" size={40} color="#ccc" />
            <Text style={styles.emptyBannerText}>
              {searchQuery ? 'No promotions match your search' : 'No promotions available'}
            </Text>
          </View>
        )}

        {/* Featured */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            Featured {searchQuery && `(${filteredFeaturedShops.length})`}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
          {filteredFeaturedShops.length > 0 ? filteredFeaturedShops.map
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  clearButton: {
    padding: 4,
  },
  searchResultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchResultsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
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
  merchantName: {
    textAlign: 'center',
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '500',
    marginBottom: 2,
  },
  shopDescription: {
    textAlign: 'center',
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
  },
  minOrder: {
    textAlign: 'center',
    fontSize: 9,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
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
