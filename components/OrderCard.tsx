import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type OrderItem = {
  id: string;
  merchant: string;
  dueDate: string;
  amount: string;
  numOfInstallments?: number;
  noOfInstallments?: number;
};

type Props = {
  item: OrderItem;
  onPress?: () => void;
};

const OrderCard: React.FC<Props> = ({ item, onPress }) => {
  // split "Rs. 1,250.00" into currency and numeric part, then split decimals
  const [currency = '', rawValue = '0'] = item.amount.split(' ');
  const [intPart = '0', decPart] = rawValue.split('.');
  const decimals = decPart ? '.' + decPart : '.00';
  const initial = item.merchant ? item.merchant.charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity style={[styles.card]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.leftGroup}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{initial}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.merchantRow}>
            <Text style={styles.merchant}>{item.merchant}</Text>
            {typeof item.noOfInstallments !== 'undefined' ? (
              <Text style={styles.counter}>
                ({item.numOfInstallments ?? 0}/{item.noOfInstallments})
              </Text>
            ) : null}
          </View>
          <Text style={styles.due}>{item.dueDate}</Text>
        </View>
      </View>

      <View style={styles.amountGroup}>
        <Text style={styles.amountValue}>
          <Text style={styles.amountCurrency}>{currency}</Text>
          <Text style={styles.amountInt}>{intPart}</Text>
          <Text style={styles.amountDecimals}>{decimals}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F2',
    backgroundColor: '#FFFFFF',
  },

  leftGroup: { flexDirection: 'row', alignItems: 'center' },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#08A0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  info: { maxWidth: 220 },
  merchantRow: { flexDirection: 'row', alignItems: 'center' },
  merchant: { fontSize: 16, color: '#111' },
  counter: { marginLeft: 8, color: '#8A8A95', fontSize: 12 },
  due: { fontSize: 12, color: '#9A9AA6', marginTop: 4 },

  amountGroup: { alignItems: 'flex-end' },

  // main wrapper for amount: integer is larger, currency & decimals smaller
  amountValue: { fontSize: 20, fontWeight: '400', color: '#111', marginTop: -2 },

  amountCurrency: {
    fontSize: 12,
    fontWeight: '400',
    color: '#111',
    // keep a small right margin so currency doesn't stick to integer part
    marginRight: 2,
  },

  amountInt: {
    fontSize: 20,
    fontWeight: '400',
    color: '#111',
  },

  amountDecimals: {
    fontSize: 12,
    fontWeight: '400',
    color: '#111',
    marginBottom: 2,
    marginLeft: 2,
  },
});

export default OrderCard;