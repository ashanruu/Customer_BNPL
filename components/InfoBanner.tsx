import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';

interface InfoBannerProps {
  // Content
  title: string;
  description: string;
  
  // Appearance
  backgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  
  // Customization
  borderRadius?: number;
  showImage?: boolean;
}

const InfoBanner: React.FC<InfoBannerProps> = ({
  title,
  description,
  backgroundColor = '#E0F2FE',
  titleColor = '#0369A1',
  descriptionColor = '#1F2937',
  borderRadius = 16,
  showImage = true,
}) => {
  return (
    <View style={[styles.banner, { backgroundColor, borderRadius }]}>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <Text style={[styles.description, { color: descriptionColor }]}>
          {description}
        </Text>
      </View>
      
      {showImage && (
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/images/cute.png')}
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
    backgroundColor: '#E0F2FE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 8,
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
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    lineHeight: 22,
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
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default InfoBanner;
