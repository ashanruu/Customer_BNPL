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
import { useTranslation } from 'react-i18next';
import OptimizedImage from '../../components/OptimizedImage';
import { callMobileApi } from '../../scripts/api';

interface StoreDetails {
  storeId: number;
  fK_MerchantId: number;
  storeName: string;
  storeType: string;
  storeEmail: string;
  storeContactNumber: string;
  storeAddress: string;
  operatingHours: number;
  storeLink: string;
  storeProfileImageUrl: string;
  isActive: boolean;
  dateAdded: string;
}

const ShopDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { merchant, merchantId } = route.params;
  
  const [storeDetails, setStoreDetails] = useState<StoreDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (merchantId) {
      fetchStoreDetails();
    }
  }, [merchantId]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      console.log("Fetching store details for merchant ID:", merchantId);
      
      const response = await callMobileApi(
        'GetStoreDetails',
        { Fk_MerchantId: merchantId },
        'mobile-app-store-details',
        '',
        'customer'
      );

      console.log("=== FULL GetStoreDetails RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));

      if (response.statusCode === 200 && response.data) {
        setStoreDetails(response.data);
        console.log("Store details loaded:", response.data.length, "stores");
      } else {
        console.log("Failed to fetch store details:", response.message);
        setStoreDetails([]);
      }
    } catch (error) {
      console.error("Error fetching store details:", error);
      setStoreDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const getStoreTypeColor = (storeType: string) => {
    switch (storeType?.toLowerCase()) {
      case 'physical': return '#2E7D32';
      case 'online': return '#D84315';   // CHANGED: Now using FB color (orange/red)
      case 'fb': return '#1565C0';       // CHANGED: Now using Online color (blue)
      default: return '#424242';
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

  const handleStoreLink = (storeLink: string, storeType: string) => {
    if (storeLink && storeLink.trim() !== '') {
      Linking.openURL(storeLink).catch(() => {
        Alert.alert(t('shop.errorOpeningLink'), t('shop.couldNotOpenLink', { type: storeType.toLowerCase() }));
      });
    } else {
      Alert.alert(t('shop.notAvailable'), t('shop.linkNotAvailable', { type: storeType }));
    }
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber.trim() !== '') {
      Linking.openURL(`tel:${phoneNumber}`).catch(() => {
        Alert.alert(t('shop.errorOpeningLink'), t('shop.couldNotMakeCall'));
      });
    } else {
      Alert.alert(t('shop.notAvailable'), t('shop.phoneNotAvailable'));
    }
  };

  const handleEmail = (email: string) => {
    if (email && email.trim() !== '') {
      Linking.openURL(`mailto:${email}`).catch(() => {
        Alert.alert(t('shop.errorOpeningLink'), t('shop.couldNotOpenEmail'));
      });
    } else {
      Alert.alert(t('shop.notAvailable'), t('shop.emailNotAvailable'));
    }
  };

  const handleGetDirections = (address: string) => {
    if (address && address.trim() !== '') {
      const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert(t('shop.errorOpeningLink'), t('shop.couldNotOpenMaps'));
      });
    } else {
      Alert.alert(t('shop.notAvailable'), t('shop.addressNotAvailable'));
    }
  };

  const formatOperatingHours = (hours: number) => {
    if (hours === 0) return t('shop.notSpecified');
    if (hours === 24) return t('shop.hours24');
    return t('shop.hoursFormat', { hours });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

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
          <Text style={styles.headerTitle}>{merchant?.name || t('shop.storeDetails')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>{t('shop.loadingStoreDetails')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {storeDetails.length > 0 ? (
            storeDetails.map((store, index) => (
              <View key={store.storeId} style={styles.storeCard}>
                {/* Store Header */}
                <View style={styles.storeHeader}>
                  <View style={styles.storeImageContainer}>
                    {store.storeProfileImageUrl && store.storeProfileImageUrl.trim() !== '' ? (
                      <OptimizedImage
                        source={{ uri: store.storeProfileImageUrl }}
                        style={styles.storeImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        priority="normal"
                        showLoadingIndicator={true}
                      />
                    ) : (
                      <View style={styles.noImageContainer}>
                        <Ionicons 
                          name={getStoreTypeIcon(store.storeType)} 
                          size={30} 
                          color={getStoreTypeColor(store.storeType)} 
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.storeHeaderInfo}>
                    <Text style={styles.storeName}>{store.storeName}</Text>
                    <View style={styles.storeTypeContainer}>
                      <Ionicons 
                        name={getStoreTypeIcon(store.storeType)} 
                        size={14} 
                        color={getStoreTypeColor(store.storeType)} 
                      />
                      <Text style={[styles.storeTypeText, { color: getStoreTypeColor(store.storeType) }]}>
                        {store.storeType}
                      </Text>
                    </View>
                    <Text style={styles.storeAddedDate}>
                      {t('shop.added')} {formatDate(store.dateAdded)}
                    </Text>
                  </View>

                  <View style={styles.storeStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: store.isActive ? '#10B981' : '#EF4444' }]}>
                      <Text style={styles.statusText}>
                        {store.isActive ? t('shop.active') : t('shop.inactive')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Store Details */}
                <View style={styles.storeDetails}>
                  {/* Contact Information */}
                  {store.storeContactNumber && store.storeContactNumber.trim() !== '' && (
                    <TouchableOpacity 
                      style={styles.detailItem}
                      onPress={() => handleCall(store.storeContactNumber)}
                    >
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="call-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{t('shop.phone')}</Text>
                        <Text style={styles.detailValue}>{store.storeContactNumber}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                  )}

                  {/* Email */}
                  {store.storeEmail && store.storeEmail.trim() !== '' && (
                    <TouchableOpacity 
                      style={styles.detailItem}
                      onPress={() => handleEmail(store.storeEmail)}
                    >
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="mail-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{t('shop.email')}</Text>
                        <Text style={styles.detailValue}>{store.storeEmail}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                  )}

                  {/* Address */}
                  {store.storeAddress && store.storeAddress.trim() !== '' && (
                    <TouchableOpacity 
                      style={styles.detailItem}
                      onPress={() => handleGetDirections(store.storeAddress)}
                    >
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="location-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{t('shop.address')}</Text>
                        <Text style={styles.detailValue}>{store.storeAddress}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                  )}

                  {/* Operating Hours - ONLY show for Physical stores */}
                  {store.storeType.toLowerCase() === 'physical' && (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="time-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{t('shop.operatingHours')}</Text>
                        <Text style={styles.detailValue}>{store.operatingHours}</Text>
                      </View>
                    </View>
                  )}

                  {/* Store Link */}
                  {store.storeLink && store.storeLink.trim() !== '' && (
                    <TouchableOpacity 
                      style={styles.detailItem}
                      onPress={() => handleStoreLink(store.storeLink, store.storeType)}
                    >
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="link-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{store.storeType} {t('shop.storeLink')}</Text>
                        <Text style={styles.detailValue} numberOfLines={1}>{store.storeLink}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Store Actions - REMOVED Visit buttons for Online and FB stores */}
                <View style={styles.storeActions}>
                  {store.storeType.toLowerCase() === 'physical' && store.storeLink && store.storeLink.trim() !== '' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: getStoreTypeColor(store.storeType) }]}
                      onPress={() => handleStoreLink(store.storeLink, store.storeType)}
                    >
                      <Ionicons name={getStoreTypeIcon(store.storeType)} size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>
                        {t('shop.visitStore', { storeType: store.storeType })}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="storefront-outline" size={60} color="#C7C7CC" />
              <Text style={styles.noDataTitle}>{t('shop.noStoreDetails')}</Text>
              <Text style={styles.noDataText}>
                {t('shop.noStoreDetailsDesc')}
              </Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // UPDATED: Removed all shadow properties
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    // REMOVED: elevation: 2,
    // REMOVED: shadowColor: '#000',
    // REMOVED: shadowOffset: { width: 0, height: 1 },
    // REMOVED: shadowOpacity: 0.1,
    // REMOVED: shadowRadius: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storeImageContainer: {
    marginRight: 12,
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  noImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeHeaderInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  storeTypeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  storeAddedDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  storeStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  storeDetails: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  storeActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  bottomPadding: {
    height: 40,
  },
});

export default ShopDetailsScreen;