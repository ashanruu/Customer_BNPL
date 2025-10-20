import React, { useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageProps, ImageStyle } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface OptimizedImageProps extends Omit<ImageProps, 'source' | 'style'> {
  source: { uri: string } | string;
  style?: ImageStyle | ViewStyle;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  fallbackText?: string;
  showLoadingIndicator?: boolean;
  loadingIndicatorColor?: string;
  loadingIndicatorSize?: 'small' | 'large';
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  priority?: 'low' | 'normal' | 'high';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  fallbackIcon = 'image-outline',
  fallbackText = 'No Image',
  showLoadingIndicator = true,
  loadingIndicatorColor = '#666',
  loadingIndicatorSize = 'small',
  cachePolicy = 'memory-disk',
  priority = 'normal',
  contentFit = 'cover',
  transition = 200,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageUri = typeof source === 'string' ? source : source?.uri;

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getImageSource = () => {
    if (!imageUri) return null;
    
    return {
      uri: imageUri,
      cacheKey: imageUri, // Use URI as cache key for better cache management
    };
  };

  const imageSource = getImageSource();

  if (!imageSource || hasError) {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Ionicons name={fallbackIcon} size={40} color="#ccc" />
        {fallbackText && <Text style={styles.fallbackText}>{fallbackText}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        source={imageSource}
        style={[styles.image, style as ImageStyle]}
        contentFit={contentFit}
        transition={transition}
        cachePolicy={cachePolicy}
        priority={priority}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
      
      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size={loadingIndicatorSize} 
            color={loadingIndicatorColor} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100%',
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default OptimizedImage;