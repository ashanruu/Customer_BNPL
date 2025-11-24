import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface InstallmentCardProps {
  installmentTitle: string;
  currentInstallment: number;
  dueDate: string;
  dateLabel?: string;
  amount: number;
  currency?: string;
  onPress?: () => void;
  disabled?: boolean;
  isPaid?: boolean;
  isOverdue?: boolean;
  isRefunded?: boolean; // added
  cardBrand?: string;
  cardMask?: string;
  backgroundColor?: string;
  borderColor?: string;
}

const InstallmentCard: React.FC<InstallmentCardProps> = ({
  installmentTitle,
  currentInstallment,
  dueDate,
  dateLabel,
  amount,
  currency = 'Rs.',
  onPress,
  disabled = false,
  isPaid = false,
  isOverdue = false,
  isRefunded = false, // added default
  cardBrand,
  cardMask,
  backgroundColor = '#FFFFFF',
  borderColor = '#E5E7EB',
}) => {
  const formatAmount = (val: number): string =>
    val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formattedAmount = formatAmount(amount);

  const getStatusStyles = () => {
    if (isPaid) {
      return { cardBg: '#EAF6EC', circleBg: '#A8DBB2', circleText: '#1A6629' };
    }
    // refunded should use the red/overdue styles
    if (isRefunded) {
      return { cardBg: '#FEF2F2', circleBg: '#FEE2E2', circleText: '#991B1B' };
    }
    if (isOverdue) {
      return { cardBg: '#FEF2F2', circleBg: '#FEE2E2', circleText: '#991B1B' };
    }
    return { cardBg: '#F8FAFB', circleBg: '#E0F2FE', circleText: '#0369A1' };
  };

  const status = getStatusStyles();

  const renderCardBrand = () => {
    const brand = cardBrand ?? 'VISA';
    const mask = cardMask ?? '•••• 3816';
    return (
      <View style={styles.cardBrandRow}>
        <Text style={styles.cardBrandText}>{brand}</Text>
        <Text style={styles.maskText}> {mask}</Text>
      </View>
    );
  };

  const CardContent = (
    <View style={[styles.card, { backgroundColor: status.cardBg || backgroundColor, borderColor }]}>
      <View style={styles.leftSection}>
        <View style={[styles.numberCircle, { backgroundColor: status.circleBg }]}>
          <Text style={[styles.numberText, { color: status.circleText }]}>{currentInstallment}</Text>
        </View>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.installmentTitle}>{installmentTitle}</Text>
        <Text style={styles.dueDate}>{dateLabel ?? `Due on ${dueDate}`}</Text>
        <View style={styles.brandAndCardRow}>{renderCardBrand()}</View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.rightAmount}>{currency} {formattedAmount}</Text>
        {isPaid ? (
          <View style={styles.checkWrap}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={16} color="#fff" />
            </View>
          </View>
        ) : (
          <View style={styles.emptyRight} />
        )}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.75} disabled={disabled}>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 4,
    borderWidth: 0,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 0.8 },
    }),
  },
  leftSection: { marginRight: 10 },
  numberCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 14, fontWeight: '600' },
  middleSection: { flex: 1, justifyContent: 'center', alignItems: 'flex-start' },
  installmentTitle: { fontSize: 14, fontWeight: '500', color: '#1F2937' },
  dueDate: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  brandAndCardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cardBrandRow: { flexDirection: 'row', alignItems: 'center' },
  cardBrandText: { fontSize: 13, fontWeight: '700', color: '#0B4DA0' },
  maskText: { fontSize: 12, color: '#1F2937', marginLeft: 6, fontWeight: '600' },
  rightSection: { width: 76, alignItems: 'flex-end', justifyContent: 'center' },
  rightAmount: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  checkWrap: { marginTop: 8, alignItems: 'center' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1D752F', alignItems: 'center', justifyContent: 'center' },
  emptyRight: { width: 28, height: 28, marginTop: 8 },
});

export default InstallmentCard;
