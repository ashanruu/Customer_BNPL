import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  RegWithPersonalDetailsScreen: { mobileNumber: string; nicNumber: string };
  RegWithAgreementScreen: undefined;
};

type RegWithPersonalDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithPersonalDetailsScreen'
>;

// Date Picker Component with inline styles
interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onCancel: () => void;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect, onCancel }) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 18;
  
  const [selectedDay, setSelectedDay] = useState(selectedDate?.getDate() || 1);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate?.getMonth() || 0);
  const [selectedYear, setSelectedYear] = useState(selectedDate?.getFullYear() || maxYear);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const generateYears = () => {
    const years = [];
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year);
    }
    return years;
  };
  
  const generateDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };
  
  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onDateSelect(date);
  };
  
  return (
    <View style={{ width: '100%' }}>
      {/* Dropdown Selectors */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        {/* Day Selector */}
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' }}>Day</Text>
          <View style={{ height: 150, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFFFFF' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {generateDays().map((day) => (
                <TouchableOpacity
                  key={day}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                    backgroundColor: selectedDay === day ? '#4B5563' : 'transparent'
                  }}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={{
                    fontSize: 14,
                    textAlign: 'center',
                    color: selectedDay === day ? '#FFFFFF' : '#374151',
                    fontWeight: selectedDay === day ? '600' : '400'
                  }}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        {/* Month Selector */}
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' }}>Month</Text>
          <View style={{ height: 150, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFFFFF' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                    backgroundColor: selectedMonth === index ? '#4B5563' : 'transparent'
                  }}
                  onPress={() => setSelectedMonth(index)}
                >
                  <Text style={{
                    fontSize: 14,
                    textAlign: 'center',
                    color: selectedMonth === index ? '#FFFFFF' : '#374151',
                    fontWeight: selectedMonth === index ? '600' : '400'
                  }}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        {/* Year Selector */}
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' }}>Year</Text>
          <View style={{ height: 150, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#FFFFFF' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {generateYears().map((year) => (
                <TouchableOpacity
                  key={year}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                    backgroundColor: selectedYear === year ? '#4B5563' : 'transparent'
                  }}
                  onPress={() => setSelectedYear(year)}
                >
                  <Text style={{
                    fontSize: 14,
                    textAlign: 'center',
                    color: selectedYear === year ? '#FFFFFF' : '#374151',
                    fontWeight: selectedYear === year ? '600' : '400'
                  }}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
      
      {/* Selected Date Display */}
      <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, marginBottom: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Selected Date:</Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
          {months[selectedMonth]} {selectedDay}, {selectedYear}
        </Text>
      </View>
      
      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
        <TouchableOpacity 
          onPress={onCancel} 
          style={{ flex: 1, paddingVertical: 12, marginRight: 10, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, color: '#374151', fontWeight: '500' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleConfirm} 
          style={{ flex: 1, paddingVertical: 12, marginLeft: 10, backgroundColor: '#4B5563', borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '600' }}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RegWithPersonalDetailsScreen: React.FC = () => {
  const navigation = useNavigation<RegWithPersonalDetailsScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'RegWithPersonalDetailsScreen'>>();
  const { mobileNumber, nicNumber } = route.params || {};
    
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDateOfBirth(formatDisplayDate(date));
    setShowDatePicker(false);
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

   const handleNext = async () => {
          if (!validateFields()) return;
  
          setLoading(true);
  
          try {
              // Prepare personal info data to pass to next screen
              const personalInfo = {
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  dateOfBirth: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
              };
  
              // Navigate to AddressDetails with personal info
              navigation.navigate('AddressDetails', { 
                  phoneNumber: mobileNumber,
                  nicNumber: nicNumber,
              });
          } catch (error: any) {
              console.error('Navigation error:', error);
              Alert.alert('Error', 'Failed to proceed to next step. Please try again.');
          } finally {
              setLoading(false);
          }
      };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const isFormValid = firstName.length > 0 && lastName.length > 0 && dateOfBirth.length > 0;

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={handleBackPress}
      showSkipButton={false}
      topTitle="Let's get to"
      mainTitle="Know you by your name"
      description="Enter your first and last name as shown on your ID."
      buttonText="Next"
      onButtonPress={handleNext}
      buttonDisabled={!isFormValid}
      scrollable={false}
    >
      <View style={styles.contentContainer}>
        {/* First Name Input */}
        <View style={styles.inputWrapper}>
          {firstName === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>First name</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={firstName}
            onChangeText={setFirstName}
            keyboardType="default"
            autoCapitalize="words"
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputWrapper}>
          {lastName === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Last name</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder=""
            placeholderTextColor="#4B5563"
            value={lastName}
            onChangeText={setLastName}
            keyboardType="default"
            autoCapitalize="words"
          />
        </View>

        {/* Date of Birth Input */}
        <TouchableOpacity 
          style={styles.inputWrapper}
          onPress={handleDatePress}
          activeOpacity={0.7}
        >
          {dateOfBirth === '' && (
            <View style={styles.placeholderContainer} pointerEvents="none">
              <Text style={styles.placeholderText}>Date of birth</Text>
              <Text style={styles.placeholderAsterisk}>*</Text>
            </View>
          )}
          <View style={styles.dateInputContainer}>
            <View style={[styles.input, styles.dateInput]}>
              {dateOfBirth !== '' && (
                <Text style={styles.dateText}>{dateOfBirth}</Text>
              )}
            </View>
            <View style={styles.calendarIcon} pointerEvents="none">
              <View style={styles.calendarIconContainer}>
                <View style={styles.calendarTop} />
                <View style={styles.calendarBody}>
                  <View style={styles.calendarRow}>
                    <View style={styles.calendarDot} />
                    <View style={styles.calendarDot} />
                    <View style={styles.calendarDot} />
                  </View>
                  <View style={styles.calendarRow}>
                    <View style={styles.calendarDot} />
                    <View style={styles.calendarDot} />
                    <View style={styles.calendarDot} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <DatePickerComponent
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
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
  dateInputContainer: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 50,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#111827',
    paddingTop: 16,
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
  calendarIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  calendarIconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarTop: {
    width: 18,
    height: 3,
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginBottom: 1,
  },
  calendarBody: {
    width: 18,
    height: 13,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1F2937',
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 2,
    justifyContent: 'space-between',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  calendarDot: {
    width: 2,
    height: 2,
    backgroundColor: '#1F2937',
    borderRadius: 1,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
});

export default RegWithPersonalDetailsScreen;
