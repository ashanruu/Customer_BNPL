import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors'; // Adjust path if needed

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  size = 'medium',
  color = Colors.light.tint,
}) => {
  const getCheckboxSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  const checkboxSize = getCheckboxSize();
  const textSize = getTextSize();

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled]}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: checkboxSize,
            height: checkboxSize,
            borderColor: checked ? color : Colors.light.icon,
            backgroundColor: checked ? color : 'transparent',
          },
          disabled && styles.checkboxDisabled,
        ]}
      >
        {checked && (
          <MaterialCommunityIcons
            name="check"
            size={checkboxSize * 0.7}
            color={Colors.light.background}
          />
        )}
      </View>

      {label && (
        <Text
          style={[
            styles.label,
            {
              fontSize: textSize,
              color: disabled ? Colors.light.icon : Colors.light.text,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  label: {
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    fontWeight: '400',
    flex: 1,
  },
});

export default CustomCheckbox;
