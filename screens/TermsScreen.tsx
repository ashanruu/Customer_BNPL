import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TermsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Terms & Conditions</Text>
    </View>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 20, fontWeight: '500', textAlign: 'center' },
});
