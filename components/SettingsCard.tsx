import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';

interface SettingsCardProps {
  // Content
  label: string;
  icon?: ReactNode;
  iconText?: string; // Alternative to icon (e.g., "🌐", "📊")
  
  // Interaction
  onPress: () => void;
  disabled?: boolean;
  
  // Appearance
  showArrow?: boolean;
  subtitle?: string;
  badge?: string | number;
  
  // Customization
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  iconBackgroundColor?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({
  label,
  icon,
  iconText,
  onPress,
  disabled = false,
  showArrow = true,
  subtitle,
  badge,
  backgroundColor = '#FFFFFF',
  borderColor = '#E5E7EB',
  textColor = '#1F2937',
  iconBackgroundColor = '#F3F4F6',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor,
        },
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Left Section - Icon */}
      {(icon || iconText) && (
        <View style={styles.leftSection}>
          {icon ? (
            <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
              {icon}
            </View>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
              <Text style={styles.iconText}>{iconText}</Text>
            </View>
          )}
        </View>
      )}

      {/* Middle Section - Label & Subtitle */}
      <View style={styles.middleSection}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Right Section - Badge & Arrow */}
      <View style={styles.rightSection}>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {showArrow && (
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>›</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    minHeight: 64,
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
  cardDisabled: {
    opacity: 0.5,
  },
  leftSection: {
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  iconText: {
    fontSize: 20,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
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
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: 2,
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
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
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
    color: '#9CA3AF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});

export default SettingsCard;
