import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../../components/CustomButton';
import StoreCard from '../../components/StoreCard';
import ManualTabNavigator from '../../components/ManualTabNavigator';
import { StoresContent } from '../StoreManagement/StoresSectionScreen';
import ScanScreen from '../QrScanScreen/staticQrScreens/scanScreen';

// Dashboard content component
const DashboardContent: React.FC = () => {
  const navigation = useNavigation<any>();
  
  // Animation setup for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = 310;
  const HEADER_MIN_HEIGHT = 80;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // Interpolated values for header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const creditCardOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const collapsedViewOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const borderRadiusValue = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 15],
    extrapolate: 'clamp',
  });

  const userSectionOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const userSectionHeight = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [72, 0],
    extrapolate: 'clamp',
  });

  const cardMarginHorizontal = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });

  const cardPaddingHorizontal = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [8, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* White User Info Section - Animated */}
      <Animated.View style={[styles.userSection, { 
        opacity: userSectionOpacity,
        height: userSectionHeight,
        overflow: 'hidden'
      }]}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.userName}>Adeesha Perera</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color="#1F2937" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Header Container */}
      <Animated.View style={[styles.headerContainer, { 
        height: headerHeight,
        top: Animated.add(userSectionHeight, 16),
        left: cardMarginHorizontal,
        right: cardMarginHorizontal,
        paddingLeft: cardPaddingHorizontal,
        paddingRight: cardPaddingHorizontal,
      }]}>
        <View style={styles.creditCardHeader}>
          {/* Full Credit Card Details - Fades out on scroll */}
          <Animated.View style={[styles.creditCardContent, { opacity: creditCardOpacity }]}>
            <View style={styles.creditCardTop}>
              <Text style={styles.creditLabel}>Total Credit Limit</Text>
              <View style={styles.creditAmountRow}>
                <Text style={styles.creditAmount}>Rs. 500,000</Text>
                <Text style={styles.creditDecimals}>.00</Text>
              </View>
            </View>

            <View style={styles.dividerLineContainer}>
              <View style={styles.dividerLine} />
              <TouchableOpacity style={styles.platinumBadge}>
                <Text style={styles.platinumText}>Platinum</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.spendingSection}>
              <Text style={styles.spendingLabel}>You can{'\n'}spend up to</Text>
              <View style={styles.spendingAmountRow}>
                <Text style={styles.spendingCurrency}>Rs.</Text>
                <Text style={styles.spendingAmount}>357,869</Text>
                <Text style={styles.spendingDecimals}>.97</Text>
              </View>
            </View>

            <CustomButton
              title="Increase Spending Limit"
              onPress={() => console.log('Increase Spending')}
              variant="secondary"
              size="medium"
              fullWidth
              style={styles.increaseLimitButton}
            />
          </Animated.View>

          {/* Collapsed View - Fades in on scroll */}
          <Animated.View style={[styles.collapsedView, { opacity: collapsedViewOpacity }]}>
            <View style={styles.collapsedContent}>
              <Text style={styles.collapsedLabel}>Available to spend</Text>
              <View style={styles.collapsedAmountRow}>
                <Text style={styles.collapsedCurrency}>Rs.</Text>
                <Text style={styles.collapsedAmount}>357,869</Text>
                <Text style={styles.collapsedDecimals}>.97</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#9CA3AF" />
          <Text style={styles.searchPlaceholder}>
            Find your fav store or product here
          </Text>
        </View>

        {/* Category Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          <TouchableOpacity style={[styles.categoryBadge, styles.categoryBadgeActive]}>
            <Icon name="heart" size={20} color="#FFFFFF" />
            <Text style={styles.categoryTextActive}>Health & Beauty</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryBadge}>
            <Icon name="account" size={20} color="#666666" />
            <Text style={styles.categoryText}>Men</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryBadge}>
            <Icon name="account-outline" size={20} color="#666666" />
            <Text style={styles.categoryText}>Women</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.categoryBadge}>
            <Icon name="laptop" size={20} color="#666666" />
            <Text style={styles.categoryText}>Electronic</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>
                TimeZone Desi{'\n'}50% OFF
              </Text>
              <Text style={styles.promoDescription}>
                To promote ws ss okive. Eom items{'\n'}
                cannot redeice vl ut th quibubom.
              </Text>
              <TouchableOpacity style={styles.buyNowButton}>
                <Text style={styles.buyNowText}>BUY NOW</Text>
                <Icon name="arrow-right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://via.placeholder.com/150x200' }}
              style={styles.promoImage}
            />
          </View>
        </View>

        {/* Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stores</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storesRow}
        >
          <View style={styles.storeCircle}>
            <View style={[styles.storeIconCircle, { backgroundColor: '#00BCD4' }]}>
              <Text style={styles.storeInitial}>K</Text>
            </View>
            <Text style={styles.storeName}>Keells</Text>
          </View>
          <View style={styles.storeCircle}>
            <View style={[styles.storeIconCircle, { backgroundColor: '#F44336' }]}>
              <Text style={styles.storeInitial}>F</Text>
            </View>
            <Text style={styles.storeName}>Fashion Bug</Text>
          </View>
          <View style={styles.storeCircle}>
            <View style={[styles.storeIconCircle, { backgroundColor: '#000000' }]}>
              <Text style={styles.storeInitial}>C</Text>
            </View>
            <Text style={styles.storeName}>Cargills</Text>
          </View>
          <View style={styles.storeCircle}>
            <View style={[styles.storeIconCircle, { backgroundColor: '#E91E63' }]}>
              <Text style={styles.storeInitial}>B</Text>
            </View>
            <Text style={styles.storeName}>Barista</Text>
          </View>
          <View style={styles.storeCircle}>
            <View style={[styles.storeIconCircle, { backgroundColor: '#C62828' }]}>
              <Text style={styles.storeInitial}>M</Text>
            </View>
            <Text style={styles.storeName}>Mini</Text>
          </View>
        </ScrollView>

        {/* Featured Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Stores</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredStoresRow}
        >
          <StoreCard
            image={{ uri: 'https://via.placeholder.com/200x280' }}
            storeName="Keells"
            storeType="Website | Instore"
            discount="Upto 50% off"
            width={160}
            height={220}
            onPress={() => console.log('Store pressed')}
          />
          <StoreCard
            image={{ uri: 'https://via.placeholder.com/200x280' }}
            storeName="Fashion Bug"
            storeType="Website | Instore"
            discount="Upto 30% off"
            width={160}
            height={220}
            onPress={() => console.log('Store pressed')}
          />
          <StoreCard
            image={{ uri: 'https://via.placeholder.com/200x280' }}
            storeName="Cargills"
            storeType="Website | Instore"
            discount="Upto 40% off"
            width={160}
            height={220}
            onPress={() => console.log('Store pressed')}
          />
        </ScrollView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

// Main DashboardScreen that wraps everything with ManualTabNavigator
const DashboardScreen: React.FC = () => {
  return (
    <ManualTabNavigator 
      HomeComponent={DashboardContent} 
      StoreComponent={StoresContent}
      ScanComponent={ScanScreen}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1001,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContainer: {
    position: 'absolute',
    top: 88,
    left: 16,
    right: 16,
    zIndex: 1000,
    overflow: 'visible',
    paddingTop: 16,
    paddingBottom: 16,
  },
  creditCardHeader: {
    flex: 1,
    backgroundColor: '#0B5A8E',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    borderRadius: 13,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  creditCardContent: {
    flex: 1,
  },
  collapsedView: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
  },
  collapsedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.9,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  collapsedAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  collapsedCurrency: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  collapsedAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  collapsedDecimals: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  scrollContent: {
    paddingTop: 320,
    paddingBottom: 90,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  creditCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  creditLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  creditAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  creditAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  creditDecimals: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  dividerLineContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  platinumBadge: {
    position: 'absolute',
    right: 0,
    top: -12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  platinumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B5A8E',
    letterSpacing: 0.3,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  spendingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  spendingLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 18,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  spendingAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spendingCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  spendingAmount: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  spendingDecimals: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  increaseLimitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#0B5A8E',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  categoriesRow: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  categoryBadgeActive: {
    backgroundColor: '#0066CC',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  categoryTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  promoBanner: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  promoContent: {
    flexDirection: 'row',
    padding: 20,
  },
  promoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  promoDescription: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  buyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buyNowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  promoImage: {
    width: 120,
    height: 150,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  storesRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  storeCircle: {
    alignItems: 'center',
    marginRight: 20,
  },
  storeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  storeInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  storeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  featuredStoresRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
});

export default DashboardScreen;
