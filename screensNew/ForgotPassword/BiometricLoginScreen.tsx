import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  BiometricLoginScreen: undefined;
  LoginScreenNew: undefined;
  PinLoginScreen: undefined;
};

type BiometricLoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'BiometricLoginScreen'
>;

const BiometricLoginScreen: React.FC = () => {
  const navigation = useNavigation<BiometricLoginScreenNavigationProp>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleTryAgain = () => {
    // Handle biometric authentication
    console.log('Try biometric authentication');
  };

  const handleLoginWithPin = () => {
    navigation.navigate('PinLoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
        backgroundColor="#FFFFFF"
      />
      
      
      <View style={styles.header}>
       
      </View>

     {/* Title and Description */}
      <View style={styles.contentContainer}>
        <Text style={styles.topTitle}>Quick & Secure</Text>
        <Text style={styles.mainTitle}>Login using biometrics</Text>
        <Text style={styles.descriptionText}>
          Authenticate using your device's biometric credentials.
        </Text>
      </View>
      
      {/* Face ID Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconBorder}>
          <Image
            source={require('../../assets/images/iOS Face ID - Prompt.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
       
      </View>

      {/* Try Again Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={handleTryAgain}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>

      {/* Login with PIN Link */}
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Having Trouble? <Text style={styles.linkTextBlue} onPress={handleLoginWithPin}>Login with PIN</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 28 : 32,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C1C0C8',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contentContainer: {
    alignItems: 'flex-start',
    marginBottom: 48,
    paddingHorizontal: 24,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'left',
    marginBottom: 8,
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
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'left',
    marginBottom: 12,
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
  descriptionText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 20,
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
  iconContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 48,
  },
  iconBorder: {
    width: 203,
    height: 200,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 120,
    height: 120,
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginTop: 8,
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
  iconSize: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
  buttonContainer: {
    marginTop: 220,
    paddingHorizontal: 24,
  },
  tryAgainButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#006DB9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
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
  linkContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  linkTextBlue: {
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

export default BiometricLoginScreen;
