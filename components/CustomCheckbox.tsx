import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string | React.ReactNode; // Support for rich text labels
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  checkboxColor?: string;
  textColor?: string;
  variant?: 'checkbox' | 'radio'; // Support for both checkbox and radio buttons
  style?: ViewStyle;
  labelStyle?: TextStyle;
  description?: string; // For additional text below label
  error?: boolean; // For error state
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  size = 'medium',
  checkboxColor = '#0066CC',
  textColor,
  variant = 'checkbox',
  style,
  labelStyle,
  description,
  error = false,
}) => {
  const getCheckboxSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 13;
      case 'large':
        return 17;
      default:
        return 15;
    }
  };

  const checkboxSize = getCheckboxSize();
  const textSize = getTextSize();

  // Determine border and background colors
  const getBorderColor = () => {
    if (error) return '#DC2626';
    if (disabled) return '#E5E7EB';
    if (checked) return checkboxColor;
    return '#D1D5DB';
  };

  const getBackgroundColor = () => {
    if (disabled) return '#F9FAFB';
    if (checked && variant === 'radio') return '#FFFFFF';
    if (checked && variant === 'checkbox') return checkboxColor;
    return '#FFFFFF';
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    if (disabled) return '#9CA3AF';
    return '#374151';
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled, style]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          variant === 'radio' ? styles.radioButton : styles.checkbox,
          {
            width: checkboxSize,
            height: checkboxSize,
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        {checked && variant === 'checkbox' && (
          // Checkmark for checkbox
          <View style={styles.checkmark}>
            <View style={styles.checkmarkStem} />
            <View style={styles.checkmarkKick} />
          </View>
        )}
        {checked && variant === 'radio' && (
          // Inner circle for radio button
          <View
            style={[
              styles.radioInner,
              {
                backgroundColor: checkboxColor,
                width: checkboxSize * 0.5,
                height: checkboxSize * 0.5,
              },
            ]}
          />
        )}
      </View>

      {label && (
        <View style={styles.labelContainer}>
          {typeof label === 'string' ? (
            <Text
              style={[
                styles.label,
                {
                  fontSize: textSize,
                  color: getTextColor(),
                },
                labelStyle,
              ]}
            >
              {label}
            </Text>
          ) : (
            label
          )}
          {description && (
            <Text style={[styles.description, { fontSize: textSize - 2 }]}>
              {description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    minHeight: 44, // Minimum touch target for accessibility
  },
  containerDisabled: {
    opacity: 0.5,
  },
  
  // Checkbox styles
  checkbox: {
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2, // Align with first line of text
  },
  
  // Radio button styles
  radioButton: {
    borderWidth: 2,
    borderRadius: 50, // Fully rounded for circular radio
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  
  // Radio button inner circle (when selected)
  radioInner: {
    borderRadius: 50,
  },
  
  // Custom checkmark for checkbox
  checkmark: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  checkmarkStem: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: '#FFFFFF',
    left: 6,
    top: 2,
    transform: [{ rotate: '45deg' }],
  },
  checkmarkKick: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#FFFFFF',
    left: 3,
    top: 6,
    transform: [{ rotate: '-45deg' }],
  },
  
  // Label container
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  // Label text
  label: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    lineHeight: 22,
    flexShrink: 1,
  },
  
  // Description text (below label)
  description: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
});

export default CustomCheckbox;
