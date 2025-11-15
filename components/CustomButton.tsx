import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  colorMode?: 'light' | 'dark';
  icon?: React.ReactNode; // For adding icons like arrow
  fullWidth?: boolean; // For full width buttons
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
  icon,
  fullWidth = false,
}) => {
  const themeColors = Colors[colorMode];

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];

    // Add full width style
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    // Size variants
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'medium':
        baseStyle.push(styles.medium);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
    }

    // Variant styles - matching Figma designs
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButton);
        break;
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];

    // Size variants for text
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
    }

    // Text color based on variant
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButtonText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButtonText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButtonText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerButtonText);
        break;
    }

    // Disabled text color
    if (disabled || loading) {
      baseStyle.push(styles.disabledButtonText);
    }

    return baseStyle;
  };

  const getLoadingColor = () => {
    if (variant === 'outline') return '#0066CC';
    if (variant === 'primary' || variant === 'danger') return '#FFFFFF';
    return '#374151';
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoadingColor()} />
      ) : (
        <View style={styles.contentContainer}>
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 30, // Fully rounded corners like in Figma
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // Elevation for Android
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },

  fullWidth: {
    width: '100%',
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    marginLeft: 8,
  },

  // Size variants
  small: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44, // Minimum touch target for accessibility
  },
  medium: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    minHeight: 56,
  },

  // Button variants - matching your Figma designs
  primaryButton: {
    backgroundColor: '#006DB9', // Blue color 
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6', // Light gray
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#006DB9', // Blue border 
  },
  dangerButton: {
    backgroundColor: '#DC2626', // Red color
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    ...Platform.select({
      android: {
        elevation: 0,
      },
      ios: {
        shadowOpacity: 0,
      },
    }),
  },

  // Text styles
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Text size variants
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },

  // Text color variants
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#374151', // Dark gray text
  },
  outlineButtonText: {
    color: '#374151', // Dark gray text 
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
});

export default CustomButton;