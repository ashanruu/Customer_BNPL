import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';

interface InstallmentCountCardProps {
  // Content
  installmentNumber: string | number;
  cardType: string; // e.g., "VISA"
  cardLast4: string;
  amount: number;
  currency?: string;
  paidDate?: string;
  status?: 'paid' | 'pending' | 'overdue';
  
  // Icon/Image
  icon?: ReactNode;
  iconImage?: ImageSourcePropType;
  iconBackgroundColor?: string;
  
  // Interaction
  onPress?: () => void;
  
  // Appearance
  backgroundColor?: string;
  borderColor?: string;
}

const InstallmentCountCard: React.FC<InstallmentCountCardProps> = ({
  installmentNumber,
  cardType,
  cardLast4,
  amount,
  currency = 'Rs.',
  paidDate,
  status = 'paid',
  icon,
  iconImage,
  iconBackgroundColor = '#E0F2FE',
  onPress,
  backgroundColor = '#F9FAFB',
  borderColor = '#E5E7EB',
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'paid':
        return {
          backgroundColor: '#D1FAE5',
          textColor: '#059669',
          borderColor: '#10B981',
          text: 'Paid',
        };
      case 'pending':
        return {
          backgroundColor: '#FEF3C7',
          textColor: '#D97706',
          borderColor: '#F59E0B',
          text: 'Pending',
        };
      case 'overdue':
        return {
          backgroundColor: '#FEE2E2',
          textColor: '#DC2626',
          borderColor: '#EF4444',
          text: 'Overdue',
        };
      default:
        return {
          backgroundColor: '#D1FAE5',
          textColor: '#059669',
          borderColor: '#10B981',
          text: 'Paid',
        };
    }
  };

  const statusStyle = getStatusStyle();

  const formatAmount = (value: number) => {
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const content = (
    <View style={[styles.card, { backgroundColor, borderColor }]}>
      {/* Left Section - Icon/Image */}
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          {iconImage ? (
            <Image source={iconImage} style={styles.iconImage} resizeMode="contain" />
          ) : icon ? (
            icon
          ) : (
            <View style={styles.defaultIcon} />
          )}
        </View>
      </View>

      {/* Middle Section - Details */}
      <View style={styles.middleSection}>
        <Text style={styles.installmentTitle}>
          {typeof installmentNumber === 'number' 
            ? `${installmentNumber}${getOrdinalSuffix(installmentNumber)} Installment`
            : installmentNumber}
        </Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardType}>{cardType}</Text>
          <Text style={styles.cardNumber}>•••• {cardLast4}</Text>
        </View>
        {paidDate && (
          <Text style={styles.paidDate}>Paid on {paidDate}</Text>
        )}
      </View>

      {/* Right Section - Amount & Status */}
      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          {currency} {formatAmount(amount)}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusStyle.backgroundColor,
              borderColor: statusStyle.borderColor,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
            {statusStyle.text}
          </Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  leftSection: {
    marginRight: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  defaultIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0066CC',
  },
  middleSection: {
    flex: 1,
  },
  installmentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
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
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
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
  cardNumber: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
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
  paidDate: {
    fontSize: 12,
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
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
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
});

export default InstallmentCountCard;
