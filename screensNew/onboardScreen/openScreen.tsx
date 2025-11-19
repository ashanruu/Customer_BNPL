import React, { useEffect } from 'react'; 
import {
  View,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  OpenScreen: undefined;
  LanguageSelectScreen: undefined;
  IntroOneScreen: undefined;
};

type OpenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OpenScreen'>;

interface OpenScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const OpenScreen: React.FC<OpenScreenProps> = ({
  onComplete,
  duration = 2000,
}) => {
  const navigation = useNavigation<OpenScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigation.replace('LanguageSelectScreen');
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 200,
    height: 120,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default OpenScreen;
