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

interface StoreCardProps {
  // Content
  image: ImageSourcePropType;
  storeName: string;
  storeType?: string; // e.g., "Website | Instore"
  discount?: string; // e.g., "Upto 50% off"
  
  // Interaction
  onPress?: () => void;
  
  // Appearance
  width?: number;
  height?: number;
  borderRadius?: number;
  showDiscount?: boolean;
  
  // Customization
  discountBackgroundColor?: string;
  discountTextColor?: string;
}

const StoreCard: React.FC<StoreCardProps> = ({
  image,
  storeName,
  storeType = 'Website | Instore',
  discount = 'Upto 50% off',
  onPress,
  width = 200,
  height = 280,
  borderRadius = 16,
  showDiscount = true,
  discountBackgroundColor = '#0066CC',
  discountTextColor = '#FFFFFF',
}) => {
  const content = (
    <View style={[styles.card, { width, height, borderRadius }]}>
      {/* Product Image */}
      <Image
        source={image}
        style={[styles.image, { borderRadius }]}
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
      
      {/* Store Info Footer */}
      <View style={styles.footer}>
        <View style={styles.iconContainer}>
          <View style={styles.storeIcon} />
        </View>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName} numberOfLines={1}>
            {storeName}
          </Text>
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
    backgroundColor: '#FFFFFF',
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
    height: '100%',
    position: 'absolute',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  storeIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6B7280',
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
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
  storeType: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
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
});

export default StoreCard;
