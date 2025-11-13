import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  RegWithFaceLoginScreen: undefined;
  RegWithFingerLoginScreen: undefined;
};

type RegWithFaceLoginNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithFaceLoginScreen'
>;

const RegWithFaceLoginScreen: React.FC = () => {
  const navigation = useNavigation<RegWithFaceLoginNavigationProp>();

  const handleEnableFaceID = () => {
    // Handle Face ID setup
    // This would typically trigger the biometric authentication flow
    navigation.navigate('RegWithFingerLoginScreen');
  };

  const handleSkip = () => {
    // Skip Face ID setup
    //navigation.navigate('');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={true}
      onSkipPress={handleSkip}
      skipButtonText="Skip"
      topTitle="Almost there..."
      mainTitle="Enable Quick Login"
      description="Enable Face ID to let you log in & proceed with your transactions faster"
      buttonText="Enable Face ID"
      onButtonPress={handleEnableFaceID}
      buttonDisabled={false}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* Face ID Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.faceIdIcon}>
            {/* Face ID frame corners */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
            
            {/* Face icon in the center */}
            <Icon name="face-recognition" size={60} color="#0066CC" />
          </View>
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceIdIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Corner brackets
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0066CC',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0066CC',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0066CC',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0066CC',
    borderBottomRightRadius: 8,
  },
});

export default RegWithFaceLoginScreen;
