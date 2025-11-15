import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import VerificationCodeInput from '../../components/VerificationCodeInput';

type RootStackParamList = {
  RegWithReEnterPinScreen: undefined;
  RegWithFaceLoginScreen: undefined;
};

type RegWithReEnterPinNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithReEnterPinScreen'
>;

const RegWithReEnterPinScreen: React.FC = () => {
  const navigation = useNavigation<RegWithReEnterPinNavigationProp>();
  const [pin, setPin] = useState('');

  const handlePinComplete = (code: string) => {
    setPin(code);
  };

  const handlePinChange = (code: string) => {
    setPin(code);
  };

  const handleNext = () => {
    if (pin.length === 4) {
      // Navigate to next screen (confirm PIN or next step)
      navigation.navigate('RegWithFaceLoginScreen');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isFormValid = pin.length === 4;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={false}
      topTitle="Almost there..."
      mainTitle="Re-Enter New PIN"
      description="Confirm your secure 4-digit PIN."
      buttonText="Confirm PIN"
      onButtonPress={handleNext}
      buttonDisabled={!isFormValid}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* PIN Input with Custom Keypad */}
        <VerificationCodeInput
          length={4}
          onCodeComplete={handlePinComplete}
          onCodeChange={handlePinChange}
          autoFocus={false}
          editable={true}
          showKeypad={true}
        />
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 0,
    alignItems: 'center',
  },
});

export default RegWithReEnterPinScreen;
