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
import { useNavigation } from '@react-navigation/native';
import CircularStoreIcon from '../../components/CircularStoreIcon';

const SelectedStoreScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('Health & Beauty');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: '1', name: 'Health & Beauty' },
    { id: '2', name: 'Men' },
    { id: '3', name: 'Women' },
    { id: '4', name: 'Electronic' },
  ];

  const suggestedStores = [
    {
      id: '1',
      name: 'Nolimit',
      image: require('../../assets/images/temp/adidas.jpg'),
      type: 'Fashion & Accessories',
      discount: 'Upto 30% off',
      storepType: 'Website | Instore',
      websiteUrl: 'https://nolimit.com',
      socialMediaUrl: 'https://www.instagram.com/nolimit.official/',
      locations: [
        'No. 152 High Level Rd, Nugegoda 10250',
        '50 Galle Rd, Colombo 00600',
      ],
    },
    {
      id: '2',
      name: 'Fashion Bug',
      image: require('../../assets/images/temp/baylee.jpg'),
      type: 'Fashion & Accessories',
      discount: 'Upto 40% off',
      storepType: 'Website | Instore',
      websiteUrl: 'https://fashionbug.lk',
      socialMediaUrl: 'https://www.facebook.com/FashionBugSriLanka',
      locations: [
        '100 Main Street, Colombo 00700',
        '25 Kandy Road, Kadawatha',
      ],
    },
    {
      id: '3',
      name: 'Carrage',
      image: require('../../assets/images/temp/keels.jpg'),
      type: 'Fashion & Accessories',
      discount: 'Upto 25% off',
      storepType: 'Website | Instore',
      websiteUrl: 'https://carrage.com',
      socialMediaUrl: 'https://www.instagram.com/carrage.lk/',
      locations: [
        '40 D. S. Senanayake MW, Colombo 00800',
      ],
    },
    {
      id: '4',
      name: 'Barista',
      image: require('../../assets/images/temp/keels.jpg'),
      type: 'Foods & Beverages',
      discount: null,
      storepType: 'Instore',
      websiteUrl: null,
      socialMediaUrl: 'https://www.facebook.com/BaristaSL',
      locations: [
        '15 Liberty Plaza, Colombo 00300',
        '50 Galle Rd, Colombo 00600',
      ],
    },
    {
      id: '5',
      name: 'Arpico',
      image: require('../../assets/images/temp/adidas.jpg'),
      type: 'Department Store',
      discount: 'Upto 20% off',
      storepType: 'Website | Instore',
      websiteUrl: 'https://arpico.com',
      socialMediaUrl: 'https://www.facebook.com/ArpicoSupercentre',
      locations: [
        '125 Main Street, Colombo 00700',
        'No. 152 High Level Rd, Nugegoda 10250',
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar with Close Button */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Find your fav store here"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
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
              onPress={() => setActiveCategory(category.name)}
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

        {/* Suggested Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested stores</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedStoresRow}
        >
          {suggestedStores.map((store) => (
            <CircularStoreIcon
              key={store.id}
              image={store.image}
              storeName={store.name}
              onPress={() => (navigation.navigate as any)('ShoppingSelectedScreen', { store })}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
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
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
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
    paddingVertical: 16,
    gap: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
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
  suggestedStoresRow: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 4,
  },
});

export default SelectedStoreScreen;
