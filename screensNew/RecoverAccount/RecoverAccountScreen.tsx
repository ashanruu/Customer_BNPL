import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenTemplate from '../../components/ScreenTemplate';

const RecoverAccountScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [nic, setNic] = useState('');

  // Accept either old NIC (9 digits + optional V/X) or new NIC (12 digits)
  const isNicValid =
    /^[0-9]{9}[vVxX]?$/.test(nic.trim()) || /^[0-9]{12}$/.test(nic.replace(/\s+/g, ''));

  const handleContinue = () => {
    console.log('Continue pressed', { nic, isNicValid });
    navigation.navigate('RecoverFormScreen' as any);
  };

  return (
    <ScreenTemplate
      showBackButton
      onBackPress={() => navigation.goBack()}
      topTitle="Let's verify your"
      mainTitle="National Identity Card"
      description="Type your NIC number so we can verify your account."
      buttonText="Continue"
      onButtonPress={handleContinue}
      // TEMP: force enabled to test press behaviour
      buttonDisabled={false}
      backgroundColor="#FFFFFF"
      scrollable={false}
    >
      <View style={styles.container}>

        <View style={styles.inputWrapper}>
          {nic === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>NIC Number</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={nic}
            onChangeText={setNic}
            keyboardType="default"
            maxLength={20}
          />
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  asterisk: {
    color: '#EF4444',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  placeholderContainer: {
    position: 'absolute',
    left: 14,
    top: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
  },
  placeholderAsterisk: {
    fontSize: 15,
    fontWeight: '400',
    color: '#EF4444',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#111827',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'Roboto', includeFontPadding: false },
    }),
  },
});

export default RecoverAccountScreen;