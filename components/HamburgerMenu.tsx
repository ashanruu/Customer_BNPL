import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';

interface HamburgerMenuProps {
  // Navigation
  onBackPress?: () => void;
  
  // Appearance
  backgroundColor?: string;
  showBackButton?: boolean;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onBackPress,
  backgroundColor = '#FFFFFF',
  showBackButton = true,
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      {/* Left Section - Back Button */}
      {showBackButton && onBackPress && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <View style={styles.arrowContainer}>
              <View style={styles.arrow} />
            </View>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Center Section - Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Right Section - Placeholder for balance */}
      {showBackButton && <View style={styles.placeholder} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#1F2937',
    transform: [{ rotate: '45deg' }],
    marginLeft: 3,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 50,
    width: 180,
  },
  placeholder: {
    width: 56,
  },
});

export default HamburgerMenu;
