import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
       
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Text */}
        <Text style={styles.subHeaderText}>Verify your details</Text>
        <Text style={styles.mainTitle}>Boost Your Credit Power..</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  placeholder: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1F2937',
    marginTop: 6,
    marginBottom: 8,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
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
