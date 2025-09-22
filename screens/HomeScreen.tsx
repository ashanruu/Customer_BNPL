import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { callMobileApi, callMerchantApi } from '../scripts/api';

function NavButton({ label, icon, active, onPress }) {
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
  const [activeTab, setActiveTab] = useState('home');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [creditLimits, setCreditLimits] = useState<any>(null);
  const [loanList, setLoanList] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [promotionsLoading, setPromotionsLoading] = useState(false);
  const [creditLimitsLoading, setCreditLimitsLoading] = useState(false);
  const [loanListLoading, setLoanListLoading] = useState(false);
  const navigation = useNavigation();

  // Animation values for collapsible header
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = 140;
  const HEADER_MIN_HEIGHT = 0;
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
        } else if (Array.isArray(promotionResponse)) {
          setPromotions(promotionResponse);
          console.log('Promotions set from direct array:', promotionResponse.length, 'items');
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

  // Helper function to get latest active loan
  const getLatestActiveLoan = () => {
    if (!loanList?.activeLoans || loanList.activeLoans.length === 0) {
      return null;
    }
    
    // Sort by createdOn date and get the latest
    const sortedLoans = loanList.activeLoans.sort((a, b) => 
      new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
    );
    
    return sortedLoans[0];
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `Rs. ${amount?.toLocaleString() || '0'}`;
  };

  // Helper function to calculate next payment date (dummy calculation)
  const getNextPaymentDate = (loan) => {
    if (!loan) return '2025.08.02';
    
    const createdDate = new Date(loan.createdOn);
    const nextPayment = new Date(createdDate);
    nextPayment.setMonth(nextPayment.getMonth() + 1);
    
    return nextPayment.toISOString().split('T')[0].replace(/-/g, '.');
  };

  // Helper function to calculate days left
  const getDaysLeft = (loan) => {
    if (!loan) return '05 Days';
    
    const nextPaymentDate = getNextPaymentDate(loan);
    const targetDate = new Date(nextPaymentDate.replace(/\./g, '-'));
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays.toString().padStart(2, '0')} Days` : 'Overdue';
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
              <Text style={styles.label}>Your Credit Limit</Text>
              <Text style={styles.value}>
                Rs. {creditLimits?.fullCredit 
                  ? creditLimits.fullCredit.toLocaleString() 
                  : '0'}
              </Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBar, { 
                  width: (creditLimits?.fullCredit && creditLimits?.totalConsumed !== undefined)
                    ? `${Math.round(((creditLimits.fullCredit - creditLimits.totalConsumed) / creditLimits.fullCredit) * 100)}%` 
                    : '0%' 
                }]} />
              </View>
              <Text style={styles.label}>You Can Spend</Text>
              <Text style={styles.value}>
                Rs. {creditLimits?.fullCredit && creditLimits?.totalConsumed !== undefined
                  ? (creditLimits.fullCredit - creditLimits.totalConsumed).toLocaleString() 
                  : '0'}
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
                        : "100"}
                      %
                    </Text>
                    <Text style={styles.circleSubText}>Available</Text>
                  </>
                )}
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={[styles.scrollContent, { marginTop: headerHeight }]}
        contentContainerStyle={[{ paddingTop: HEADER_MAX_HEIGHT, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Promo Banner - Show latest promotion with text overlay */}
        {promotions.length > 0 && promotions[0].promotionImageLink && (
          <View style={styles.bannerContainer}>
            <Image
              source={
                typeof promotions[0].promotionImageLink === 'string' && promotions[0].promotionImageLink.startsWith('data:image')
                  ? { uri: promotions[0].promotionImageLink }
                  : typeof promotions[0].promotionImageLink === 'string'
                  ? { uri: promotions[0].promotionImageLink }
                  : promotions[0].promotionImageLink
              }
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>{promotions[0].promotionName || 'Special Offer'}</Text>
              <Text style={styles.bannerDiscount}>{promotions[0].discount || 0}% OFF</Text>
              <Text style={styles.bannerDescription}>{promotions[0].description || 'Limited time offer'}</Text>
            </View>
          </View>
        )}

        {/* Payment Notification */}
        <View style={styles.cardsContainer1}>
          <View style={styles.cardBox}>
            <Text style={styles.sectionTitle}>Payment Notification</Text>
            <View style={styles.paymentBox}>
              <View>
                <Text style={styles.paymentText}>Next Payment</Text>
                <Text style={styles.paymentText}>
                  {latestLoan 
                    ? `Loan #${latestLoan.loanId} (${latestLoan.noOfInstallments} installments)` 
                    : 'No active loans'
                  }
                </Text>
                {latestLoan && (
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(latestLoan.totLoanValue / latestLoan.noOfInstallments)}
                  </Text>
                )}
              </View>
              <View style={styles.rightBox}>
                <Text style={styles.dueDate}>
                  {latestLoan ? getNextPaymentDate(latestLoan) : '2025.08.02'}
                </Text>
                <Text style={[
                  styles.daysLeft,
                  { color: latestLoan && getDaysLeft(latestLoan) === 'Overdue' ? '#FF0000' : '#FF6B35' }
                ]}>
                  {latestLoan ? getDaysLeft(latestLoan) : '05 Days'}
                </Text>
                {latestLoan && (
                  <Text style={styles.loanStatus}>
                    {latestLoan.loanStatus}
                  </Text>
                )}
              </View>
            </View>
            {loanListLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#20222e" />
                <Text style={styles.loadingText}>Loading loan data...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers & Promotions</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.promoScrollView}
            contentContainerStyle={styles.promoScrollContent}
          >
            {promotions.length > 0 ? promotions.map((promo) => (
              <TouchableOpacity key={promo.promotionId} style={styles.promoCard}>
                {promo.promotionImageLink && typeof promo.promotionImageLink === 'string' && promo.promotionImageLink.startsWith('data:image') ? (
                  <Image 
                    source={{ uri: promo.promotionImageLink }} 
                    style={styles.promoImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <Image 
                    source={typeof promo.promotionImageLink === 'string' ? { uri: promo.promotionImageLink } : promo.promotionImageLink} 
                    style={styles.promoImage} 
                    resizeMode="cover" 
                  />
                )}
                <View style={styles.promoOverlay}>
                  <Text style={styles.promoText}>{promo.promotionName}</Text>
                  <Text style={styles.promoBold}>{promo.discount}% OFF</Text>
                  <Text style={styles.promoText}>{promo.description}</Text>
                </View>
              </TouchableOpacity>
            )) : (
              <View style={styles.noPromotionsContainer}>
                <Text style={styles.noPromotionsText}>No promotions available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
    marginTop: 200, // Initial margin to account for header
  },
  topSection: {
    flex: 1,
    paddingTop: 10, // Reduced from 20
    paddingHorizontal: 25,
    paddingBottom: 15, // Reduced from 30
    borderBottomRightRadius: 20,
    justifyContent: 'flex-start', // Changed from 'space-between' to pack content at top
  },
  creditSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Changed from 'center' to align at top
    flex: 1,
    marginTop: 10, // Add small margin from top
  },
bannerContainer: {
  width: '92%',
  height: 100,
  alignSelf: 'center',
  borderRadius: 12,
  marginVertical: 5, // Reduced from 10
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
  label: { color: '#ccc', fontSize: 10 },
  value: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  progressBarBackground: {
    width: 150,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 4,
    marginVertical: 10
  },
  progressBar: {
    height: 3,
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
  cardsContainer1: { marginTop: 15, paddingHorizontal: 20 },
  cardBox: { 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 15, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  section: { 
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  paymentBox: { 
    backgroundColor: '#f1f1f1', 
    borderRadius: 12, 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  paymentText: { fontSize: 14 },
  rightBox: { alignItems: 'flex-end' },
  dueDate: { fontSize: 16, fontWeight: 'bold', marginTop: 1 },
  daysLeft: { fontSize: 12, color: 'red' },
  promoScrollView: {
    marginHorizontal: -20, // Negative margin to allow full-width scrolling
  },
  promoScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding on the right
  },
  promoCard: {
    width: 140,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  promoOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.47)",
    padding: 6,
  },
  promoText: {
    fontSize: 12,
    color: "#fff",
  },
  promoBold: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginVertical: 2,
  },
  navButton: { alignItems: 'center', justifyContent: 'center' },
  navButtonActive: { padding: 8, borderRadius: 10 },
  navLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  navLabelActive: { color: '#090B1A', fontWeight: 'bold' },
  noPromotionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  noPromotionsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  paymentAmount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loanStatus: {
    fontSize: 10,
    color: '#4CAF50',
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
});