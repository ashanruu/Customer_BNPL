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

interface CircularStoreIconProps {
  image: ImageSourcePropType;
  storeName: string;
  onPress?: () => void;
  size?: number;
  imageSize?: number;
}

const CircularStoreIcon: React.FC<CircularStoreIconProps> = ({
  image,
  storeName,
  onPress,
  size = 80,
  imageSize = 80,
}) => {
  const content = (
    <View style={[styles.container, { width: size }]}>
      <View
        style={[
          styles.circularImageContainer,
          { width: imageSize, height: imageSize, borderRadius: imageSize / 2 },
        ]}
      >
        <Image source={image} style={styles.circularImage} resizeMode="cover" />
      </View>
      <Text style={styles.storeName} numberOfLines={1}>
        {storeName}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circularImageContainer: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
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
  circularImage: {
    width: '100%',
    height: '100%',
  },
  storeName: {
    fontSize: 11,
    fontWeight: '400',
    color: '#4B5563',
    textAlign: 'center',
    width: '100%',
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

export default CircularStoreIcon;
