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

interface PromotionBannerProps {
  // Content
  title: string;
  discount: string;
  description: string;
  buttonText: string;
  image?: ImageSourcePropType;
  
  // Interaction
  onButtonPress: () => void;
  
  // Appearance
  backgroundColor?: string;
  titleColor?: string;
  discountColor?: string;
  descriptionColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  
  // Customization
  borderRadius?: number;
  showImage?: boolean;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({
  title,
  discount,
  description,
  buttonText,
  image,
  onButtonPress,
  backgroundColor = '#E8EEF6',
  titleColor = '#6B7280',
  discountColor = '#000000',
  descriptionColor = '#6B7280',
  buttonBackgroundColor = '#000000',
  buttonTextColor = '#FFFFFF',
  borderRadius = 12,
  showImage = true,
}) => {
  return (
    <View style={[styles.banner, { backgroundColor, borderRadius }]}>
      {/* Left Section - Content */}
      <View style={styles.contentSection}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Text style={[styles.discount, { color: discountColor }]}>{discount}</Text>
        <Text style={[styles.description, { color: descriptionColor }]}>
          {description}
        </Text>
        
        {/* Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>
            {buttonText}
          </Text>
          <View style={styles.arrow}>
            <Text style={[styles.arrowText, { color: buttonTextColor }]}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Right Section - Image */}
      {showImage && image && (
        <View style={styles.imageSection}>
          <Image
            source={image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    backgroundColor: '#E8EEF6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contentSection: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
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
  discount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
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
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
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
  arrow: {
    marginLeft: 4,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageSection: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default PromotionBanner;
