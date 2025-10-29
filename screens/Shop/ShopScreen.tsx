import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { callMerchantApi, callMobileApi } from '../../scripts/api';
import OptimizedImage from '../../components/OptimizedImage';
import ImageCacheManager from '../../utils/ImageCacheManager';

// Type definitions
interface Store {
  storeName?: string;
  storeType?: string;
  storeProfileImageUrl?: string;
  fk_CategoryId?: number;
  fK_PtagId?: number;
}

interface Merchant {
  merchantId: number;
  name?: string;
  stores?: Store[];
  storeTypes?: string[];
}

interface Promotion {
  promotionId: number;
  promotionName?: string;
  description?: string;
  promotionImageLink?: string;
  discount?: number;
}

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
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('ShopScreen');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [featuredShops, setFeaturedShops] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]); // Original shop data
  
  // Filtered data states for search only
  const [filteredMerchants, setFilteredMerchants] = useState<any[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<any[]>([]);
  
  const [creditLimitsLoading, setCreditLimitsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(false);
  
  // Search state only (removed category/tag filter states)
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Banner transition states
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenWidth = Dimensions.get('window').width;

  // Auto slideshow effect for banner
  useEffect(() => {
    if (promotions.length > 1) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % promotions.length);
      }, 3000);

      return () => {
        if (slideInterval.current) {
          clearInterval(slideInterval.current);
        }
      };
    }
  }, [promotions.length]);

  useEffect(() => {
    fetchPromotions();
    fetchCategories();
    fetchTags();
    fetchShops();
  }, []);

  // Apply search filter only
  useEffect(() => {
    applySearchFilter();
  }, [searchQuery, newArrivals, promotions]);

  // Search filter function (no category/tag filtering on home screen)
  const applySearchFilter = () => {
    try {
      let baseShops = newArrivals;
      let basePromotions = promotions;

      // Apply search filter only
      if (searchQuery.trim()) {
        // Filter merchants
        const searchFiltered = baseShops.filter((merchant: any) => {
          const merchantName = merchant.name?.toLowerCase() || '';
          const query = searchQuery.toLowerCase().trim();
          
          // Search in merchant name and store names
          const matchesName = merchantName.includes(query);
          
          // Also search in store names if available
          const matchesStores = merchant.stores?.some((store: Store) => 
            store.storeName?.toLowerCase().includes(query)
          ) || false;
          
          // Search in store types
          const matchesStoreTypes = merchant.storeTypes?.some((storeType: string) => {
            const type = storeType?.toLowerCase() || '';
            return type.includes(query);
          }) || false;
          
          return matchesName || matchesStores || matchesStoreTypes;
        });
        
        // Filter promotions
        const promotionFiltered = basePromotions.filter((promotion: Promotion) => {
          const promotionName = promotion.promotionName?.toLowerCase() || '';
          const promotionDescription = promotion.description?.toLowerCase() || '';
          const query = searchQuery.toLowerCase().trim();
          
          return promotionName.includes(query) || promotionDescription.includes(query);
        });
        
        setFilteredMerchants(searchFiltered);
        setFilteredPromotions(promotionFiltered);
      } else {
        // No search query, show all data
        setFilteredMerchants(baseShops);
        setFilteredPromotions(basePromotions);
      }
    } catch (error) {
      console.error("Error applying search filter:", error);
      setFilteredMerchants([]);
      setFilteredPromotions([]);
    }
  };

  // UPDATED: Check if category/tag has results and navigate accordingly
  const checkAndNavigateToFilter = async (filterType: 'category' | 'tag', filterId: number, filterName: string) => {
    try {
      console.log(`Checking ${filterType}:`, filterId, filterName);
      
      // Prepare payload based on filter type
      let payload = {};
      if (filterType === 'category') {
        payload = { categoryId: filterId };
      } else {
        payload = { tagId: filterId };
      }

      const response = await callMobileApi(
        'GetStoreFilter',
        payload,
        'mobile-app-shop-filter',
        '',
        'customer'
      );

      console.log("=== FILTER CHECK RESPONSE ===");
      console.log("Payload:", payload);
      console.log("Response:", JSON.stringify(response, null, 2));

      if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
        const storesData = response.data;
        
        // FIXED: Check if we have any valid stores (the response contains stores directly, not merchants)
        const validStores = storesData.filter((store: any) => 
          store.storeId && 
          store.fK_MerchantId && 
          store.storeName && 
          store.isActive !== false
        );

        console.log(`Found ${validStores.length} valid stores for ${filterType}: ${filterName}`);

        if (validStores.length > 0) {
          console.log(`Navigating to CategoryShopsScreen with ${validStores.length} stores...`);
          // Navigate to filter results screen
          navigation.navigate('CategoryShopsScreen', {
            filterId: filterId,
            filterName: filterName,
            filterType: filterType,
            payload: payload
          });
        } else {
          console.log(`No valid stores found for ${filterType}: ${filterName}. Staying on home screen.`);
          // Optional: Show a toast or alert message
          // You can add a toast notification here if needed
        }
      } else {
        console.log(`No data found for ${filterType}: ${filterName}. Staying on home screen.`);
        // Optional: Show a message to user
      }
    } catch (error) {
      console.error(`Error checking ${filterType} filter:`, error);
      // Stay on home screen on error
    }
  };

  // NEW: Handle category press
  const handleCategoryPress = (categoryId: number, categoryName: string) => {
    console.log("Category pressed:", categoryId, categoryName);
    checkAndNavigateToFilter('category', categoryId, categoryName);
  };

  // NEW: Handle tag press
  const handleTagPress = (tagId: number, tagName: string) => {
    console.log("Tag pressed:", tagId, tagName);
    checkAndNavigateToFilter('tag', tagId, tagName);
  };

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Function to fetch shops and group by merchant
  const fetchShops = async () => {
    try {
      setShopsLoading(true);
      console.log("Fetching shops...");
      
      const response = await callMobileApi(
        'GetStoreInTagAndCat',
        {},
        'mobile-app-shops',
        '',
        'customer'
      );

      console.log("=== FULL GetStoreInTagAndCat RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));

      if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
        const merchantsData = response.data;
        const groupedMerchants: any[] = [];

        // Process each merchant and group their stores
        merchantsData.forEach((merchant: Merchant) => {
          console.log("Processing merchant:", merchant.merchantId);
          
          if (merchant.stores && Array.isArray(merchant.stores) && merchant.stores.length > 0) {
            // Initialize arrays and variables
            const storeTypes: string[] = [];
            let prioritizedImage: string | null = null;
            let merchantName: string = '';
            
            // Sort stores by priority: Physical > Online > FB
            const sortedStores = merchant.stores.sort((a: Store, b: Store) => {
              const priority: { [key: string]: number } = { 'Physical': 1, 'Online': 2, 'FB': 3 };
              return (priority[a.storeType || ''] || 999) - (priority[b.storeType || ''] || 999);
            });

            console.log("Sorted stores for merchant", merchant.merchantId, ":", sortedStores);

            // Get prioritized image and collect store types
            sortedStores.forEach((store: Store) => {
              // Add store type to array if not already present and if it exists
              if (store.storeType && !storeTypes.includes(store.storeType)) {
                storeTypes.push(store.storeType);
              }
              
              // Set merchant name (use first store's name or create a combined name)
              if (!merchantName && store.storeName) {
                merchantName = store.storeName;
              }
              
              // Get image with priority: Physical > Online > FB
              if (!prioritizedImage && store.storeProfileImageUrl && store.storeProfileImageUrl.trim() !== '') {
                prioritizedImage = store.storeProfileImageUrl;
              }
            });

            // Only create merchant object if we have valid data
            if (merchantName && storeTypes.length > 0) {
              const groupedMerchant = {
                id: `merchant_${merchant.merchantId}`,
                merchantId: merchant.merchantId,
                name: merchantName,
                storeTypes: storeTypes,
                imageUrl: prioritizedImage,
                stores: sortedStores,
                hasMultipleTypes: storeTypes.length > 1,
              };

              console.log("Created grouped merchant:", groupedMerchant);
              groupedMerchants.push(groupedMerchant);
            } else {
              console.warn("Skipping merchant due to missing data:", merchant.merchantId);
            }
          } else {
            console.warn("Merchant has no valid stores:", merchant.merchantId);
          }
        });

        console.log("Total grouped merchants:", groupedMerchants.length);
        console.log("Grouped merchants data:", groupedMerchants);

        setNewArrivals(groupedMerchants);
        setFilteredMerchants(groupedMerchants); // Initialize filtered list

      } else {
        console.log("Invalid response format or no data:", response);
        setNewArrivals([]);
        setFilteredMerchants([]);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      setNewArrivals([]);
      setFilteredMerchants([]);
    } finally {
      setShopsLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      console.log("Fetching promotions...");
      
      const response = await callMobileApi(
        'GetPromotions',
        {},
        'mobile-app-promotions',
        '',
        'merchant'
      );

      console.log("=== PROMOTIONS API RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));

      if (response.statusCode === 200) {
        const promotionsData = response.data || [];
        setPromotions(Array.isArray(promotionsData) ? promotionsData : []);
        
        setFeaturedShops(Array.isArray(promotionsData) ? promotionsData : []);
        setFilteredPromotions(Array.isArray(promotionsData) ? promotionsData : []); // Initialize filtered promotions
        
        if (Array.isArray(promotionsData) && promotionsData.length > 0) {
          await ImageCacheManager.preloadPromotionImages(promotionsData);
        }
        
        console.log("Promotions loaded:", promotionsData.length);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
      setFeaturedShops([]);
      setFilteredPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      
      const response = await callMobileApi(
        'GetAllCategories',
        {},
        'mobile-app-categories',
        '',
        'merchant'
      );

      if (response.statusCode === 200) {
        const categoriesData = response.data || response.payload || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        console.log("Categories loaded successfully");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchTags = async () => {
    try {
      console.log("Fetching tags...");
      const response = await callMobileApi(
        'GetAllTags',
        {},
        'mobile-app-tags',
        '',
        'merchant'
      );
      
      if (response.statusCode === 200) {
        const tagsData = response.data || response.payload || [];
        setTags(Array.isArray(tagsData) ? tagsData : []);
        console.log("Tags loaded:", tagsData.length);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTags([]);
    }
  };
  
  const handleShopPress = (merchant: any) => {
    navigation.navigate('ShopDetailsScreen', { 
      merchant,
      merchantId: merchant.merchantId,
      stores: merchant.stores 
    });
  };

  // Helper functions remain the same...
  const getStoreTypeColor = (storeType: string) => {
    switch (storeType?.toLowerCase()) {
      case 'physical': return '#2E7D32';
      case 'online': return '#D84315';
      case 'fb': return '#1565C0';
      default: return '#424242';
    }
  };

  const getStoreTypeBackgroundColor = (storeType: string) => {
    switch (storeType?.toLowerCase()) {
      case 'physical': return 'rgba(46, 125, 50, 0.15)';
      case 'online': return 'rgba(216, 67, 21, 0.15)';
      case 'fb': return 'rgba(21, 101, 192, 0.15)';
      default: return 'rgba(66, 66, 66, 0.15)';
    }
  };

  const getStoreTypeIcon = (storeType: string) => {
    switch (storeType?.toLowerCase()) {
      case 'physical': return 'storefront-outline';
      case 'online': return 'globe-outline';
      case 'fb': return 'logo-facebook';
      default: return 'business-outline';
    }
  };

  const getStoreTypesDisplay = (storeTypes: string[]) => {
    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) return 'Shop';
    
    if (storeTypes.length === 1) {
      return storeTypes[0];
    }
    
    return `${storeTypes.length} Types`;
  };

  const getStoreTypesColor = (storeTypes: string[]) => {
    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) return '#666';
    
    if (storeTypes.length > 1) return '#8B4513';
    
    return getStoreTypeColor(storeTypes[0]);
  };

  const getStoreTypesIcon = (storeTypes: string[]) => {
    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) return 'business-outline';
    
    if (storeTypes.length > 1) return 'business-outline';
    
    return getStoreTypeIcon(storeTypes[0]);
  };

  const formatPromotionDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>{t('shop.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder={t('shop.searchPlaceholder')}
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="search-outline" size={20} color="#999" />
            )}
          </View>
          
          {/* Search Results Summary */}
          {searchQuery && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsText}>
                {t('shop.foundResults', {
                  shopCount: filteredMerchants.length,
                  shopText: filteredMerchants.length === 1 ? t('shop.shop') : t('shop.shops'),
                  promoCount: filteredPromotions.length,
                  promoText: filteredPromotions.length === 1 ? t('shop.promotion') : t('shop.promotions')
                })}
              </Text>
              {filteredMerchants.length === 0 && filteredPromotions.length === 0 && (
                <Text style={styles.noResultsText}>
                  {t('shop.noResultsFound')}
                </Text>
              )}
            </View>
          )}
        </View>
        
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {/* UPDATED: Categories - Now navigates to separate screen */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>{t('shop.categories')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {categories.length > 0 ? categories.map((category, index) => (
                <TouchableOpacity 
                  key={category.productCategoryId || index} 
                  style={styles.filterButton}
                  onPress={() => handleCategoryPress(category.productCategoryId, category.categoryName)}
                >
                  <Text style={styles.filterText}>
                    {category.categoryName || `Category ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              )) : (
                <View style={styles.emptyFilterContainer}>
                  <Text style={styles.emptyFilterText}>{t('shop.noCategories')}</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* UPDATED: Tags - Now navigates to separate screen */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>{t('shop.tags')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {tags.length > 0 ? tags.map((tag, index) => (
                <TouchableOpacity 
                  key={tag.tagId || index} 
                  style={styles.filterButton}
                  onPress={() => handleTagPress(tag.tagId, tag.tagName)}
                >
                  <Text style={styles.filterText}>
                    {tag.tagName || `Tag ${index + 1}`}
                  </Text>
                </TouchableOpacity>
              )) : (
                <View style={styles.emptyFilterContainer}>
                  <Text style={styles.emptyFilterText}>{t('shop.noTags')}</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Auto Slideshow Banner */}
          {promotions.length > 0 && (
            <View style={styles.bannerContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentOffset={{ x: currentSlide * (screenWidth - 32), y: 0 }} 
                style={styles.slideshowContainer}
              >
                {promotions.map((promo, index) => (
                  <View key={promo.promotionId || index} style={[styles.slideItem, { width: screenWidth - 32 }]}>
                    {promo.promotionImageLink && (
                      <OptimizedImage
                        source={{ uri: promo.promotionImageLink }}
                        style={styles.bannerImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        priority="high"
                        showLoadingIndicator={true}
                        fallbackIcon="megaphone-outline"
                        fallbackText="Promotion"
                      />
                    )}
                    <View style={styles.bannerOverlay}>
                      <Text style={styles.bannerTitle}>{promo.promotionName}</Text>
                      <Text style={styles.bannerDiscount}>{promo.discount}% OFF</Text>
                      <Text style={styles.bannerDescription}>{promo.description}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              {promotions.length > 1 && (
                <View style={styles.indicatorContainer}>
                  {promotions.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        { backgroundColor: currentSlide === index ? '#646b6aff' : 'rgba(255, 255, 255, 0.5)' }
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Featured - Shows filtered promotions */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? t('shop.filteredPromotions') : t('shop.featured')}
            </Text>
            <Text style={styles.resultCount}>
              {filteredPromotions.length} {filteredPromotions.length === 1 ? t('shop.promotion') : t('shop.promotions')}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
            {filteredPromotions.length > 0 ? filteredPromotions.map((promotion, index) => (
              <View 
                key={promotion.promotionId || index} 
                style={styles.shopCard}
              >
                {promotion.promotionImageLink ? (
                  <OptimizedImage 
                    source={{ uri: promotion.promotionImageLink }} 
                    style={styles.shopImage}
                    cachePolicy="memory-disk"
                    priority="normal"
                    showLoadingIndicator={true}
                    fallbackIcon="gift-outline"
                    fallbackText="Promotion"
                  />
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Ionicons 
                      name="gift-outline" 
                      size={40} 
                      color="#FF6B6B" 
                    />
                    <Text style={styles.noImageText}>
                      PROMOTION
                    </Text>
                  </View>
                )}
                
                <View style={styles.shopNameContainer}>
                  <Text style={styles.shopNameMiddle} numberOfLines={1}>{promotion.promotionName}</Text>
                </View>
                
                <View style={styles.shopCardOverlay}>
                  <View style={styles.promotionDetailsContainer}>
                    <Text style={styles.promotionDiscount}>{promotion.discount}% OFF</Text>
                    <Text style={styles.promotionDates}>
                      {formatPromotionDate(promotion.promotionFromDate)} - {formatPromotionDate(promotion.promotionToDate)}
                    </Text>
                    <Text style={styles.promotionMinOrder}>
                      Min: Rs.{promotion.minimumOrderCount?.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            )) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  {searchQuery ? t('shop.noPromotionsFoundFor', { query: searchQuery }) : t('shop.noPromotionsAvailable')}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* New Arrivals - Shows filtered shops */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? t('shop.searchResults') : t('shop.newArrivals')}
            </Text>
            <Text style={styles.resultCount}>
              {filteredMerchants.length} {filteredMerchants.length === 1 ? t('shop.shop') : t('shop.shops')}
            </Text>
            {shopsLoading && (
              <Text style={styles.loadingText}>{t('shop.loading')}</Text>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
            {filteredMerchants.length > 0 ? filteredMerchants.map((merchant, index) => (
              <TouchableOpacity 
                key={merchant.id || index} 
                style={styles.shopCard}
                onPress={() => handleShopPress(merchant)}
                activeOpacity={0.7}
              >
                {merchant.imageUrl ? (
                  <OptimizedImage 
                    source={{ uri: merchant.imageUrl }} 
                    style={styles.shopImage}
                    cachePolicy="memory-disk"
                    priority="normal"
                    showLoadingIndicator={true}
                    fallbackIcon="storefront-outline"
                    fallbackText="Shop Image"
                  />
                ) : (
                  <View style={styles.noImagePlaceholder}>
                    <Ionicons 
                      name={getStoreTypesIcon(merchant.storeTypes)} 
                      size={40} 
                      color={getStoreTypesColor(merchant.storeTypes)} 
                    />
                    <Text style={styles.noImageText}>
                      {getStoreTypesDisplay(merchant.storeTypes)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.shopNameContainer} pointerEvents="none">
                  <Text style={styles.shopNameMiddle} numberOfLines={1}>{merchant.name}</Text>
                </View>
                
                <View style={styles.shopCardOverlay} pointerEvents="none">
                  <View style={styles.storeTypesContainer}>
                    {merchant.storeTypes && Array.isArray(merchant.storeTypes) && merchant.storeTypes.map((storeType: string, typeIndex: number) => (
                      <View 
                        key={typeIndex} 
                        style={[
                          styles.storeTypeTag,
                          {
                            backgroundColor: getStoreTypeBackgroundColor(storeType),
                            borderColor: getStoreTypeColor(storeType),
                          }
                        ]}
                      >
                        <Ionicons 
                          name={getStoreTypeIcon(storeType)} 
                          size={8} 
                          color={getStoreTypeColor(storeType)} 
                        />
                        <Text style={[styles.storeTypeTagText, { color: getStoreTypeColor(storeType) }]}>
                          {storeType}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionText}>
                  {shopsLoading ? t('shop.loadingShops') : 
                   searchQuery ? t('shop.noShopsFoundFor', { query: searchQuery }) : t('shop.noMerchantsAvailable')}
                </Text>
              </View>
            )}
          </ScrollView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ShopScreen;

// Styles remain the same as before...
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    fontSize: 12,
    color: '#666',
  },
  
  // Search bar styles
  searchBarContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    paddingBottom: 8,
  },
  searchBar: {
    backgroundColor: '#eee',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  clearButton: {
    padding: 2,
  },
  
  // Search results indicator styles
  searchResultsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  noResultsText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Filter bar styles
  filterSection: {
    marginVertical: 6,
    paddingLeft: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  filterScroll: {
    paddingBottom: 4,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyFilterContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  emptyFilterText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },

  // Result count style
  resultCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Auto slideshow banner styles
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
    position: 'relative',
  },
  slideshowContainer: {
    width: '100%',
  },
  slideItem: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  bannerDiscount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 1,
  },
  bannerDescription: {
    fontSize: 11,
    color: '#fff',
    textAlign: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    paddingTop: 12,
  },
  horizontalCards: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  shopCard: {
    marginRight: 12,
    width: 130,
    position: 'relative',
  },
  
  shopNameContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -8 }],
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  
  shopNameMiddle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  
  shopCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 3,
    justifyContent: 'center',
  },
  
  shopImage: {
    width: 130,
    height: 145,
    borderRadius: 12,
  },
  
  storeTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  storeTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginHorizontal: 0.5,
    marginVertical: 0.5,
    borderWidth: 1,
  },
  
  storeTypeTagText: {
    fontSize: 7,
    fontWeight: '600',
    marginLeft: 1.5,
    textTransform: 'uppercase',
  },
  
  storeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  
  storeTypeText: {
    fontSize: 8,
    fontWeight: '600',
    marginLeft: 3,
    textTransform: 'uppercase',
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
    paddingVertical: 20,
    minWidth: 150,
  },
  emptySectionText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  noImagePlaceholder: {
    width: 130,
    height: 145,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noImageText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  emptyCategoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyCategoriesText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  
  promotionDetailsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  promotionDiscount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 1,
  },
  
  promotionDates: {
    fontSize: 7,
    color: '#fff',
    marginBottom: 0.5,
  },
  
  promotionMinOrder: {
    fontSize: 6,
    color: '#fff',
    opacity: 0.9,
  },
});