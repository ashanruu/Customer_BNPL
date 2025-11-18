import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';
import BottomSheetModal from '../../components/BottomSheetModal';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  RegWithAddressDetailScreen: { mobileNumber: string; nicNumber: string; firstName: string; lastName: string; dateOfBirth: string };
  RegWithAgreementScreen: { mobileNumber: string; nicNumber: string; firstName: string; lastName: string; dateOfBirth: string; province: string; district: string; city: string; streetAddress1: string; streetAddress2: string };
};

type RegWithAddressDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithAddressDetailScreen'
>;

const RegWithAddressDetailScreen: React.FC = () => {
  const navigation = useNavigation<RegWithAddressDetailScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegWithAddressDetailScreen'>>();
  const { mobileNumber, nicNumber, firstName, lastName, dateOfBirth } = route.params || {};
  
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress1, setStreetAddress1] = useState('');
  const [streetAddress2, setStreetAddress2] = useState('');
  
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const provinces = ['Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];
  const districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya'];
  const cities = ['Colombo', 'Nugegoda', 'Maharagama', 'Dehiwala', 'Mount Lavinia', 'Moratuwa'];

  useEffect(() => {
    // Show location modal when screen loads
    const timer = setTimeout(() => {
      setShowLocationModal(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAllowLocation = () => {
    setShowLocationModal(false);
    // Here you can add actual location permission logic
    console.log('Location access allowed');
  };

  const handleNotNow = () => {
    setShowLocationModal(false);
    console.log('Location access denied');
  };

  const handleContinue = () => {
    if (province && district && city && streetAddress1) {
      navigation.navigate('RegWithAgreementScreen', {
        mobileNumber,
        nicNumber,
        firstName,
        lastName,
        dateOfBirth,
        province,
        district,
        city,
        streetAddress1,
        streetAddress2,
      });
    }
  };

  const isFormValid = province && district && city && streetAddress1;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      topTitle="Add your"
      mainTitle="Address details"
      description="Use the same address as on your utility bills or ID."
      buttonText="Continue"
      onButtonPress={handleContinue}
      buttonDisabled={!isFormValid}
      scrollable={true}
    >
      <View style={styles.formContainer}>
        {/* Province Dropdown */}
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setShowProvinceDropdown(!showProvinceDropdown)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownLabel, !province && styles.dropdownPlaceholder]}>
            {province || 'Province'}
            <Text style={styles.required}>*</Text>
          </Text>
          <Icon name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showProvinceDropdown && (
          <View style={styles.dropdownList}>
            {provinces.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setProvince(item);
                  setShowProvinceDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* District Dropdown */}
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setShowDistrictDropdown(!showDistrictDropdown)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownLabel, !district && styles.dropdownPlaceholder]}>
            {district || 'District'}
            <Text style={styles.required}>*</Text>
          </Text>
          <Icon name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showDistrictDropdown && (
          <View style={styles.dropdownList}>
            {districts.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setDistrict(item);
                  setShowDistrictDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* City Dropdown */}
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={() => setShowCityDropdown(!showCityDropdown)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownLabel, !city && styles.dropdownPlaceholder]}>
            {city || 'City'}
            <Text style={styles.required}>*</Text>
          </Text>
          <Icon name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showCityDropdown && (
          <View style={styles.dropdownList}>
            {cities.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setCity(item);
                  setShowCityDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Street Address 1 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            placeholderTextColor="#9CA3AF"
            value={streetAddress1}
            onChangeText={setStreetAddress1}
            autoCapitalize="words"
          />
          <Text style={styles.required}>*</Text>
        </View>

        {/* Street Address 2 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            placeholderTextColor="#9CA3AF"
            value={streetAddress2}
            onChangeText={setStreetAddress2}
            autoCapitalize="words"
          />
          <Text style={styles.required}>*</Text>
        </View>

        {/* Toggle Switches Section */}
        {/* <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleIconContainer}>
              <Icon name="home-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.toggleIconContainer}>
              <Icon name="briefcase-outline" size={24} color="#6B7280" />
            </View>
          </View>
        </View> */}
      </View>

      {/* Location Access Modal */}
      <BottomSheetModal
        visible={showLocationModal}
        onClose={handleNotNow}
        showCloseButton={false}
        showHandle={true}
        height="auto"
        closeOnBackdropPress={false}
      >
        <View style={styles.locationModalContent}>
          {/* Location Icon */}
          <View style={styles.locationIconContainer}>
            <View style={styles.locationIconBackground}>
              <Image
                source={require('../../assets/images/location-icon.png')}
                style={styles.locationIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.locationTitle}>Allow Location Access</Text>

          {/* Description */}
          <Text style={styles.locationDescription}>
            We use your location only for verification purposes to ensure secure and compliant transactions. Please allow access to continue using the app smoothly.
          </Text>

          {/* Allow Button */}
          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllowLocation}
            activeOpacity={0.8}
          >
            <Text style={styles.allowButtonText}>Allow Location Access</Text>
          </TouchableOpacity>

          {/* Not Now Button */}
          <TouchableOpacity
            style={styles.notNowButton}
            onPress={handleNotNow}
            activeOpacity={0.8}
          >
            <Text style={styles.notNowButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dropdownLabel: {
    fontSize: 15,
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
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  required: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    paddingVertical: 18,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  toggleSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationModalContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  locationIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  locationIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    width: 80,
    height: 80,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
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
  locationDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 8,
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
  allowButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#0066CC',
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 12,
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
  allowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
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
  notNowButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    alignItems: 'center',
  },
  notNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
});

export default RegWithAddressDetailScreen;
