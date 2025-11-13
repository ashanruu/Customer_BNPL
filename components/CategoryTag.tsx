import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';

interface CategoryTagProps {
  // Content
  label: string;
  icon?: ReactNode;
  image?: ImageSourcePropType;
  
  // Interaction
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  
  // Appearance
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  textColor?: string;
  selectedTextColor?: string;
  iconBackgroundColor?: string;
  selectedIconBackgroundColor?: string;
  
  // Size
  size?: 'small' | 'medium' | 'large';
}

const CategoryTag: React.FC<CategoryTagProps> = ({
  label,
  icon,
  image,
  onPress,
  selected = false,
  disabled = false,
  backgroundColor = '#F3F4F6',
  selectedBackgroundColor = '#E0F2FE',
  textColor = '#6B7280',
  selectedTextColor = '#0369A1',
  iconBackgroundColor = '#FFFFFF',
  selectedIconBackgroundColor = '#FFFFFF',
  size = 'medium',
}) => {
  const sizeStyles = {
    small: {
      container: { width: 70, height: 90 },
      iconContainer: { width: 48, height: 48, borderRadius: 24 },
      iconSize: 28,
      imageSize: { width: 32, height: 32 },
      label: { fontSize: 11 },
    },
    medium: {
      container: { width: 90, height: 110 },
      iconContainer: { width: 60, height: 60, borderRadius: 30 },
      iconSize: 36,
      imageSize: { width: 40, height: 40 },
      label: { fontSize: 13 },
    },
    large: {
      container: { width: 110, height: 130 },
      iconContainer: { width: 72, height: 72, borderRadius: 36 },
      iconSize: 44,
      imageSize: { width: 48, height: 48 },
      label: { fontSize: 15 },
    },
  };

  const currentSize = sizeStyles[size];

  const containerStyle = [
    styles.container,
    currentSize.container,
    {
      backgroundColor: selected ? selectedBackgroundColor : backgroundColor,
    },
    selected && styles.selectedContainer,
    disabled && styles.disabledContainer,
  ];

  const iconContainerStyle = [
    styles.iconContainer,
    currentSize.iconContainer,
    {
      backgroundColor: selected ? selectedIconBackgroundColor : iconBackgroundColor,
    },
  ];

  const labelStyle = [
    styles.label,
    currentSize.label,
    {
      color: selected ? selectedTextColor : textColor,
    },
  ];

  const content = (
    <View style={containerStyle}>
      <View style={iconContainerStyle}>
        {image ? (
          <Image
            source={image}
            style={[styles.image, currentSize.imageSize]}
            resizeMode="contain"
          />
        ) : (
          icon
        )}
      </View>
      <Text style={labelStyle} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: '#0369A1',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  disabledContainer: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
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

export default CategoryTag;
