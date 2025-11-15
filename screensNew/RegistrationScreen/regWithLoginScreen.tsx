import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  RegWithLoginScreen: undefined;
  DashboardScreen: undefined;
};

type RegWithLoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithLoginScreen'
>;

const RegWithLoginScreen: React.FC = () => {
  const navigation = useNavigation<RegWithLoginScreenNavigationProp>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [topSectionHeight] = useState(new Animated.Value(1));

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(topSectionHeight, {
          toValue: 0.4,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(topSectionHeight, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [topSectionHeight]);

  const handleLogin = () => {
    if (mobileNumber.length > 0 && password.length > 0) {
      // Handle login logic
      navigation.navigate('DashboardScreen');
    }
  };

  const isFormValid = mobileNumber.length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      {/* Top Section with Success Badge */}
      <Animated.View 
        style={[
          styles.topSection, 
          { 
            flex: topSectionHeight,
          }
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.topSectionContent}
        >
          <View style={styles.iconContainer}>
            <View style={styles.successBadge}>
              <Icon name="check" size={50} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.title}>Good News</Text>
            <Text style={styles.description}>
              Your account has been approved.{'\n'}
              You can now log in and start using{'\n'}
              PayMedia BNPL.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Bottom Section with Login Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomSection}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative Line */}
          <View style={styles.decorativeLine} />

          <Text style={styles.formTitle}>Let's login to your account</Text>

          {/* Mobile Number Input */}
          <View style={styles.inputWrapper}>
            {mobileNumber === '' && (
              <View style={styles.placeholderContainer} pointerEvents="none">
                <Text style={styles.placeholderText}>Mobile Number</Text>
                <Text style={styles.placeholderAsterisk}>*</Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor="#6B7280"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            {password === '' && (
              <View style={styles.placeholderContainer} pointerEvents="none">
                <Text style={styles.placeholderText}>Password</Text>
                <Text style={styles.placeholderAsterisk}>*</Text>
              </View>
            )}
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder=""
              placeholderTextColor="#6B7280"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              !isFormValid && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cececeff',
  },
  topSection: {
    backgroundColor: '#F9FAFB',
  },
  topSectionContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: 'center',
    flexGrow: 1,
  },
  iconContainer: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  messageContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'left',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'left',
    lineHeight: 22,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 12,
    alignSelf: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 15,
    padding: 4,
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
    color: '#6B7280',
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
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0066CC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loginButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  loginButtonText: {
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

export default RegWithLoginScreen;
