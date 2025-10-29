import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { callMobileApi } from '../../scripts/api';
import OptimizedImage from '../../components/OptimizedImage';

interface Store {
  storeId: number;
  fK_MerchantId: number;
  storeName?: string;
  storeType?: string;
  storeProfileImageUrl?: string;
  storeEmail?: string;
  storeContactNumber?: string;
  storeAddress?: string;
  isActive?: boolean;
}

interface GroupedMerchant {
  merchantId: number;
  name: string;
  storeTypes: string[];
  imageUrl?: string;
  stores: Store[];
  hasMultipleTypes: boolean;
  id: string;
}

const CategoryShopsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { filterId, filterName, filterType, payload } = route.params;
  
  const [shops, setShops] = useState<GroupedMerchant[]>([]);
  const [filteredShops, setFilteredShops] = useState<GroupedMerchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchFilteredShops();
  }, [filterId]);

  useEffect(() => {
    filterShops();
  }, [searchQuery, shops]);

  const filterShops = () => {
    if (!searchQuery.trim()) {
      setFilteredShops(shops);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = shops.filter((shop) => {
      const shopName = shop.name?.toLowerCase() || '';
      const matchesStores = shop.stores?.some((store: Store) => 
        store.storeName?.toLowerCase().includes(query)
      ) || false;
      const matchesStoreTypes = shop.storeTypes?.some((storeType: string) => {
        const type = storeType?.toLowerCase() || '';
        return type.includes(query);
      }) || false;

      return shopName.includes(query) || matchesStores || matchesStoreTypes;
    });

    setFilteredShops(filtered);
  };

  const fetchFilteredShops = async () => {
    try {
      setLoading(true);
      console.log(`Fetching shops for ${filterType}:`, filterId);
      
      const response = await callMobileApi(
        'GetStoreFilter',
        payload,
        'mobile-app-shop-filter',
        '',
        'customer'
      );

      console.log("=== CATEGORY SHOPS RESPONSE ===");
      console.log("Payload:", payload);
      console.log("Response:", JSON.stringify(response, null, 2));

      if (response.statusCode === 200 && response.data && Array.isArray(response.data)) {
        const storesData = response.data;
        
        // UPDATED: Group stores by merchant since API returns individual stores
        const merchantsMap = new Map<number, Store[]>();
        
        storesData.forEach((store: Store) => {
          if (store.fK_MerchantId && store.isActive !== false) {
            const merchantId = store.fK_MerchantId;
            if (!merchantsMap.has(merchantId)) {
              merchantsMap.set(merchantId, []);
            }
            merchantsMap.get(merchantId)?.push(store);
          }
        });

        const groupedMerchants: GroupedMerchant[] = [];

        // Process each merchant and group their stores
        merchantsMap.forEach((stores, merchantId) => {
          if (stores.length > 0) {
            const storeTypes: string[] = [];
            let prioritizedImage: string | null = null;
            let merchantName: string = '';
            
            // Sort stores by priority: Physical > Online > FB
            const sortedStores = stores.sort((a: Store, b: Store) => {
              const priority: { [key: string]: number } = { 'Physical': 1, 'Online': 2, 'FB': 3 };
              return (priority[a.storeType || ''] || 999) - (priority[b.storeType || ''] || 999);
            });

            // Get prioritized image and collect store types
            sortedStores.forEach((store: Store) => {
              // Add store type to array if not already present and if it exists
              if (store.storeType && !storeTypes.includes(store.storeType)) {
                storeTypes.push(store.storeType);
              }
              
              // Set merchant name (use first store's name)
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
              const groupedMerchant: GroupedMerchant = {
                id: `merchant_${merchantId}`,
                merchantId: merchantId,
                name: merchantName,
                storeTypes: storeTypes,
                imageUrl: prioritizedImage || undefined,
                stores: sortedStores,
                hasMultipleTypes: storeTypes.length > 1,
              };

              groupedMerchants.push(groupedMerchant);
            }
          }
        });

        console.log(`${filterType} shops loaded:`, groupedMerchants.length);
        setShops(groupedMerchants);
        setFilteredShops(groupedMerchants);

      } else {
        console.log(`No shops found for ${filterType}`);
        setShops([]);
        setFilteredShops([]);
      }
    } catch (error) {
      console.error(`Error fetching ${filterType} shops:`, error);
      setShops([]);
      setFilteredShops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShopPress = (merchant: GroupedMerchant) => {
    navigation.navigate('ShopDetailsScreen', { 
      merchant,
      merchantId: merchant.merchantId,
      stores: merchant.stores 
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Helper functions
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

  const getStoreTypesIcon = (storeTypes: string[]) => {
    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) return 'business-outline';
    
    if (storeTypes.length > 1) return 'business-outline';
    
    return getStoreTypeIcon(storeTypes[0]);
  };

  const getStoreTypesColor = (storeTypes: string[]) => {
    if (!storeTypes || !Array.isArray(storeTypes) || storeTypes.length === 0) return '#666';
    
    if (storeTypes.length > 1) return '#8B4513';
    
    return getStoreTypeColor(storeTypes[0]);
  };

  const renderShopItem = ({ item: merchant, index }: { item: GroupedMerchant; index: number }) => (
    <TouchableOpacity 
      style={styles.shopItem}
      onPress={() => handleShopPress(merchant)}
      activeOpacity={0.7}
    >
      <View style={styles.shopImageContainer}>
        {merchant.imageUrl ? (
          <OptimizedImage 
            source={{ uri: merchant.imageUrl }} 
            style={styles.shopItemImage}
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
          </View>
        )}
      </View>
      
      <View style={styles.shopItemContent}>
        <Text style={styles.shopItemName} numberOfLines={2}>{merchant.name}</Text>
        
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
                size={12} 
                color={getStoreTypeColor(storeType)} 
              />
              <Text style={[styles.storeTypeTagText, { color: getStoreTypeColor(storeType) }]}>
                {storeType}
              </Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.shopItemStores}>
          {merchant.stores?.length || 0} {merchant.stores?.length === 1 ? 'store' : 'stores'}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{filterName}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder={`Search in ${filterName}`}
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
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
          
          {searchQuery && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsText}>
                {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'} found
              </Text>
            </View>
          )}
        </View>

        {/* Shops List */}
        <View style={styles.shopsContainer}>
          <View style={styles.shopsHeader}>
            <Text style={styles.shopsTitle}>
              {searchQuery ? 'Search Results' : 'All Shops'}
            </Text>
            <Text style={styles.shopsCount}>
              {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading shops...</Text>
            </View>
          ) : filteredShops.length > 0 ? (
            <FlatList
              data={filteredShops}
              renderItem={renderShopItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.shopsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No shops found' : 'No shops available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `No shops found for "${searchQuery}" in ${filterName}`
                  : `No shops available in ${filterName} ${filterType}`
                }
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CategoryShopsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  
  // Search bar styles
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    backgroundColor: '#f0f0f0',
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
  searchResultsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Shops container
  shopsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shopsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shopsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  shopsCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  
  // Shop item styles
  shopsList: {
    paddingBottom: 20,
  },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shopImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  shopItemImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shopItemContent: {
    flex: 1,
  },
  shopItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  storeTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  storeTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    borderWidth: 1,
  },
  storeTypeTagText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  shopItemStores: {
    fontSize: 12,
    color: '#666',
  },
  
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});