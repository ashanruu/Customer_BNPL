import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native';

interface InstallmentCardProps {
  // Merchant Info
  merchantName: string;
  merchantLogo?: ImageSourcePropType | string;
  
  // Installment Info
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string; // Format: "Nov 28,2025" or "Oct 31,2025"
  
  // Amount
  amount: number;
  currency?: string;
  
  // Interaction
  onPress?: () => void;
  disabled?: boolean;
  
  // Status
  isPaid?: boolean;
  isOverdue?: boolean;
  
  // Customization
  backgroundColor?: string;
  borderColor?: string;
}

const InstallmentCard: React.FC<InstallmentCardProps> = ({
  merchantName,
  merchantLogo,
  currentInstallment,
  totalInstallments,
  dueDate,
  amount,
  currency = 'Rs.',
  onPress,
  disabled = false,
  isPaid = false,
  isOverdue = false,
  backgroundColor = '#FFFFFF',
  borderColor = '#E5E7EB',
}) => {
  // Format amount with comma separators
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formattedAmount = formatAmount(amount);

  // Determine status styles
  const getStatusStyles = () => {
    if (isPaid) {
      return {
        backgroundColor: '#F0FDF4',
        borderColor: '#10B981',
        statusText: 'Paid',
        statusColor: '#10B981',
      };
    }
    if (isOverdue) {
      return {
        backgroundColor: '#FEF2F2',
        borderColor: '#DC2626',
        statusText: 'Overdue',
        statusColor: '#DC2626',
      };
    }
    return null;
  };

  const statusStyles = getStatusStyles();

  const CardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: statusStyles?.backgroundColor || backgroundColor,
          borderColor: statusStyles?.borderColor || borderColor,
        },
      ]}
    >
      {/* Left Section - Logo */}
      <View style={styles.leftSection}>
        {merchantLogo ? (
          typeof merchantLogo === 'string' ? (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{merchantLogo.charAt(0).toUpperCase()}</Text>
            </View>
          ) : (
            <Image source={merchantLogo} style={styles.logo} />
          )
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{merchantName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Middle Section - Info */}
      <View style={styles.middleSection}>
        <Text style={styles.merchantName}>{merchantName}</Text>
        <Text style={styles.installmentText}>
          ({currentInstallment}/{totalInstallments})
        </Text>
        <Text style={styles.dueDate}>Due on {dueDate}</Text>
      </View>

      {/* Right Section - Amount */}
      <View style={styles.rightSection}>
        <Text style={[styles.amount, isPaid && styles.amountPaid]}>
          {currency} {formattedAmount}
        </Text>
        {statusStyles && (
          <View style={[styles.statusBadge, { backgroundColor: statusStyles.statusColor }]}>
            <Text style={styles.statusBadgeText}>{statusStyles.statusText}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  leftSection: {
    marginRight: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
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
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
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
  installmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
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
  dueDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
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
    justifyContent: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
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
  amountPaid: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
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

export default InstallmentCard;
