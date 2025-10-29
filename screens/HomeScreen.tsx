import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Animated, Dimensions, RefreshControl, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { callMobileApi, callMerchantApi } from '../scripts/api';
import OptimizedImage from '../components/OptimizedImage';
import ImageCacheManager from '../utils/ImageCacheManager';

interface NavButtonProps {
  label: string;
  icon: any; // Using any for Ionicons name to avoid type issues
  active: boolean;
  onPress: () => void;
}

function NavButton({ label, icon, active, onPress }: NavButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.navButton, active && styles.navButtonActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={active ? '#090B1A' : '#999'} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('home');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [creditLimits, setCreditLimits] = useState<any>(null);
  const [loanList, setLoanList] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [creditLimitsLoading, setCreditLimitsLoading] = useState(false);
  const [loanListLoading, setLoanListLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigation = useNavigation();

  // Get screen width for slideshow
  const screenWidth = Dimensions.get('window').width;
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = 120;
  const HEADER_MIN_HEIGHT = 15;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // Interpolated values for header animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const creditSectionOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const circleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });


  const borderRadiusValue = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [30, 20],
    extrapolate: 'clamp',
  });

  // Auto slideshow effect
  useEffect(() => {
    if (promotions.length > 1) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % promotions.length);
      }, 3000); // Change slide every 3 seconds

      return () => {
        if (slideInterval.current) {
          clearInterval(slideInterval.current);
        }
      };
    }
  }, [promotions.length]);

  // Fetch promotions data separately
  const fetchPromotions = async () => {
    try {
      setPromotionsLoading(true);
      const payload = {};

      const promotionResponse = await callMerchantApi(
        'GetPromotions',
        payload,
        'mobile-app-promotions',
        ''
      );

      console.log('GetPromotions response:', promotionResponse);

      if (promotionResponse.statusCode === 200) {
        const promotionsData = promotionResponse.data || promotionResponse.payload || promotionResponse;

        if (Array.isArray(promotionsData)) {
          setPromotions(promotionsData);
          console.log('Promotions set successfully:', promotionsData.length, 'items');
          // Preload promotion images for better performance
          await ImageCacheManager.preloadPromotionImages(promotionsData);
        } else if (Array.isArray(promotionResponse)) {
          setPromotions(promotionResponse);
          console.log('Promotions set from direct array:', promotionResponse.length, 'items');
          // Preload promotion images for better performance
          await ImageCacheManager.preloadPromotionImages(promotionResponse);
        } else {
          console.error('Promotions data is not an array:', typeof promotionsData);
          setPromotions([]);
        }
      } else {
        console.error('Failed to fetch promotions - Status:', promotionResponse.statusCode, 'Message:', promotionResponse.message);
        setPromotions([]);
      }
    } catch (error: any) {
      console.error('GetPromotions error:', error);
      setPromotions([]);
    } finally {
      setPromotionsLoading(false);
    }
  };

  // Fetch credit limits from payment API
  const fetchCreditLimits = async () => {
    try {
      setCreditLimitsLoading(true);
      console.log("Fetching credit limits...");

      const response = await callMobileApi(
        'GetCrediLimits',
        {},
        'mobile-app-credit-limits',
        '',
        'payment'
      );

      console.log("GetCrediLimits response:", response);

      if (response.statusCode === 200) {
        setCreditLimits(response.data || response.payload);
        console.log("Credit limits loaded successfully");
      } else {
        console.error('Failed to fetch credit limits:', response.message);
      }
    } catch (error: any) {
      console.error('GetCrediLimits error:', error);
    } finally {
      setCreditLimitsLoading(false);
    }
  };

  // Fetch loan list from payment API
  const fetchLoanList = async () => {
    try {
      setLoanListLoading(true);
      console.log("Fetching loan list...");

      const response = await callMobileApi(
        'GetLoanList',
        {},
        'mobile-app-loan-list',
        '',
        'payment'
      );

      console.log("=== FULL GetLoanList RESPONSE ===");
      console.log(JSON.stringify(response, null, 2));
      console.log("=== END RESPONSE ===");

      if (response.statusCode === 200) {
        setLoanList(response.data);
        console.log("Loan list loaded successfully");
      } else {
        console.error('Failed to fetch loan list:', response.message);
      }
    } catch (error: any) {
      console.error('GetLoanList error:', error);
    } finally {
      setLoanListLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchCreditLimits();
    fetchLoanList();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPromotions();
      fetchCreditLimits();
      fetchLoanList();
    }, [])
  );

  // Handle hardware back button on HomeScreen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Show confirmation dialog when user tries to exit the app from home screen
        Alert.alert(
          t('dialogs.exitApp'),
          t('dialogs.exitAppMessage'),
          [
            {
              text: t('common.cancel'),
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: t('dialogs.exit'),
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return true; // Prevent default back action
      };

      // Add event listener for hardware back button
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Cleanup function
      return () => backHandler.remove();
    }, [t])
  );

  // Helper function to get latest active loan
  const getLatestActiveLoan = () => {
    if (!loanList?.activeLoans || loanList.activeLoans.length === 0) {
      return null;
    }

    interface ActiveLoan {
      createdOn: string;
      merchantName: string;
      totalAmount: number;
    }

    interface LoanListData {
      activeLoans: ActiveLoan[];
    }

    const sortedLoans: ActiveLoan[] = loanList.activeLoans.sort((a: ActiveLoan, b: ActiveLoan) =>
      new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    );

    return sortedLoans[0];
  };

  // Helper function to format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null) return '';
    return `Rs. ${amount.toFixed(2)}`;
  };

  interface Loan {
    createdOn: string;
    merchantName: string;
    totalAmount: number;
    // Add other loan properties as needed
  }

  const getNextPaymentDate = (loan: Loan | null): string => {
    if (!loan) return "";

    const createdDate = new Date(loan.createdOn);
    const nextPayment = new Date(createdDate);
    nextPayment.setMonth(nextPayment.getMonth() + 1);

    return nextPayment.toISOString().split('T')[0].replace(/-/g, '.');
  };

  // Helper function to calculate days left
  const getDaysLeft = (loan: Loan | null) => {
    if (!loan) return '';

    const nextPaymentDate = getNextPaymentDate(loan);
    if (!nextPaymentDate) return '';
    
    const targetDate = new Date(nextPaymentDate.replace(/\./g, '-'));
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? `${diffDays.toString().padStart(2, '0')} ${t('home.days')}` : t('home.overdue');
  };

  // Comprehensive refresh function for pull-to-refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      console.log('Refreshing home screen data...');
      
      // Reset slideshow to first slide
      setCurrentSlide(0);
      
      // Fetch all data simultaneously for better performance
      await Promise.all([
        fetchPromotions(),
        fetchCreditLimits(),
        fetchLoanList()
      ]);
      
      console.log('Home screen refresh completed successfully');
    } catch (error) {
      console.error('Error refreshing home screen:', error);
      Alert.alert(t('home.refreshFailed'), t('home.refreshFailedMessage'));
    } finally {
      setRefreshing(false);
    }
  };

  const latestLoan = getLatestActiveLoan();

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Top Section */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <Animated.View
          style={[
            styles.topSection,
            {
              borderBottomRightRadius: borderRadiusValue,
              backgroundColor: 'rgba(32, 34, 46, 1)', // Plain color instead of transparent
            }
          ]}
        >

          {/* Keep only the radiant overlay effect for the circle */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderBottomRightRadius: borderRadiusValue,
                backgroundColor: 'transparent',
                shadowColor: '#2DD4BF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: scrollY.interpolate({
                  inputRange: [0, HEADER_SCROLL_DISTANCE],
                  outputRange: [0, 0.3], // Reduced opacity for subtle effect
                  extrapolate: 'clamp',
                }),
                shadowRadius: scrollY.interpolate({
                  inputRange: [0, HEADER_SCROLL_DISTANCE],
                  outputRange: [0, 10], // Reduced radius
                  extrapolate: 'clamp',
                }),
                elevation: scrollY.interpolate({
                  inputRange: [0, HEADER_SCROLL_DISTANCE],
                  outputRange: [0, 5], // Reduced elevation
                  extrapolate: 'clamp',
                }),
              }
            ]}
          />

          <Animated.View style={[styles.creditSection, { opacity: creditSectionOpacity }]}>
            <View>
              <Text style={styles.label}>{t('home.yourCreditLimit')}</Text>
              <Text style={styles.value}>
                Rs. {creditLimits?.fullCredit
                  ? creditLimits.fullCredit.toFixed(2)
                  : '0.00'}
              </Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBar, {
                  width: (creditLimits?.fullCredit && creditLimits?.availablePurchaseLimit !== undefined)
                    ? `${Math.round((creditLimits.availablePurchaseLimit / creditLimits.fullCredit) * 100)}%`
                    : '0%'
                }]} />
              </View>
              <Text style={styles.highlightedLabel}>{t('home.youCanSpend')}</Text>
              <Text style={styles.highlightedValue}>
                Rs. {creditLimits?.availablePurchaseLimit
                  ? (creditLimits.availablePurchaseLimit).toFixed(2)
                  : '0.00'}
              </Text>
            </View>

            <Animated.View style={[styles.circleContainer, { transform: [{ scale: circleScale }] }]}>
              <Animated.View
                style={[
                  styles.circleOuter,
                  {
                    borderColor: (() => {
                      const percent = (creditLimits?.fullCredit && creditLimits?.totalConsumed !== undefined)
                        ? Math.round(((creditLimits.fullCredit - creditLimits.totalConsumed) / creditLimits.fullCredit) * 100)
                        : 100;

                      if (percent >= 0 && percent <= 25) return '#FF4D4D';
                      if (percent >= 26 && percent <= 50) return '#FFA500';
                      if (percent >= 51 && percent <= 75) return '#FFFF00';
                      if (percent >= 76 && percent <= 100) return '#0eeeb6ff';
                    })(),
                    shadowColor: scrollY.interpolate({
                      inputRange: [0, HEADER_SCROLL_DISTANCE],
                      outputRange: ['transparent', '#0eeeb6ff'],
                      extrapolate: 'clamp',
                    }),
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: scrollY.interpolate({
                      inputRange: [0, HEADER_SCROLL_DISTANCE],
                      outputRange: [0, 0.9],
                      extrapolate: 'clamp',
                    }),
                    shadowRadius: scrollY.interpolate({
                      inputRange: [0, HEADER_SCROLL_DISTANCE],
                      outputRange: [0, 15],
                      extrapolate: 'clamp',
                    }),
                    elevation: scrollY.interpolate({
                      inputRange: [0, HEADER_SCROLL_DISTANCE],
                      outputRange: [0, 10],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                {creditLimitsLoading ? (
                  <ActivityIndicator size="small" color="#15e0cbff" />
                ) : (
                  <>
                    <Text style={styles.circleText}>
                      {(creditLimits?.fullCredit && creditLimits?.totalConsumed !== undefined)
                        ? Math.round(((creditLimits.fullCredit - creditLimits.totalConsumed) / creditLimits.fullCredit) * 100)
                        : 0}
                      %
                    </Text>
                    <Text style={styles.circleSubText}>{t('home.available')}</Text>
                  </>
                )}
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={[styles.scrollContent]}
        contentContainerStyle={[{ paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2DD4BF', '#0eeeb6ff']} // Android colors
            tintColor={'#2DD4BF'} // iOS color
            title={t('home.pullToRefresh')}
            titleColor={'#666'}
            progressBackgroundColor={'#f0f0f0'}
          />
        }
      >
        {/* Auto Slideshow Banner - Show multiple promotions */}
        {promotions.length > 0 && (
          <View style={styles.bannerContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false} // Disable manual scrolling for auto slideshow
              contentOffset={{ x: currentSlide * (screenWidth - 30), y: 0 }} 
              style={styles.slideshowContainer}
            >
              {promotions.map((promo, index) => (
                <View key={promo.promotionId || index} style={[styles.slideItem, { width: screenWidth - 30 }]}>
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
                </View>
              ))}
            </ScrollView>
            
            {/* Slide Indicators */}
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
        
        {/* Payment Notification - Only show if there's an active loan with all required data */}
        {(latestLoan && latestLoan.merchantName && latestLoan.totalAmount && getNextPaymentDate(latestLoan)) && (
          <View style={styles.cardsContainer}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>{t('home.paymentNotification')}</Text>
            </View>

            <View style={styles.paymentBox}>
              {/* Next Payment as header inside the box */}
              <Text style={styles.nextPaymentHeader}>{t('home.nextPayment')}</Text>

              {/* Main payment content */}
              <View style={styles.paymentContent}>
                <View style={styles.leftSection}>
                  <Text style={styles.paymentDescription}>
                    {latestLoan.merchantName}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(latestLoan.totalAmount)}
                  </Text>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.paymentDate}>
                    {getNextPaymentDate(latestLoan)}
                  </Text>
                  <Text style={styles.daysRemaining}>
                    {getDaysLeft(latestLoan)}
                  </Text>
                </View>
              </View>

              {loanListLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#666" />
                  <Text style={styles.loadingText}>{t('home.loadingLoanData')}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Promotions */}
        <View style={styles.sectionSecond}>
          <Text style={styles.sectionTitle}>{t('home.offersPromotions')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promoScrollView}
            contentContainerStyle={styles.promoScrollContent}
          >
            {promotions.length > 0 ? promotions.map((promo) => (
              <TouchableOpacity key={promo.promotionId} style={styles.promoCard}>
                {promo.promotionImageLink && (
                  <OptimizedImage
                    source={{ uri: promo.promotionImageLink }}
                    style={styles.promoImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="normal"
                    showLoadingIndicator={true}
                    fallbackIcon="megaphone-outline"
                    fallbackText="Promotion"
                  />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.8)']}
                  locations={[0, 0.5, 1]}
                  style={styles.promoOverlay}
                >
                  <Text style={styles.promoText}>{promo.promotionName}</Text>
                  <Text style={styles.promoBold}>{promo.discount}% OFF</Text>
                </LinearGradient>
              </TouchableOpacity>
            )) : (
              <View style={styles.noPromotionsContainer}>
                <Text style={styles.noPromotionsText}>{t('home.noPromotionsAvailable')}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Special Deals */}
        <View style={styles.sectionSecond}>
          <Text style={styles.sectionTitle}>{t('home.specialDeals')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promoScrollView}
            contentContainerStyle={styles.promoScrollContent}
          >
            {/* {promotions.length > 0 ? promotions.map((promo) => (
              <TouchableOpacity key={`special-${promo.promotionId}`} style={[styles.promoCard, styles.specialDealCard]}>
                {promo.promotionImageLink && (
                  <OptimizedImage
                    source={{ uri: promo.promotionImageLink }}
                    style={styles.promoImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    priority="normal"
                    showLoadingIndicator={true}
                    fallbackIcon="pricetag-outline"
                    fallbackText="Special Deal"
                  />
                )} */}
                {/* <LinearGradient
                  colors={['transparent', 'rgba(139, 69, 19, 0.2)', 'rgba(139, 69, 19, 0.9)']} // Different gradient for special deals
                  locations={[0, 0.5, 1]}
                  style={styles.promoOverlay}
                >
                  <Text style={styles.promoText}>{promo.promotionName}</Text>
                  <Text style={[styles.promoBold, styles.specialDealBold]}>{promo.discount}% OFF</Text>
                  <Text style={styles.specialDealLabel}>SPECIAL</Text>
                </LinearGradient> */}
              {/* </TouchableOpacity>
            )) : (
              <View style={styles.noPromotionsContainer}>
                <Text style={styles.noPromotionsText}>{t('home.noSpecialDealsAvailable')}</Text>
              </View>
            )} */}
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

/// Updated styles for HomeScreen to match ProfileScreen theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  scrollContent: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#fff', // Match ProfileScreen background
  },

  topSection: {
    flex: 1,
    paddingHorizontal: 25,
    paddingBottom: 15,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-start',
  },
  creditSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },

  // Updated banner to match card style
  bannerContainer: {
    marginHorizontal: 15,
    marginTop: 150,
    marginBottom: 15,
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
    height: 120, 
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // Updated payment notification card
  cardsContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  // Updated section styling
  section: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 140,
  },
  sectionSecond: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginBottom: 5,
  },

  // Updated payment box
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },

  buttonHeader: {
    paddingTop: 8, // Reduced from 10
    alignItems: 'flex-end',
  },

  paymentBox: {
    borderRadius: 12,
    padding: 12, // Reduced from 15
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  // Reduced header style inside the payment box
  nextPaymentHeader: {
    fontSize: 14, // Reduced from 15
    color: '#333',
    fontWeight: '500',
    marginBottom: 8, // Reduced from 10
  },

  // Container for the main payment content (Fashion Bug and date/days)
  paymentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flex: 1,
  },

  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },

  paymentDescription: {
    fontSize: 13, // Reduced from 14
    color: '#666',
    fontWeight: '400',
    marginBottom: 2, // Reduced from 4
  },

  paymentAmount: {
    fontSize: 16, // Reduced from 17
    color: '#333',
    fontWeight: '600',
  },

  paymentDate: {
    fontSize: 11, // Reduced from 12
    color: '#666',
    fontWeight: '400',
    marginBottom: 2, // Reduced from 4
    textAlign: 'right',
  },

  daysRemaining: {
    fontSize: 20, // Reduced from 24
    color: '#333',
    fontWeight: '700',
    textAlign: 'right',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // Reduced from 10
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  // Updated promotions styling - Made smaller
  promoScrollView: {
    marginHorizontal: -15,
  },
  promoScrollContent: {
    paddingHorizontal: 15,
    paddingRight: 30,
  },
  promoCard: {
    width: 140,  // Reduced from 150
    height: 160, // Reduced from 180
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginRight: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  promoImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Increased to cover more area for better gradient effect
    justifyContent: "center",
    alignItems: "center",
    padding: 6, // Reduced from 8
  },
  promoText: {
    fontSize: 11, // Reduced from 12
    color: "#fff",
    textAlign: 'center',
    fontWeight: '500',
  },
  promoBold: {
    fontSize: 16, // Reduced from 18
    fontWeight: "700",
    color: "#fff",
    marginVertical: 3, // Reduced from 4
  },
  noPromotionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginHorizontal: 15,
  },
  noPromotionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Keep existing header styles unchanged
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: { color: '#fff', fontSize: 16 },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginLeft: 15 },
  planButton: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  planText: { color: '#fff' },
  logo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: { color: '#ccc', fontSize: 11 },
  value: { color: '#fff', fontSize: 16, fontWeight: '500' },
  highlightedLabel: { color: '#ccc', fontSize: 13, fontWeight: '500' },
  highlightedValue: { color: '#fff', fontSize: 23, fontWeight: 'bold', marginTop: 2 },
  progressBarBackground: {
    width: 150,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 4,
    marginVertical: 10
  },
  progressBar: {
    height: 1,
    backgroundColor: '#fff',
    borderRadius: 4
  },
  circleContainer: { alignItems: 'center' },
  circleOuter: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: '#0eeeb6ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  circleSubText: { fontSize: 10, color: 'white' },

  // Navigation styles
  navButton: { alignItems: 'center', justifyContent: 'center' },
  navButtonActive: { padding: 8, borderRadius: 10 },
  navLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  navLabelActive: { color: '#090B1A', fontWeight: 'bold' },
});

// Add these additional styles
const additionalStyles = StyleSheet.create({
  specialDealCard: {
    borderWidth: 2,
    borderColor: '#FFD700', // Gold border for special deals
  },
  specialDealBold: {
    color: '#FFD700', // Gold text for special deals
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  specialDealLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});