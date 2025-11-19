import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  ReEnterNewPinScreen: undefined;
  EnterNewPinScreen: undefined;
  LoginScreenNew: undefined;
};

type ReEnterNewPinScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ReEnterNewPinScreen'
>;

const ReEnterNewPinScreen: React.FC = () => {
  const navigation = useNavigation<ReEnterNewPinScreenNavigationProp>();
  const [pin, setPin] = useState<string>('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleResetPin = () => {
    setPin('');
  };

  const handleConfirmPin = () => {
    if (pin.length === 4) {
      // Validate PIN matches previous entry
      console.log('Confirming PIN:', pin);
      // Navigate to success screen or dashboard
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

  const isButtonDisabled = pin.length !== 4;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      topTitle="Create PIN for your account..."
      mainTitle="Re-Enter New PIN"
      description="Create a secure 4-digit PIN for your account."
      buttonText="Confirm PIN"
      onButtonPress={handleConfirmPin}
      buttonDisabled={isButtonDisabled}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
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

        {/* Reset PIN Link */}
        <TouchableOpacity
          style={styles.resetPinContainer}
          onPress={handleResetPin}
          activeOpacity={0.7}
        >
          <Text style={styles.resetPinText}>Reset PIN</Text>
        </TouchableOpacity>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  pinSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 20,
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
  resetPinContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resetPinText: {
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
});

export default ReEnterNewPinScreen;
