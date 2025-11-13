import React from 'react';
import {
  Text,
  StyleSheet,
  useColorScheme,
  TextStyle,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { getFontFamily, getFontWeight } from '../utils/fontUtils';

// ==================== Text Component Variants ====================

// -------- Heading Component (Large titles) --------
interface HeadingProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  level?: 1 | 2 | 3 | 4; // h1, h2, h3, h4
  align?: 'left' | 'center' | 'right';
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  style,
  color,
  level = 1,
  align = 'left',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily('bold'),
    fontWeight: getFontWeight('bold') as any,
    color: color ?? themeColors.text,
    textAlign: align,
    includeFontPadding: false,
  };

  const levelStyle = styles[`h${level}` as keyof typeof styles];

  return (
    <Text style={[baseStyle, levelStyle, style]}>
      {children}
    </Text>
  );
};

// -------- MainText Component (Body text - bold) --------
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
  size = 'medium',
  weight = 'bold',
  align = 'left',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? themeColors.text,
    textAlign: align,
    includeFontPadding: false,
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {children}
    </Text>
  );
};

// -------- BodyText Component (Regular body text) --------
interface BodyTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const BodyText: React.FC<BodyTextProps> = ({
  children,
  style,
  color,
  size = 'medium',
  weight = 'normal',
  align = 'left',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? themeColors.text,
    textAlign: align,
    lineHeight: size === 'small' ? 18 : size === 'large' ? 24 : 20,
    includeFontPadding: false,
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {children}
    </Text>
  );
};

// -------- SubText Component (Secondary/muted text) --------
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
  size = 'small',
  weight = 'normal',
  align = 'left',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? '#6B7280', // Muted gray color
    textAlign: align,
    lineHeight: 18,
    includeFontPadding: false,
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {children}
    </Text>
  );
};

// -------- Caption Component (Small descriptive text) --------
interface CaptionProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  weight?: 'normal' | 'medium';
  align?: 'left' | 'center' | 'right';
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  style,
  color,
  weight = 'normal',
  align = 'left',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    fontSize: 11,
    color: color ?? '#9CA3AF',
    textAlign: align,
    lineHeight: 14,
    includeFontPadding: false,
  };

  return (
    <Text style={[baseStyle, style]}>
      {children}
    </Text>
  );
};

// -------- Label Component (Form labels, section headers) --------
interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  required?: boolean;
  size?: 'small' | 'medium' | 'large';
  weight?: 'normal' | 'medium' | 'bold';
}

export const Label: React.FC<LabelProps> = ({
  children,
  style,
  color,
  required = false,
  size = 'medium',
  weight = 'medium',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? themeColors.text,
    includeFontPadding: false,
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {children}
      {required && <Text style={styles.required}>*</Text>}
    </Text>
  );
};

// -------- LinkText Component (Clickable text) --------
interface LinkTextProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: TextStyle;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  underline?: boolean;
}

export const LinkText: React.FC<LinkTextProps> = ({
  children,
  onPress,
  style,
  color,
  size = 'medium',
  underline = false,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily('medium'),
    fontWeight: getFontWeight('medium') as any,
    color: color ?? '#0066CC',
    includeFontPadding: false,
    textDecorationLine: underline ? 'underline' : 'none',
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

// -------- Price Component (Currency display) --------
interface PriceProps {
  amount: string | number;
  currency?: string;
  style?: TextStyle;
  color?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'normal' | 'medium' | 'bold';
}

export const Price: React.FC<PriceProps> = ({
  amount,
  currency = 'Rs.',
  style,
  color,
  size = 'large',
  weight = 'bold',
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily(weight),
    fontWeight: getFontWeight(weight) as any,
    color: color ?? themeColors.text,
    includeFontPadding: false,
  };

  return (
    <Text style={[baseStyle, styles[size], style]}>
      {currency} {typeof amount === 'number' ? amount.toFixed(2) : amount}
    </Text>
  );
};

// -------- Badge Text Component (Status labels, tags) --------
interface BadgeTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const BadgeText: React.FC<BadgeTextProps> = ({
  children,
  style,
  color,
  variant = 'neutral',
}) => {
  const getVariantColor = () => {
    if (color) return color;
    switch (variant) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#DC2626';
      case 'info': return '#0066CC';
      default: return '#6B7280';
    }
  };

  const baseStyle: TextStyle = {
    fontFamily: getFontFamily('medium'),
    fontWeight: getFontWeight('medium') as any,
    fontSize: 11,
    color: getVariantColor(),
    includeFontPadding: false,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  return (
    <Text style={[baseStyle, style]}>
      {children}
    </Text>
  );
};

// -------- Shared Styles --------
const styles = StyleSheet.create({
  // Heading levels
  h1: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
  },
  
  // Size variants
  small: {
    fontSize: 12,
  },
  medium: {
    fontSize: 14,
  },
  large: {
    fontSize: 16,
  },
  xlarge: {
    fontSize: 20,
  },
  
  // Required asterisk
  required: {
    color: '#DC2626',
    marginLeft: 2,
  },
});

// -------- Export all components --------
export default {
  Heading,
  MainText,
  BodyText,
  SubText,
  Caption,
  Label,
  LinkText,
  Price,
  BadgeText,
};