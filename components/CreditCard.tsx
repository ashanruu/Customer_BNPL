import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';

export type CreditCardVariant = 'bronze' | 'silver' | 'gold' | 'platinum';

interface CreditCardProps {
  variant?: CreditCardVariant;
  totalCreditLimit: number;
  availableAmount: number;
  currency?: string;
  onPress?: () => void;
  disabled?: boolean;
}

const CreditCard: React.FC<CreditCardProps> = ({
  variant = 'bronze',
  totalCreditLimit,
  availableAmount,
  currency = 'Rs.',
  onPress,
  disabled = false,
}) => {
  // Get variant-specific colors and styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'bronze':
        return {
          backgroundColor: '#8B4513',
          gradientColors: ['#A0522D', '#8B4513', '#6B3410'],
          badgeColor: '#FFFFFF',
          badgeTextColor: '#8B4513',
          badgeText: 'Bronze',
        };
      case 'silver':
        return {
          backgroundColor: '#71717A',
          gradientColors: ['#A1A1AA', '#71717A', '#52525B'],
          badgeColor: '#FFFFFF',
          badgeTextColor: '#71717A',
          badgeText: 'Silver',
        };
      case 'gold':
        return {
          backgroundColor: '#D4AF37',
          gradientColors: ['#F4D03F', '#D4AF37', '#B8860B'],
          badgeColor: '#FFFFFF',
          badgeTextColor: '#D4AF37',
          badgeText: 'Gold',
        };
      case 'platinum':
        return {
          backgroundColor: '#005C99',
          gradientColors: ['#0077B6', '#005C99', '#004D7A'],
          badgeColor: '#FFFFFF',
          badgeTextColor: '#005C99',
          badgeText: 'Platinum',
        };
      default:
        return {
          backgroundColor: '#8B4513',
          gradientColors: ['#A0522D', '#8B4513', '#6B3410'],
          badgeColor: '#FFFFFF',
          badgeTextColor: '#8B4513',
          badgeText: 'Bronze',
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Format amount with comma separators
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Split amount into main and decimal parts
  const splitAmount = (amount: number) => {
    const formatted = formatAmount(amount);
    const parts = formatted.split('.');
    return {
      main: parts[0],
      decimal: parts[1] || '00',
    };
  };

  const availableSplit = splitAmount(availableAmount);
  const limitFormatted = formatAmount(totalCreditLimit);

  const CardContent = (
    <View
      style={[
        styles.card,
        { backgroundColor: variantStyles.backgroundColor },
      ]}
    >
      {/* Background Pattern */}
      <View style={styles.pattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.limitSection}>
            <Text style={styles.limitLabel}>Total Credit Limit</Text>
            <Text style={styles.limitAmount}>
              {currency} {limitFormatted}
              <Text style={styles.limitDecimal}> .00</Text>
            </Text>
          </View>

          {/* Variant Badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: variantStyles.badgeColor },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: variantStyles.badgeTextColor },
              ]}
            >
              {variantStyles.badgeText}
            </Text>
          </View>
        </View>

        {/* Dashed Line */}
        <View style={styles.dashedLine}>
          {Array.from({ length: 30 }).map((_, index) => (
            <View key={index} style={styles.dash} />
          ))}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.spendLabel}>You can{'\n'}spend up to</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{currency}</Text>
            <Text style={styles.mainAmount}>{availableSplit.main}</Text>
            <Text style={styles.decimalAmount}>.{availableSplit.decimal}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        disabled={disabled}
      >
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 1.7,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -40,
    left: -40,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 40,
    left: 20,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  limitSection: {
    flex: 1,
  },
  limitLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
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
  limitAmount: {
    fontSize: 13,
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
  limitDecimal: {
    fontSize: 11,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
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
  dashedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  dash: {
    width: 4,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  spendLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 16,
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
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 14,
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
  mainAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
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
  decimalAmount: {
    fontSize: 16,
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
});

export default CreditCard;
