import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import ScreenTemplate from '../../components/ScreenTemplate';

const ReportAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleYes = () => {
    // replace with real navigation / action
    console.log('Yes, this is my account');
    navigation.navigate('MyAccountScreen' as any);
  };

  const handleNo = () => {
    // replace with real navigation / action
    console.log("No, this isn't my account");
    navigation.navigate('ReportForm' as any);
  };

  return (
    <ScreenTemplate
      showBackButton
      onBackPress={() => navigation.goBack()}
      mainTitle=""
      buttonText="Yes, this is my account"
      onButtonPress={handleYes}
      buttonDisabled={false}
      backgroundColor="#FFFFFF"
      scrollable={false}
      showSecondaryButton
      secondaryButtonText="No, this isn't my account"
      onSecondaryButtonPress={handleNo}
    >
      {/* Wrapper moves content a bit higher; different spacing for iOS vs Android */}
      <View style={styles.contentWrapper}>
        {/* Custom header: bigger icon placed above the "Hi Tharindu" text, no background */}
        <View style={styles.header}>
          <Icon name="alert" size={100} color="#0B84D9" />
          <Text style={styles.mainTitle}>Hi Tharindu,</Text>
          <Text style={styles.description}>
            {'we found an account registered with your NIC and this mobile number.\n\nIs this your account?' }
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>National Identity Card:</Text>
            <Text style={styles.value}>9624458780V</Text>
          </View>

          <View style={[styles.row, { marginTop: 14 }]}>
            <Text style={styles.label}>Registered Mobile:</Text>
            <Text style={styles.value}>077 *** **45</Text>
          </View>
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    // bring content slightly higher on the screen; tweak values as needed
    marginTop: Platform.OS === 'ios' ? -16 : -8,
    paddingHorizontal: 0,
  },
  header: {
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  mainTitle: {
    marginTop: 14,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 44,
    marginBottom: 12,
    color: '#111827',
    alignSelf: 'flex-start',
    textAlign: 'left',
  },
  description: {
    marginTop: 10,
    textAlign: 'left',
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 0,
  },
  topIconWrap: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 8,
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#E8F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginHorizontal: 20,
  },
  row: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  buttons: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
});

export default ReportAccountScreen;