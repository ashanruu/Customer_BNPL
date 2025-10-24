import { Platform } from 'react-native';

/**
 * Font utility for handling font families across different platforms
 * This ensures consistent font rendering in both development and production
 */

export interface FontConfig {
  regular: string;
  medium: string;
  bold: string;
}

export const SystemFonts: FontConfig = {
  regular: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }) as string,
  medium: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Medium',
    default: 'System',
  }) as string,
  bold: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }) as string,
};

export const getFontFamily = (weight: 'normal' | 'medium' | 'bold' = 'normal'): string => {
  switch (weight) {
    case 'bold':
      return SystemFonts.bold;
    case 'medium':
      return SystemFonts.medium;
    default:
      return SystemFonts.regular;
  }
};

export const getFontWeight = (weight: 'normal' | 'medium' | 'bold' = 'normal'): string => {
  switch (weight) {
    case 'bold':
      return '700';
    case 'medium':
      return '500';
    default:
      return '400';
  }
};