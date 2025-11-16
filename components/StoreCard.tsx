import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StoreCardProps {
  // Content
  image: ImageSourcePropType;
  storeName: string;
  storepType?: string; // e.g., "Website | Instore"
  storeType?: string; // Fixed: changed from boolean to string
  discount?: string; // e.g., "Upto 50% off"

  
  // Interaction
  onPress?: () => void;
  
  // Appearance
  width?: number;
  height?: number;
  borderRadius?: number;
  showDiscount?: boolean;
  showstorepType?: boolean;
  
  // Customization
  discountBackgroundColor?: string;
  discountTextColor?: string;
  storeTypeBackgroundColor?: string;
  storeTypeTextColor?: string;
}

const StoreCard: React.FC<StoreCardProps> = ({
  image,
  storeName,
  storepType = 'Website | Instore',
  storeType = 'Fashion & Accessories',
  discount = 'Upto 50% off',
  onPress,
  width = 200,
  height = 280,
  borderRadius = 16,
  showDiscount = true,
  showstorepType = true,
  discountBackgroundColor = '#106128ff',
  discountTextColor = '#FFFFFF',
  storeTypeBackgroundColor = '#FFFFFF',
  storeTypeTextColor = '#000000'
}) => {
  const content = (
    <View style={[styles.card, { width, height, borderRadius }]}>
      {/* Product Image */}
      <Image
        source={image}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Discount Badge */}
      {showDiscount && discount && (
        <View
          style={[
            styles.discountBadge,
            { backgroundColor: discountBackgroundColor },
          ]}
        >
          <Text style={[styles.discountText, { color: discountTextColor }]}>
            {discount}
          </Text>
        </View>
      )}

      {/* StoreType Badge */}
      {showstorepType && storepType && (
        <View
          style={[
            styles.storeTypeBadge,
            { backgroundColor: storeTypeBackgroundColor },
          ]}
        >
          <Icon name="shopping-bag" size={14} color={storeTypeTextColor} style={styles.storeTypeIcon} />
          <Text style={[styles.storeTypeText, { color: storeTypeTextColor }]}>
            {storepType}
          </Text>
        </View>
      )}
      
      {/* Store Info Footer */}
      <View style={styles.footer}>
        <View style={styles.storeInfo}>
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName} numberOfLines={1}>
              {storeName}
            </Text>
            <Icon name="favorite-border" size={20} color="#232425ff" />
          </View>
          <Text style={styles.storeType} numberOfLines={1}>
            {storeType}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#dbd6d6ff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  image: {
    width: '100%',
    height: '75%', // Changed: limits image height to show footer properly
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,  
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#0f570dff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  storeTypeBadge: {
    position: 'absolute',
    top: 130,
    left: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center', // Added: centers icon and text vertically
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  storeTypeIcon: {
    marginRight: 4,
  },
  storeTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#dbd6d6ff', // Changed back to white
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  storeInfo: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  storeType: {
    fontSize: 12,
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
});

export default StoreCard;
