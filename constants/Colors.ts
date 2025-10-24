const tintColorLight = '#20222E';
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    text: '#11181C', // Dark text for light theme
    mutedText: '#6B7280', // Gray text
    background: '#ffffff', // White background
    tint: tintColorLight, // Primary brand color
    icon: '#687076', // Icon color
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Additional colors for consistency
    primary: '#20222E',
    secondary: '#6B7280',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    text: '#ECEDEE', // Light text for dark theme
    mutedText: '#9CA3AF', // Gray text
    background: '#151718', // Dark background
    tint: tintColorDark, // White for dark theme
    icon: '#9BA1A6', // Icon color
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Additional colors for consistency
    primary: '#ffffff',
    secondary: '#9CA3AF',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
};
