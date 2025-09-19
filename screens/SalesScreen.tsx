import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  OrderPageScreen: { qrData: string };
};

type SalesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderPageScreen'>;

const { width, height } = Dimensions.get('window');

const SalesScreen: React.FC = () => {
  const navigation = useNavigation<SalesScreenNavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    console.log('QR Code scanned:', data);
    setManualCode(data); // Auto-fill the manual input field
  };

  const processCodeAndNavigate = (code: string) => {
    if (!code.trim()) {
      Alert.alert('Error', 'Invalid code');
      return;
    }

    console.log('Processing code:', code);
    
    // Navigate to OrderPageScreen with the scanned/entered data
    navigation.navigate('OrderPageScreen', { qrData: code });
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Please enter a code or URL');
      return;
    }
    
    setLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      setLoading(false);
      processCodeAndNavigate(manualCode);
    }, 500);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>Please enable camera permissions to use QR scanner</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header similar to ShopScreen */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.headerTitle}>Sales Scanner</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar similar to ShopScreen */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Enter QR code URL or scan below"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={manualCode}
            onChangeText={setManualCode}
          />
          <Ionicons name="link-outline" size={20} color="#999" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* QR Scanner Section - Half Page */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QR Code Scanner</Text>
          <View style={styles.scannerContainer}>
            <CameraView
              style={styles.scanner}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "pdf417", "aztec", "ean13", "ean8", "upc_e", "code128", "code39", "code93", "codabar", "itf14", "datamatrix"],
              }}
            />
            
            {/* Scanner Overlay */}
            <View style={styles.overlay}>
              <View style={styles.scannerFrame} />
            </View>

            {/* Scanner Status */}
            <View style={styles.scannerStatus}>
              <Text style={styles.scannerStatusText}>
                {scanned ? 'QR Code Detected!' : 'Point camera at QR code'}
              </Text>
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Text style={styles.rescanButtonText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Manual Input Section - Half Page */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manual Entry</Text>
          <View style={styles.manualInputContainer}>
            <Text style={styles.inputLabel}>Enter URL or Code Manually</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Paste or type the URL/code here..."
              placeholderTextColor="#999"
              value={manualCode}
              onChangeText={setManualCode}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <Text style={styles.helperText}>
              {manualCode.length > 0 ? `${manualCode.length} characters entered` : 'Enter the code manually if scanning fails'}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.proceedButton, (!manualCode.trim() || loading) && styles.proceedButtonDisabled]}
            onPress={handleManualSubmit}
            disabled={!manualCode.trim() || loading}
          >
            <Text style={styles.proceedButtonText}>
              {loading ? 'Processing...' : 'Continue to Order'}
            </Text>
            {!loading && <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: '#eee',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  scannerContainer: {
    height: height * 0.3, // Half page height
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  scannerStatus: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  scannerStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rescanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  manualInputContainer: {
    minHeight: height * 0.15, // Decreased from 0.25
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 60, // Decreased from 100
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  proceedButton: {
    backgroundColor: '#090B1A',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#ccc',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  permissionText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginTop: height * 0.4,
  },
  permissionSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
});