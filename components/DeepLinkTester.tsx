import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';

const DeepLinkTester = () => {
  const testUrls = [
    {
      name: 'Custom Scheme - Sale Code',
      url: 'bnplcustomer://order?saleCode=44020251028180246',
      description: '✅ This should work immediately'
    },
    {
      name: 'Custom Scheme - Merchant',
      url: 'bnplcustomer://order?merchantId=32',
      description: '✅ This should work immediately'
    },
    {
      name: 'HTTPS - Verified Domain Sale',
      url: 'https://merchant.bnpl.hexdive.com/sale/44020251028180246',
      description: '✅ Domain verified - should work'
    },
    {
      name: 'HTTPS - Verified Domain Query',
      url: 'https://merchant.bnpl.hexdive.com?salecode=44020251028180246',
      description: '✅ Domain verified - should work'
    }
  ];

  const testDeepLink = async (url: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open URL: ${url}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open URL: ${error}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Deep Link Tester</Text>
      <Text style={styles.subtitle}>Test different deep link formats</Text>
      
      {testUrls.map((item, index) => (
        <View style={styles.testItem} key={index}>
          <TouchableOpacity
            style={[
              styles.button,
              item.url.startsWith('bnplcustomer://') ? styles.customScheme : styles.httpsScheme
            ]}
            onPress={() => testDeepLink(item.url, item.name)}
          >
            <Text style={styles.buttonText}>{item.name}</Text>
            <Text style={styles.urlText}>{item.url}</Text>
          </TouchableOpacity>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ))}
      
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>📱 How to Test:</Text>
        <Text style={styles.instructionText}>1. Tap the green buttons - they should work immediately</Text>
        <Text style={styles.instructionText}>2. Create QR codes with the custom scheme URLs</Text>
        <Text style={styles.instructionText}>3. Scan QR codes with any QR scanner app</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  testItem: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  customScheme: {
    backgroundColor: '#4CAF50',
  },
  httpsScheme: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  urlText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  description: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructions: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976D2',
  },
  instructionText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 5,
  },
});

export default DeepLinkTester;