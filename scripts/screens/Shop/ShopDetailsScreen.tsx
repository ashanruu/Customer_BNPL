import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import OptimizedImage from '../../components/OptimizedImage';
import { callMerchantApi } from '../../scripts/api';

interface ShopDetailsProps {
  route: {
    params: {
      shop: {
        id: string;
        name: string;
        imageUrl?: string;
        description?: string;
        discount?: number;
        merchantId?: string;
        minOrder?: number;
        fromDate?: string;
        toDate?: string;
      };
    };
  };
}

const ShopDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { shop } = route.params;
  
  const [merchantDetails, setMerchantDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Dummy data for testing
  const dummyMerchantDetails = {
    categories: ['Electronics', 'Gadgets', 'Accessories'],
    addresses: [
      {
        fullAddress: '123 Main Street, Downtown',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      {
        fullAddress: '456 Broadway Avenue, Midtown',
        city: 'New York',
        state: 'NY',
        zipCode: '10002'
      }
    ],
    websiteUrl: 'https://www.example-shop.com',
    onlineStoreUrl: 'https://store.example-shop.com',
    phoneNumber: '+1 (555) 123-4567',
    email: 'contact@example-shop.com'
  };

  useEffect(() => {
    if (shop.merchantId) {
      fetchMerchantDetails();
    } else {
      // Use dummy data when no merchantId
      setMerchantDetails(dummyMerchantDetails);
    }
  }, [shop.merchantId]);

  const fetchMerchantDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching merchant details for ID:", shop.merchantId);
      
      const response = await callMerchantApi(
        'GetMerchantDetails',
        { merchantId: shop.merchantId },
        'mobile-app-merchant-details',
        ''
      );

      console.log("Merchant Details Response:", JSON.stringify(response, null, 2));

      if (response.statusCode === 200) {
        setMerchantDetails(response.data || response.payload);
      } else {
        // Fallback to dummy data if API fails
        setMerchantDetails(dummyMerchantDetails);
      }
    } catch (error) {
      console.error("Error fetching merchant details:", error);
      // Fallback to dummy data on error
      setMerchantDetails(dummyMerchantDetails);
    } finally {
      setLoading(false);
    }
  };

  const handleShopOnline = (url?: string) => {
    const onlineUrl = url || merchantDetails?.websiteUrl || merchantDetails?.onlineStoreUrl;
    if (onlineUrl) {
      Linking.openURL(onlineUrl).catch(() => {
        Alert.alert('Error', 'Could not open the online store');
      });
    } else {
      Alert.alert('Not Available', 'Online store link is not available');
    }
  };

  const handleGetDirections = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps');
    });
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Could not make phone call');
    });
  };

  // Use dummy data if merchantDetails is null
  const displayData = merchantDetails || dummyMerchantDetails;

  const InfoItem = ({ icon, label, value, onPress, showChevron = false }: { 
    icon: string; 
    label: string; 
    value: string; 
    onPress?: () => void; 
    showChevron?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.infoItem} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={20} color="#6B7280" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={22} color="#666" />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.headerTitle}>{shop.name}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading shop details...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {/* Shop Header Card - Fixed at top */}
          <View style={styles.shopCard}>
            <View style={styles.avatarContainer}>
              {shop.imageUrl ? (
                <OptimizedImage
                  source={{ uri: shop.imageUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  priority="high"
                  showLoadingIndicator={true}
                />
              ) : (
                <View style={styles.noImageContainer}>
                  <Ionicons name="storefront-outline" size={40} color="#8E8E93" />
                </View>
              )}
            </View>

            <View style={styles.rightContent}>
              {/* Tags & Categories */}
              {displayData?.categories && displayData.categories.length > 0 && (
                <View style={styles.tagsContainer}>
                  {displayData.categories.slice(0, 3).map((category: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{category}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Contact Information - Minimalistic */}
              <View style={styles.contactContainer}>
                {displayData?.phoneNumber && (
                  <TouchableOpacity 
                    style={styles.contactItem}
                    onPress={() => handleCall(displayData.phoneNumber)}
                  >
                    <Ionicons name="call-outline" size={16} color="#6B7280" />
                    <Text style={styles.contactText}>{displayData.phoneNumber}</Text>
                  </TouchableOpacity>
                )}
                
                {displayData?.email && (
                  <TouchableOpacity 
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(`mailto:${displayData.email}`)}
                  >
                    <Ionicons name="mail-outline" size={16} color="#6B7280" />
                    <Text style={styles.contactText}>{displayData.email}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Scrollable content */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Store Locations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Store Locations</Text>
              
              <View style={styles.sectionContent}>
                {displayData?.addresses && displayData.addresses.length > 0 ? (
                  displayData.addresses.map((address: any, index: number) => (
                    <InfoItem
                      key={index}
                      icon="location-outline"
                      label="Address"
                      value={`${address.fullAddress || address.address || 'Address not available'}${
                        address.city ? `\n${address.city}, ${address.state} ${address.zipCode}` : ''
                      }`}
                      onPress={() => handleGetDirections(address.fullAddress || address.address)}
                      showChevron={true}
                    />
                  ))
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No store locations available</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Online Store */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop Online</Text>
              
              <View style={styles.sectionContent}>
                {displayData?.websiteUrl && (
                  <InfoItem
                    icon="globe-outline"
                    label="Website"
                    value={displayData.websiteUrl}
                    onPress={() => handleShopOnline(displayData.websiteUrl)}
                    showChevron={true}
                  />
                )}
                
                {displayData?.onlineStoreUrl && (
                  <InfoItem
                    icon="basket-outline"
                    label="Online Store"
                    value={displayData.onlineStoreUrl}
                    onPress={() => handleShopOnline(displayData.onlineStoreUrl)}
                    showChevron={true}
                  />
                )}
                
                {!displayData?.websiteUrl && !displayData?.onlineStoreUrl && (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No online store links available</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  shopCard: {
    backgroundColor: "#fff",
    padding: 24,
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
  },
  noImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightContent: {
    flex: 1,
    justifyContent: "space-between",
    minHeight: 80,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: "#374151",
    fontSize: 10,
    fontWeight: "500",
  },
  contactContainer: {
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    elevation: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
    lineHeight: 22,
  },
  noDataContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 15,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  bottomPadding: {
    height: 40,
  },
});

export default ShopDetailsScreen;