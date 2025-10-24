import React from 'react';
import {
  Text,
  StyleSheet,
  useColorScheme,
  TextStyle,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { getFontFamily, getFontWeight } from '../utils/fontUtils';

// -------- MainText Component --------
interface MainTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const MainText: React.FC<MainTextProps> = ({
  children,
  style,
  color,
  size = 'large',
  weight = 'bold',
  align = 'center',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? themeColors.text,
    textAlign: align,
    marginBottom: 8,
    includeFontPadding: false, // Android-specific: prevents extra padding
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {children}
    </Text>
  );
};

// -------- SubText Component --------
interface SubTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  weight?: 'normal' | 'medium';
  align?: 'left' | 'center' | 'right';
}

export const SubText: React.FC<SubTextProps> = ({
  children,
  style,
  color,
  size = 'medium',
  weight = 'normal',
  align = 'center',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? themeColors.icon,
    textAlign: align,
    lineHeight: 20,
    marginBottom: 4,
    includeFontPadding: false, // Android-specific: prevents extra padding
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {children}
    </Text>
  );
};

// -------- LinkText Component --------
interface LinkTextProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: TextStyle;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LinkText: React.FC<LinkTextProps> = ({
  children,
  onPress,
  style,
  color,
  size = 'small',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily('normal'),
    fontWeight: getFontWeight('normal') as any,
    color: color ?? themeColors.tint,
    includeFontPadding: false, // Android-specific: prevents extra padding
  };

  return (
    <Text
      style={[baseStyle, styles[size], style]}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

// -------- Shared Styles --------
const styles = StyleSheet.create({
  small: {
    fontSize: 16, // previously 12
  },
  medium: {
    fontSize: 18, // previously 14
  },
  large: {
    fontSize: 22, // previously 18
  },
  xlarge: {
    fontSize: 30, // previously 24
  },
});

export default {
  MainText,
  SubText,
  LinkText,
};