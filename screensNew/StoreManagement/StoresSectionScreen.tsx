import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StoreCard from '../../components/StoreCard';
import { useNavigation } from '@react-navigation/native';

// Stores content component
export const StoresContent: React.FC = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Health & Beauty');

  const categories = [
    { id: '1', name: 'Health & Beauty' },
    { id: '2', name: 'Men' },
    { id: '3', name: 'Women' },
    { id: '4', name: 'Electronic' },
  ];

  const featuredStores = [
    {
      id: '1',
      name: 'Adidas',
      type: 'Fashion & Accessories',
      discount: 'Upto 50% off',
      storepType: 'Website | Instore',       
      image: require('../../assets/images/temp/adidas.jpg'),
      websiteUrl: 'https://www.adidas.com/us',
      socialMediaUrl: 'https://www.facebook.com/adidasSL',
      locations: [
        '50 Galle Rd, Colombo 00600',
        '40 D. S. Senanayake MW, Colombo 00800',
        'No. 152 High Level Rd, Nugegoda 10250',
      ],
    },
    {
      id: '2',
      name: 'Baylee',
      type: 'Fashion & Accessories',
      discount: 'Upto 50% off',
      storepType: 'Website | Instore',    
      image: require('../../assets/images/temp/baylee.jpg'),
      websiteUrl: 'https://bayleee.com/shop/dresses/?utm_source=google&utm_medium=cpc&utm_campaign=Sales-PMAX&utm_content=&utm_term=&utm_adgroup=&device=c&placement=&gad_source=1&gad_campaignid=23008147634&gbraid=0AAAAABL2e6bdcIz8VRojTk9sDCJ9Wj87O&gclid=Cj0KCQiA5uDIBhDAARIsAOxj0CHA1rAbz51eyjTtr27kZHrImI7tamSa_53rE3axDxIawPb6fqffuh8aAsgtEALw_wcB',
      socialMediaUrl: 'https://www.instagram.com/bayleee/',
      locations: [
        'No. 152 High Level Rd, Nugegoda 10250',
        '25 Main Street, Colombo 00700',
        '15 Kandy Road, Kadawatha',
      ],
    },
    {
      id: '3',
      name: 'KFC',
      type: 'Foods',
      discount: 'Upto 50% off',
      storepType: 'Website | Instore',    
      image: require('../../assets/images/temp/xxx.jpg'),
      websiteUrl: 'https://kfc.lk',
      socialMediaUrl: 'https://www.facebook.com/KFCSriLanka',
      locations: [
        '100 Galle Road, Colombo 00300',
        '15 Kandy Road, Kadawatha',
        '200 Main Street, Dehiwala 10350',
      ],
    },
  ];

  const allStores = [
    {
      id: '1',
      name: 'Keels',
      type: null,
      discount: null,
      storepType: 'Website | Instore',    
      image: require('../../assets/images/temp/keels.jpg'),
      websiteUrl: 'https://keells.com',
      socialMediaUrl: 'https://www.facebook.com/Keells',
      locations: [
        '50 Galle Rd, Colombo 00600',
        '40 D. S. Senanayake MW, Colombo 00800',
        'No. 152 High Level Rd, Nugegoda 10250',
      ],
    },
    {
      id: '2',
      name: 'Nolimit',
      type: null,
      discount: null,
      storepType: null,    
      image: require('../../assets/images/temp/keels.jpg'),
      websiteUrl: 'https://www.nolimit.lk/?gad_source=1&gad_campaignid=21398852630&gbraid=0AAAAADGmAxqigwp0_fS_7vIBKh7dal6AR&gclid=Cj0KCQiA5uDIBhDAARIsAOxj0CFCBFNGmMJDX4rKFd_AH194J8-XIGtG9OUzdjmtMEhxctkm5dC1xD8aAn9-EALw_wcB',
      socialMediaUrl: 'https://www.instagram.com/nolimit.official/',
      locations: [
        'No. 152 High Level Rd, Nugegoda 10250',
        '25 Kandy Road, Kadawatha',
        '200 Main Street, Dehiwala 10350',
      ],
    },
    {
      id: '3',
      name: 'Adidas',
      type: null,
      discount: null,
      storepType: null,    
      image: require('../../assets/images/temp/keels.jpg'),
      websiteUrl: 'https://adidas.com',
      socialMediaUrl: 'https://www.facebook.com/adidasSL',
      locations: [
        '50 Galle Rd, Colombo 00600',
        '40 D. S. Senanayake MW, Colombo 00800',
        'No. 152 High Level Rd, Nugegoda 10250',
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stores</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="black" />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your fav store here"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryBadge,
                activeCategory === category.name && styles.categoryBadgeActive,
              ]}
              onPress={() => {
                setActiveCategory(category.name);
                (navigation.navigate as any)('SelectedStoreScreen');
              }}
            >
            
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category.name && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Stores</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredStoresRow}
        >
          {featuredStores.map((store) => (
            <StoreCard
              key={store.id}
              image={store.image}
              storeName={store.name}
              storeType={store.type}
              discount={store.discount}
              storepType={store.storepType || undefined}
              width={(Platform.OS === 'web' ? 160 : require('react-native').Dimensions.get('window').width - 52) / 2}
              height={240}
              onPress={() => (navigation.navigate as any)('ShoppingSelectedScreen', { store })}
            />
          ))}
        </ScrollView>

        {/* All Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Stores</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredStoresRow}
        >

        <View style={styles.allStoresGrid}>
          {allStores.map((store, index) => (
            <View key={store.id + index} style={styles.gridItem}>
              <StoreCard
                image={store.image}
                storeName={store.name}
                //storeType={store.type}
                discount={store.discount || undefined}
                //storepType={store.storepType || undefined}
                width={(styles.gridItem.width as number)}
                height={240}
                showDiscount={!!store.discount}
                onPress={() => (navigation.navigate as any)('ShoppingSelectedScreen', { store })}
              />
            </View>
          ))}
        </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

// For backward compatibility with navigation
const StoresSectionScreen = StoresContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    //fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: '#e4eaf1ff',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '400',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    
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
  featuredStoresRow: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  allStoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 90,
    gap: 12,
  },
  gridItem: {
    width: (Platform.OS === 'web' ? 160 : require('react-native').Dimensions.get('window').width - 52) / 2,
  },
});

export default StoresSectionScreen;
