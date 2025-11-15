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

interface OfferBannerProps {
  title: string;
  description: string;
  backgroundColor?: string;
  image?: ImageSourcePropType;
  onPress?: () => void;
}

const OfferBanner: React.FC<OfferBannerProps> = ({
  title,
  description,
  backgroundColor = '#E0F2FE',
  image,
  onPress,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Left Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Right Side - Image Only */}
      <View style={styles.rightContainer}>
        {image && (
          <Image 
            source={image} 
            style={styles.offerImage} 
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    marginHorizontal: 16,
    marginVertical: 12,
    minHeight: 80,
    position: 'relative',
    overflow: 'visible',
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
    paddingTop: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  description: {
    fontSize: 10,
    fontWeight: '400',
    color: '#0284C7',
    lineHeight: 14,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  offerImage: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -60,
    right: -5,
    zIndex: 10,
  },
});

export default OfferBanner;
