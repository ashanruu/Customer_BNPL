import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface StoreAction {
  id: string;
  label: string;
  type: 'shop' | 'view';
  onPress: () => void;
}

interface StoreDetailCardProps {
  // Store info
  storeLogo: ImageSourcePropType;
  storeName: string;
  backgroundImage?: ImageSourcePropType;
  discountText?: string;
  websiteUrl?: string;
  
  // Actions
  actions: StoreAction[];
  
  // Favorite functionality
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

const StoreDetailCard: React.FC<StoreDetailCardProps> = ({
  storeLogo,
  storeName,
  backgroundImage,
  discountText,
  websiteUrl,
  actions,
  isFavorite = false,
  onFavoritePress,
}) => {
  return (
    <View style={styles.container}>
      {/* Background Image Section */}
      <View style={styles.headerSection}>
        {backgroundImage ? (
          <Image source={backgroundImage} style={styles.backgroundImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderBackground} />
        )}
        
        {/* Discount Badge */}
        {discountText && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountText}</Text>
          </View>
        )}

        {/* Website Badge */}
        {websiteUrl && (
          <View style={styles.websiteBadge}>
            <Icon name="shopping-bag" size={14} color="#222020ff" />
            <Text style={styles.websiteText}>Website | Instore</Text>
          </View>
        )}
      </View>

      {/* Store Info Section */}
      <View style={styles.infoSection}>
        {/* Store Logo and Name */}
        <View style={styles.storeInfoRow}>
          <View style={styles.logoContainer}>
            <Image source={storeLogo} style={styles.storeLogo} resizeMode="contain" />
          </View>
          <Text style={styles.storeName}>{storeName}</Text>
          
          {/* Favorite Icon */}
          {onFavoritePress && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={onFavoritePress}
            >
             <Icon name="favorite-border" size={20} color="#232425ff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {actions.map((action) => (
            <View key={action.id} style={styles.actionRow}>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  action.type === 'shop' ? styles.shopButton : styles.viewButton,
                ]}
                onPress={action.onPress}
              >
                <Text
                  style={[
                    styles.actionButtonText,
                    action.type === 'shop' ? styles.shopButtonText : styles.viewButtonText,
                  ]}
                >
                  {action.type === 'shop' ? 'Shop' : '+View'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    overflow: 'hidden',
    marginHorizontal: 0,
    marginVertical: 0,
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
  headerSection: {
    height: 200,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  discountBadge: {
    position: 'absolute',
    top: 130,
    left: 12,
    backgroundColor: '#0f570dff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    fontSize: 8,
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
  websiteBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  websiteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1b1a1aff',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  infoSection: {
    padding: 16,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  storeName: {
    flex: 1,
    fontSize: 18,
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
  favoriteButton: {
    padding: 4,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#374151',
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
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopButton: {
    backgroundColor: '#0066CC',
  },
  viewButton: {
    backgroundColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  shopButtonText: {
    color: '#FFFFFF',
  },
  viewButtonText: {
    color: '#6B7280',
  },
});

export default StoreDetailCard;
