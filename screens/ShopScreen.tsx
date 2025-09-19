import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { callMerchantApi } from '../scripts/api';

// NavButton Component
interface NavButtonProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon as any} size={22} color={active ? 'black' : '#999'} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const categories = ['Health & Beauty', 'Electronic', 'Women', 'Men'];

const ShopScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('ShopScreen');

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      console.log("Fetching promotions...");
      
      const response = await callMerchantApi(
        'GetPromotions',
        '',
        'string'
      );

      console.log("GetPromotions response:", response);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  return (
    <View style={styles.container}>
       {/* Search */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Find your favourite Shop"
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
            <Ionicons name="search-outline" size={20} color="#999" />
          </View>
        </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
             

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton}>
              <Text style={styles.categoryText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <Image
          source={require('../assets/images/banner.png')}
          style={styles.bannerImage}
          resizeMode="cover"
        />

        {/* Featured */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Featured</Text>
          </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
          <View style={styles.shopCard}>
            <Image source={require('../assets/images/fashionbug.png')} style={styles.shopImage} />
            <Text style={styles.shopName}>Fashion Bug</Text>
          </View>
          <View style={styles.shopCard}>
            <Image source={require('../assets/images/fashionbug3.png')} style={styles.shopImage} />
            <Text style={styles.shopName}>ODEL</Text>
          </View>
          <View style={styles.shopCard}>
            <Image source={require('../assets/images/fashionbug2.png')} style={styles.shopImage} />
            <Text style={styles.shopName}>Carnage</Text>
          </View>
        </ScrollView>

        {/* New Arrivals */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCards}>
          <View style={styles.shopCard}>
            <Image source={require('../assets/images/fashionbug4.png')} style={styles.shopImage} />
          </View>
          <View style={styles.shopCard}>
            <Image source={require('../assets/images/fashionbug6.png')} style={styles.shopImage} />
          </View>
          <View style={styles.shopCard}>
            <Image source={require('../assets/images/fashionbug5.png')} style={styles.shopImage} />
          </View>
        </ScrollView>
      </ScrollView>
   </View>
  );
};

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  topSection: {
    paddingTop: 10,
    paddingHorizontal: 25,
    paddingBottom: 30,
    borderBottomRightRadius: 80,
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 15,
  },
  planButton: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  planText: {
    color: '#fff',
  },
  logo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 20,
  },
  creditSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    width: 150,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 4,
    marginVertical: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: '#eee',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  categoryScroll: {
    marginVertical: 12,
    paddingLeft: 16,
  },
  categoryButton: {
    backgroundColor: '#090B1A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  bannerImage: {
    width: '92%',
    height: 100,
    alignSelf: 'center',
    borderRadius: 12,
    marginVertical: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingTop: 20
  },
  sectionLink: {
    fontSize: 13,
    color: '#4B267C',
    paddingTop: 20
  },
  horizontalCards: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  shopCard: {
    marginRight: 12,
    width: 120,
  },
  shopImage: {
    width: 120,
    height: 140,
    borderRadius: 10,
  },
  shopName: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'white',
    position: 'absolute',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  navTextActive: {
    color: '#090B1A',
    fontWeight: 'bold',
  },
});
