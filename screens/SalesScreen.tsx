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
import CustomButton from '../components/CustomButton';

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
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="camera-outline" size={64} color="#E5E5E7" />
        </View>
        <Text style={styles.permissionText}>No access to camera</Text>
        <Text style={styles.permissionSubtext}>Please enable camera permissions to use QR scanner</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>Sales</Text>
            <Text style={styles.subText}>Scan QR codes or enter manually</Text>
          </View>
        </View>

        {/* Search Bar */}
        {/* <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Enter QR code URL or scan below"
              placeholderTextColor="#8E8E93"
              style={styles.searchInput}
              value={manualCode}
              onChangeText={setManualCode}
            />
            <Ionicons name="link-outline" size={20} color="#8E8E93" />
          </View>
        </View> */}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* QR Scanner Section */}
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

          {/* Manual Input Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manual Entry</Text>
            <View style={styles.manualInputContainer}>
              <Text style={styles.inputLabel}>Enter URL or Code Manually</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Paste or type the URL/code here..."
                  placeholderTextColor="#8E8E93"
                  value={manualCode}
                  onChangeText={setManualCode}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <Text style={styles.helperText}>
                {manualCode.length > 0 ? `${manualCode.length} characters entered` : 'Enter the code manually if scanning fails'}
              </Text>
            </View>
          </View>

          {/* Action Button */}

          <CustomButton
            title="Other Document Upload"
            size="medium"
            variant="primary"
            onPress={handleManualSubmit}
            disabled={!manualCode.trim() || loading}
          ></CustomButton>

        </ScrollView>
      </View>
    </View>
  );
};

export default SalesScreen;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    paddingBottom: 22,
  },
  titleSection: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 20,
  },
  // searchBarContainer: {
  //   marginBottom: 24,
  // },
  // searchBar: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   borderColor: '#E5E5E5',
  //   borderWidth: 1,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   paddingHorizontal: 16,
  //   height: 48,
  //   elevation: 2,
  // },
  // searchInput: {
  //   flex: 1,
  //   fontSize: 15,
  //   color: "#000",
  //   fontWeight: '500',
  //   letterSpacing: -0.2,
  // },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: "#2C2C2E",
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  scannerContainer: {
    height: height * 0.3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  scanner: {
    flex: 1,
    borderRadius: 12,
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
    width: 180,
    height: 180,
    borderWidth: 3,
    borderColor: '#999',
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  scannerStatus: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  scannerStatusText: {
    color: '#2C2E2E',
    fontSize: 15,
    fontWeight: '500',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    letterSpacing: -0.2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  rescanButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rescanButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  manualInputContainer: {
    minHeight: height * 0.15,
  },
  inputLabel: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 12,
    elevation: 2,
    marginBottom: 12,
    minHeight: 80,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: '#000',
    fontWeight: '500',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 13,
    color: "#8E8E93",
    letterSpacing: -0.1,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  permissionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6D6D70',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  permissionSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});