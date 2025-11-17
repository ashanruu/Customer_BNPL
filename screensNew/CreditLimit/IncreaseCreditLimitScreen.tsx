import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenTemplate from '../../components/ScreenTemplate';

interface CreditBoostOption {
  id: number;
  amount: string;
  title: string;
  description: string;
  icon: string;
  actionIcon?: 'upload' | 'camera' | 'plus';
}

const IncreaseCreditLimitScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const bannerImages = [
    require('../../assets/images/family.png'),
    require('../../assets/images/fashionbug.png'),
    require('../../assets/images/fashionbug2.png'),
    require('../../assets/images/fashionbug3.png'),
    require('../../assets/images/fashionbug4.png'),
    require('../../assets/images/fashionbug5.png'),
    require('../../assets/images/fashionbug6.png'),
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const creditBoostOptions: CreditBoostOption[] = [
    {
      id: 1,
      amount: 'Rs. 5,000',
      title: 'by uploading ID',
      description: 'Upload a valid ID to verify identity',
      icon: 'card-account-details-outline',
      actionIcon: 'upload',
    },
    {
      id: 2,
      amount: 'Rs. 6,000',
      title: 'by checking likeness',
      description: 'Verify your face with a selfie',
      icon: 'face-recognition',
      actionIcon: 'camera',
    },
    {
      id: 3,
      amount: 'Rs. 3,000',
      title: 'by uploading utility bill',
      description: 'Upload a recent utility bill for address proof',
      icon: 'file-document-outline',
      actionIcon: 'upload',
    },
    {
      id: 4,
      amount: 'Rs. 2,000',
      title: 'by uploading salary slip',
      description: 'Upload your salary slip for income verification',
      icon: 'file-chart-outline',
      actionIcon: 'upload',
    },
    {
      id: 5,
      amount: 'Rs. 4,000',
      title: 'by linking FD account',
      description: 'Link your Fixed Deposit account',
      icon: 'bank-outline',
      actionIcon: 'plus',
    },
  ];

  const handleOptionPress = (option: CreditBoostOption) => {
    console.log('Selected option:', option.title);
    // Navigate to respective verification screen based on option
  };

  const getActionIcon = (actionIcon?: 'upload' | 'camera' | 'plus') => {
    switch (actionIcon) {
      case 'upload':
        return 'upload';
      case 'camera':
        return 'camera';
      case 'plus':
        return 'plus';
      default:
        return 'chevron-right';
    }
  };

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      topTitle="Verify your details"
      mainTitle="Boost Your Credit Power.."
      buttonText="Continue"
      showSecondaryButton={false}
      onButtonPress={() => {
        // Handle continue action
        console.log('Continue pressed');
      
      }}
      scrollable={true}
      backgroundColor="#FFFFFF"
      buttonColor="#0066CC"
    >
      {/* Credit Boost Options */}
      <View style={styles.optionsWrapper}>
        {creditBoostOptions.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => handleOptionPress(option)}
            activeOpacity={0.7}
          >
            <View style={styles.optionLeft}>
             
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionAmount}>{option.amount}</Text>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </View>
            <View style={styles.actionIconContainer}>
              <Icon 
                name={getActionIcon(option.actionIcon)} 
                size={20} 
                color="#6B7280" 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info Banner with Auto-Rotating Images */}
      <View style={styles.infoBanner}>
        <Image
          source={bannerImages[currentImageIndex]}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {bannerImages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentImageIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  optionsWrapper: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },

  optionAmount: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  optionDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 16,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  actionIconContainer: {
    padding: 8,
    marginTop: 4,
  },
  infoBanner: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: '#FFFFFF',
    opacity: 1,
  },
});

export default IncreaseCreditLimitScreen;
