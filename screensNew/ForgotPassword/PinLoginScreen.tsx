import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  PinLoginScreen: undefined;
  LoginScreenNew: undefined;
  ForgotPinScreen: undefined;
};

type PinLoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PinLoginScreen'
>;

const PinLoginScreen: React.FC = () => {
  const navigation = useNavigation<PinLoginScreenNavigationProp>();
  const [pin, setPin] = useState<string>('');
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBiometricPress = () => {
    // Handle biometric authentication
    console.log('Biometric authentication');
  };

  const handleForgotPin = () => {
    // Navigate to forgot PIN screen
    navigation.navigate('ForgotPinScreen');
  };

  const handleConfirmPin = () => {
    if (pin.length === 4) {
      // Validate PIN
      console.log('PIN entered:', pin);
      // Navigate to next screen or validate
    }
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              pin.length > index && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberButton = (num: string) => (
    <TouchableOpacity
      key={num}
      style={styles.numberButton}
      onPress={() => handleNumberPress(num)}
      activeOpacity={0.7}
    >
      <Text style={styles.numberText}>{num}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
        backgroundColor="#FFFFFF"
      />

      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Enter Your</Text>
        <Text style={styles.mainTitle}>4-Digit PIN</Text>
        <Text style={styles.subtitle}>
          Use the PIN you created during registration.
        </Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.pinSection}>
        {renderPinDots()}
      </View>

      {/* Number Pad */}
      <View style={styles.numberPadContainer}>
        <View style={styles.numberRow}>
          {renderNumberButton('1')}
          {renderNumberButton('2')}
          {renderNumberButton('3')}
        </View>
        <View style={styles.numberRow}>
          {renderNumberButton('4')}
          {renderNumberButton('5')}
          {renderNumberButton('6')}
        </View>
        <View style={styles.numberRow}>
          {renderNumberButton('7')}
          {renderNumberButton('8')}
          {renderNumberButton('9')}
        </View>
        <View style={styles.numberRow}>
          <View style={styles.numberButton} />
          {renderNumberButton('0')}
          <TouchableOpacity
            style={styles.numberButton}
            onPress={handleBackspace}
            activeOpacity={0.7}
          >
            <Icon name="backspace-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot PIN Link */}
      <TouchableOpacity
        style={styles.forgotPinContainer}
        onPress={handleForgotPin}
        activeOpacity={0.7}
      >
        <Text style={styles.forgotPinText}>Forgot PIN</Text>
      </TouchableOpacity>

      {/* Confirm Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            pin.length !== 4 && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmPin}
          disabled={pin.length !== 4}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>Confirm PIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginTop: Platform.OS === 'ios' ? 20 : 30,
    marginBottom: 40,
    marginLeft: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1F2937',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  pinSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  pinDotFilled: {
    backgroundColor: '#006DB9',
  },
  biometricButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberPadContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  numberButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  forgotPinContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  forgotPinText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#006DB9',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  confirmButtonContainer: {
    paddingHorizontal: 20,
    marginTop: 80,
  },
  confirmButton: {
    backgroundColor: '#006DB9',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#006DB9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmButtonDisabled: {
    backgroundColor: '#006DB9',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});

export default PinLoginScreen;
