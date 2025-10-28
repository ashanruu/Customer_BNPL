import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  colorMode?: 'light' | 'dark'; // New prop for theme
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
  colorMode = 'light',
}) => {
  const themeColors = Colors[colorMode];

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    switch (size) {
      case 'small': baseStyle.push(styles.small); break;
      case 'medium': baseStyle.push(styles.medium); break;
      case 'large': baseStyle.push(styles.large); break;
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({ backgroundColor: themeColors.tint });
        break;
      case 'secondary':
        baseStyle.push({ backgroundColor: themeColors.background });
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: themeColors.tint,
        });
        break;
    }

    if (disabled || loading) {
      baseStyle.push({
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
      });
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    switch (size) {
      case 'small': baseStyle.push(styles.smallText); break;
      case 'medium': baseStyle.push(styles.mediumText); break;
      case 'large': baseStyle.push(styles.largeText); break;
    }

    switch (variant) {
      case 'primary':
        baseStyle.push({ color: '#FFFFFF' });
        break;
      case 'secondary':
        baseStyle.push({ color: themeColors.text });
        break;
      case 'outline':
        baseStyle.push({ color: themeColors.tint });
        break;
    }

    if (disabled || loading) {
      baseStyle.push({ color: '#9CA3AF' });
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : themeColors.tint} 
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25, // More rounded to match your design
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Size variants
  small: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  
  // Button variants
  primaryButton: {
    backgroundColor: '#E91E63', // Pink/Magenta color like in your image
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E91E63',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
  },
  
  // Text styles
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Text size variants
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Text color variants
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  outlineButtonText: {
    color: '#E91E63',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});

export default CustomButton;