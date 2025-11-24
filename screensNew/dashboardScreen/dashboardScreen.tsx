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
import MyAccountScreen from '../MyProfile/MyAccountScreen';
import { LinearGradient } from 'expo-linear-gradient';
import OrderScreen from '../OrderScreen/OrderScreen';
import { callMobileApi } from '../../scripts/api';
import ImageCacheManager from '../../utils/ImageCacheManager';

type RootStackParamList = {
  DashboardScreen: { username: string };
  MyAccountScreen: { username: string };
};

type DashboardScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DashboardScreen'
>;
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

  const categories = [
    { label: 'All', isActive: true },
    { label: 'Electronics' },
    { label: 'Fashion' },
    { label: 'Grocery' },
    { label: 'Travel' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* White User Info Section - Animated */}
      <Animated.View style={[styles.userSection, { 
        opacity: userSectionOpacity,
        height: userSectionHeight,
        overflow: 'hidden'
      }]}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => navigation.navigate('MyAccountScreen',{ username: route.params.username || "" })}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.userName}>Adeesha Perera</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color="#1F2937" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </Animated.View>

      {/* Animated Header Container */}
      <Animated.View
        style={[styles.headerContainer, {
          height: headerHeight,
          top: Animated.add(userSectionHeight, 16),
          left: cardMarginHorizontal,
          right: cardMarginHorizontal,
          paddingLeft: cardPaddingHorizontal,
          paddingRight: cardPaddingHorizontal,
        }]}
      >
        <LinearGradient
          colors={['#0A5494', '#06346A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditCardHeader}
        >
          {/* Expanded credit card details */}
          <Animated.View style={[styles.creditCardContent, { opacity: creditCardOpacity }]}>

            <View style={styles.primaryAmountRow}>
              <Text style={styles.primaryCurrency}>Rs.</Text>
              <Text style={styles.primaryAmount}>357,869</Text>
              <Text style={styles.primaryDecimals}>.97</Text>
            </View>
            <Text style={styles.secondaryLabel}>You can spend up to</Text>

            

            <View style={styles.tierRow}>
              <View style={styles.dashedLine} />
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>Platinum</Text>
              </View>
              <View style={styles.dashedLine} />
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Due Amount</Text>
              <View style={styles.totalAmountRow}>
                <Text style={styles.totalCurrency}>Rs.</Text>
                <Text style={styles.totalAmount}>00</Text>
                <Text style={styles.totalDecimals}>.00</Text>
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
        </LinearGradient>
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
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
            <Icon name="tune-variant" size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.label}
              activeOpacity={0.8}
              style={[
                styles.categoryBadge,
                category.isActive && styles.categoryBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  category.isActive && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>Deals of the week</Text>
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
      OrdersComponent={OrderScreen}
      ProfileComponent={MyAccountScreen}
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
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
    borderRadius: 18,
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
    width: '100%',
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardHeaderLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.85,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  cardHeaderAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardHeaderAmount: {
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
  cardHeaderDecimals: {
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
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  primaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryCurrency: {
    fontSize: 18,
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
  primaryAmount: {
    fontSize: 42,
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
  primaryDecimals: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dashedLine: {
    flex: 1,
    borderStyle: 'dashed',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 1)',
  },
  tierBadge: {
    marginHorizontal: 0,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#150592e0',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  totalAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalCurrency: {
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
  totalAmount: {
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
  totalDecimals: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 2,
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
    marginTop: -5,
    backgroundColor: 'rgba(255, 253, 253, 1)',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
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
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
