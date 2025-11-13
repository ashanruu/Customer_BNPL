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

// Stores content component
export const StoresContent: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Health & Beauty');

  const categories = [
    { id: '1', name: 'Health & Beauty', icon: 'heart' },
    { id: '2', name: 'Men', icon: 'account' },
    { id: '3', name: 'Women', icon: 'account-outline' },
    { id: '4', name: 'Electronic', icon: 'laptop' },
  ];

  const featuredStores = [
    {
      id: '1',
      name: 'Adidas',
      type: 'Fashion & Accessories',
      discount: 'Upto 50% off',
      image: { uri: 'https://via.placeholder.com/300x400' },
    },
    {
      id: '2',
      name: 'Baylee',
      type: 'Fashion & Accessories',
      discount: 'Upto 50% off',
      image: { uri: 'https://via.placeholder.com/300x400' },
    },
    {
      id: '3',
      name: 'KFC',
      type: 'Foods',
      discount: 'Upto 50% off',
      image: { uri: 'https://via.placeholder.com/300x400' },
    },
  ];

  const allStores = [
    {
      id: '1',
      name: 'Adidas',
      type: 'Fashion & Accessories',
      discount: 'Save more every day',
      image: { uri: 'https://via.placeholder.com/300x400' },
    },
    {
      id: '2',
      name: 'Baylee',
      type: 'Fashion & Accessories',
      discount: null,
      image: { uri: 'https://via.placeholder.com/300x400' },
    },
    {
      id: '3',
      name: 'Adidas',
      type: 'Fashion & Accessories',
      discount: null,
      image: { uri: 'https://via.placeholder.com/300x400' },
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
          <Icon name="magnify" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Find your fav store or product here"
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
              onPress={() => setActiveCategory(category.name)}
            >
              <Icon
                name={category.icon}
                size={20}
                color={activeCategory === category.name ? '#FFFFFF' : '#666666'}
              />
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
              width={160}
              height={220}
              onPress={() => console.log('Store pressed:', store.name)}
            />
          ))}
        </ScrollView>

        {/* All Stores Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Stores</Text>
        </View>

        <View style={styles.allStoresGrid}>
          {allStores.map((store, index) => (
            <View key={store.id + index} style={styles.gridItem}>
              <StoreCard
                image={store.image}
                storeName={store.name}
                storeType={store.type}
                discount={store.discount || undefined}
                width={(styles.gridItem.width as number)}
                height={220}
                showDiscount={!!store.discount}
                onPress={() => console.log('Store pressed:', store.name)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// For backward compatibility with navigation
const StoresSectionScreen = StoresContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    width: (Platform.OS === 'web' ? 300 : require('react-native').Dimensions.get('window').width - 52) / 2,
  },
});

export default StoresSectionScreen;
