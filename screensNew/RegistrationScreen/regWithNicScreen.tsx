import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  RegWithNicScreen: undefined;
  RegWithPersonalDetailsScreen: undefined;
};

type RegWithNicScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithNicScreen'
>;

const RegWithNicScreen: React.FC = () => {
  const navigation = useNavigation<RegWithNicScreenNavigationProp>();
  const [nicNumber, setNicNumber] = useState('');

  const handleContinue = () => {
    if (nicNumber.length >= 9) {
      // Navigate to next screen
      navigation.navigate('RegWithPersonalDetailsScreen');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isNicValid = nicNumber.length >= 9;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={false}
      topTitle="Let's verify your"
      mainTitle="National Identity Card"
      description="Type your NIC number so we can verify your account."
      buttonText="Continue"
      onButtonPress={handleContinue}
      buttonDisabled={!isNicValid}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* NIC Number Input */}
        <View style={styles.inputWrapper}>
          {nicNumber === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>NIC Number</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={nicNumber}
            onChangeText={setNicNumber}
            keyboardType="default"
            autoCapitalize="characters"
            maxLength={12}
          />
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: '400',
    color: '#111827',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  placeholderContainer: {
    position: 'absolute',
    left: 20,
    top: 19,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#4B5563',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  placeholderAsterisk: {
    fontSize: 15,
    fontWeight: '400',
    color: '#EF4444',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
});

export default RegWithNicScreen;
