import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Modal,
} from 'react-native';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import StepIndicator from '../../components/StepIndicator';
import { validatePassword, validatePasswordConfirmation } from '../../utils/authUtils';
import { useTranslation } from 'react-i18next';

// Date Picker Component
interface DatePickerProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    onCancel: () => void;
}

const DatePickerComponent: React.FC<DatePickerProps> = ({ selectedDate, onDateSelect, onCancel }) => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100; // Allow up to 100 years old
    const maxYear = currentYear - 18; // Must be at least 18 years old
    
    const [selectedDay, setSelectedDay] = useState(selectedDate?.getDate() || 1);
    const [selectedMonth, setSelectedMonth] = useState(selectedDate?.getMonth() || 0);
    const [selectedYear, setSelectedYear] = useState(selectedDate?.getFullYear() || maxYear);
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
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
        <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
            
            {/* Dropdown Selectors */}
            <View style={styles.dropdownContainer}>
                {/* Day Selector */}
                <View style={styles.dropdownSection}>
                    <Text style={styles.dropdownLabel}>Day</Text>
                    <View style={styles.dropdownScroll}>
                        <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={false}>
                            {generateDays().map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dropdownItem,
                                        selectedDay === day && styles.selectedDropdownItem
                                    ]}
                                    onPress={() => setSelectedDay(day)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedDay === day && styles.selectedDropdownItemText
                                    ]}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                
                {/* Month Selector */}
                <View style={styles.dropdownSection}>
                    <Text style={styles.dropdownLabel}>Month</Text>
                    <View style={styles.dropdownScroll}>
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            {months.map((month, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dropdownItem,
                                        selectedMonth === index && styles.selectedDropdownItem
                                    ]}
                                    onPress={() => setSelectedMonth(index)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedMonth === index && styles.selectedDropdownItemText
                                    ]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                
                {/* Year Selector */}
                <View style={styles.dropdownSection}>
                    <Text style={styles.dropdownLabel}>Year</Text>
                    <View style={styles.dropdownScroll}>
                        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                            {generateYears().map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    style={[
                                        styles.dropdownItem,
                                        selectedYear === year && styles.selectedDropdownItem
                                    ]}
                                    onPress={() => setSelectedYear(year)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedYear === year && styles.selectedDropdownItemText
                                    ]}>
                                        {year}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </View>
            
            {/* Selected Date Display */}
            <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateLabel}>Selected Date:</Text>
                <Text style={styles.selectedDateText}>
                    {months[selectedMonth]} {selectedDay}, {selectedYear}
                </Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.datePickerActions}>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface PersonalInfoScreenProps {
    navigation: any;
    route: any;
}

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({ navigation, route }) => {
    const [name, setName] = useState('');
    const [nic, setNic] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const scrollViewRef = useRef<ScrollView>(null);
    const { t } = useTranslation();

    // Get the phone number from the previous screen
    const { phoneNumber } = route?.params || {};

    const [errors, setErrors] = useState({
        name: '',
        nic: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
    });

    const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                // Auto scroll when keyboard appears
                setTimeout(() => {
                    if (scrollViewRef.current) {
                        scrollViewRef.current.scrollTo({
                            y: 100,
                            animated: true,
                        });
                    }
                }, 100);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    // Validate age (18+)
    const validateAge = (date: Date | null) => {
        if (!date) return { isValid: false, message: t('signup.enterDateOfBirth') };
        
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        
        // Calculate actual age considering months and days
        let actualAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            actualAge = age - 1;
        }
        
        if (actualAge < 18) {
            return { isValid: false, message: t('signup.ageRequirement') };
        }
        
        // Check if date is not in the future
        if (date > today) {
            return { isValid: false, message: t('signup.futureDateError') };
        }
        
        return { isValid: true, message: '' };
    };

    const validateFields = () => {
        let valid = true;
        const newErrors = { name: '', nic: '', email: '', password: '', confirmPassword: '', dateOfBirth: '' };

        if (!name.trim()) {
            newErrors.name = t('signup.enterName');
            valid = false;
        }
        if (!nic.trim()) {
            newErrors.nic = t('signup.enterNic');
            valid = false;
        }
        if (!email.trim()) {
            newErrors.email = t('signup.enterEmail');
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = t('auth.invalidEmail');
            valid = false;
        }

        // Validate date of birth
        const ageValidation = validateAge(selectedDate);
        if (!ageValidation.isValid) {
            newErrors.dateOfBirth = ageValidation.message;
            valid = false;
        }

        // Validate password using authUtils
        if (!password.trim()) {
            newErrors.password = t('signup.enterPassword');
            valid = false;
        } else {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.isValid) {
                newErrors.password = passwordValidation.errors[0]; // Show first error
                valid = false;
            }
        }

        // Validate password confirmation
        const confirmationValidation = validatePasswordConfirmation(password, confirmPassword);
        if (!confirmationValidation.isValid) {
            newErrors.confirmPassword = confirmationValidation.message || '';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleNext = async () => {
        if (!validateFields()) return;

        setLoading(true);

        try {
            // Prepare personal info data to pass to next screen
            const personalInfo = {
                fullName: name.trim(),
                nic: nic.trim(),
                email: email.trim(),
                password: password,
                dateOfBirth: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
            };

            // Navigate to AddressDetails with personal info
            navigation.navigate('AddressDetails', { 
                phoneNumber: phoneNumber,
                personalInfo: personalInfo,
            });
        } catch (error: any) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Failed to proceed to next step. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Clear errors when user starts typing
    const handleNameChange = (text: string) => {
        setName(text);
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleNicChange = (text: string) => {
        setNic(text);
        if (errors.nic) {
            setErrors(prev => ({ ...prev, nic: '' }));
        }
    };

    const handleEmailChange = (text: string) => {
        setEmail(text);
        if (errors.email) {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (errors.password) {
            setErrors(prev => ({ ...prev, password: '' }));
        }
        
        // Update password strength in real-time
        if (text.trim()) {
            const validation = validatePassword(text);
            setPasswordStrength(validation.strength);
        } else {
            setPasswordStrength(null);
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
        if (errors.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    const openDatePicker = () => {
        setShowDatePicker(true);
        if (errors.dateOfBirth) {
            setErrors(prev => ({ ...prev, dateOfBirth: '' }));
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setDateOfBirth(date.toLocaleDateString('en-CA')); // YYYY-MM-DD format
        setShowDatePicker(false);
    };

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.mainWrapper}>
                        {/* Fixed Header Section */}
                        <View style={styles.fixedHeader}>
                            {/* Back Button */}
                            <TouchableOpacity 
                                style={styles.backButton} 
                                onPress={() => navigation.goBack()}
                            >
                                <MaterialCommunityIcons 
                                    name="arrow-left" 
                                    size={20} 
                                    color="#374151" 
                                />
                            </TouchableOpacity>

                            {/* Header */}
                            <View style={styles.header}>
                                <MainText size="xlarge" weight="bold" align="left" color={Colors.light.primary}>
                                    {t('signup.startBasics')}
                            </MainText>
                            <SubText size="medium" align="left" style={styles.subtitle}>
                                {t('signup.startBasicsSubtitle')}
                            </SubText>
                            </View>

                            {/* Step Indicator */}
                            <View style={styles.stepIndicatorWrapper}>
                                <StepIndicator currentStep={3} />
                            </View>
                        </View>

                        {/* Scrollable Form Section */}
                        <ScrollView 
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={[
                                styles.scrollContainer,
                                { paddingBottom: Math.max(80, keyboardHeight / 3) }
                            ]}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            bounces={false}
                        >
                            {/* Form */}
                            <View style={styles.centeredBox}>
                                <View style={styles.form}>
                                    <CustomInputField
                                        placeholder={t('signup.fullName')}
                                        value={name}
                                        onChangeText={handleNameChange}
                                        iconName="account-outline"
                                        error={errors.name}
                                        autoCapitalize="words"
                                    />

                                    <CustomInputField
                                        placeholder={t('signup.nicNumber')}
                                        value={nic}
                                        onChangeText={handleNicChange}
                                        iconName="card-account-details-outline"
                                        error={errors.nic}
                                        autoCapitalize="characters"
                                    />

                                    <CustomInputField
                                        placeholder={t('signup.emailAddress')}
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        iconName="email-outline"
                                        keyboardType="email-address"
                                        error={errors.email}
                                        autoCapitalize="none"
                                    />

                                    <TouchableOpacity 
                                        style={[styles.datePickerButton, errors.dateOfBirth && styles.datePickerError]} 
                                        onPress={openDatePicker}
                                    >
                                        <View style={styles.datePickerContent}>
                                            <Text style={[
                                                styles.datePickerText,
                                                !selectedDate && styles.datePickerPlaceholder
                                            ]}>
                                                {selectedDate ? formatDisplayDate(selectedDate) : t('signup.dateOfBirth')}
                                            </Text>
                                            <Text style={styles.calendarIcon}>📅</Text>
                                        </View>
                                    </TouchableOpacity>
                                    {errors.dateOfBirth ? (
                                        <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
                                    ) : null}

                                    <CustomInputField
                                        placeholder={t('common.password')}
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        iconName="lock-outline"
                                        secureTextEntry={true}
                                        error={errors.password}
                                    />

                                    {/* Password Requirements */}
                                    {password.length > 0 && (
                                        <View style={styles.requirementsContainer}>
                                            <SubText size="small" style={styles.requirementsTitle}>
                                                {t('password.requirements')}
                                            </SubText>
                                            <SubText size="small" style={{
                                                ...styles.requirement,
                                                ...((/(?=.*[a-z])/.test(password)) && styles.requirementMet)
                                            }}>
                                                • {t('password.lowercase')}
                                            </SubText>
                                            <SubText size="small" style={{
                                                ...styles.requirement,
                                                ...((/(?=.*[A-Z])/.test(password)) && styles.requirementMet)
                                            }}>
                                                • {t('password.uppercase')}
                                            </SubText>
                                            <SubText size="small" style={{
                                                ...styles.requirement,
                                                ...((/(?=.*\d)/.test(password)) && styles.requirementMet)
                                            }}>
                                                • {t('password.number')}
                                            </SubText>
                                            <SubText size="small" style={{
                                                ...styles.requirement,
                                                ...((/(?=.[!@#$%^&()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(password)) && styles.requirementMet)
                                            }}>
                                                • {t('password.special')}
                                            </SubText>
                                            <SubText size="small" style={{
                                                ...styles.requirement,
                                                ...((password.length >= 8) && styles.requirementMet)
                                            }}>
                                                • {t('password.minLength')}
                                            </SubText>
                                        </View>
                                    )}

                                    {/* Password Strength Indicator */}
                                    {passwordStrength && (
                                        <View style={styles.strengthContainer}>
                                            <View style={styles.strengthBar}>
                                                <View 
                                                    style={[
                                                        styles.strengthFill,
                                                        {
                                                            width: passwordStrength === 'weak' ? '33%' : 
                                                                   passwordStrength === 'medium' ? '66%' : '100%',
                                                            backgroundColor: passwordStrength === 'weak' ? '#EF4444' :
                                                                           passwordStrength === 'medium' ? '#F59E0B' : '#10B981'
                                                        }
                                                    ]}
                                                />
                                            </View>
                                            <SubText 
                                                size="small" 
                                                style={{
                                                    ...styles.strengthText,
                                                    color: passwordStrength === 'weak' ? '#EF4444' :
                                                           passwordStrength === 'medium' ? '#F59E0B' : '#10B981'
                                                }}
                                            >
                                                {t('password.strength')} {t(`password.${passwordStrength}`)}
                                            </SubText>
                                        </View>
                                    )}

                                    <CustomInputField
                                        placeholder={t('signup.reenterPassword')}
                                        value={confirmPassword}
                                        onChangeText={handleConfirmPasswordChange}
                                        iconName="lock-check-outline"
                                        secureTextEntry={true}
                                        error={errors.confirmPassword}
                                    />

                                    <TouchableOpacity
                                        style={[
                                            styles.sendButton,
                                            loading && styles.disabledButton
                                        ]}
                                        onPress={handleNext}
                                        disabled={loading}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.buttonText}>
                                            {loading ? t('common.loading') || 'Loading...' : t('common.next')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

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
                            <Text style={styles.modalTitle}>{t('signup.selectDateOfBirth')}</Text>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    keyboardContainer: {
        flex: 1,
    },
    mainWrapper: {
        flex: 1,
        paddingHorizontal: 20,
    },
    fixedHeader: {
        paddingTop: 16,
        paddingBottom: 10,
        backgroundColor: Colors.light.background,
        // Add these properties to ensure it stays fixed
        zIndex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingTop: 20,
    },
    centeredBox: {
        flex: 1,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        // Remove any height constraints
    },
    form: {
        width: '100%',
        // Add minimum height to ensure scrolling
        minHeight: 200,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 20,
    },
    subtitle: {
        color: Colors.light.mutedText,
    },
    sendButton: {
        marginTop: 24,
        marginBottom: 40, // Add bottom margin for better spacing
        backgroundColor: Colors.light.tint || Colors.light.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        // Elevation for Android
        elevation: 5,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
        opacity: 0.6,
    },
    buttonText: {
        color: Colors.light.background || '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    stepIndicatorWrapper: {
        width: '80%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    requirementsContainer: {
        marginTop: 8,
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    requirementsTitle: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '600',
        marginBottom: 6,
    },
    requirement: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    requirementMet: {
        color: '#10B981',
    },
    strengthContainer: {
        marginTop: 8,
        marginBottom: 16,
    },
    strengthBar: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
    },
    strengthFill: {
        height: '100%',
        borderRadius: 2,
    },
    strengthText: {
        marginTop: 4,
        fontSize: 12,
    },
    // Date Picker Styles
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 4,
    },
    datePickerError: {
        borderColor: '#EF4444',
    },
    datePickerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerText: {
        fontSize: 16,
        color: '#1F2937',
    },
    datePickerPlaceholder: {
        color: '#9CA3AF',
    },
    calendarIcon: {
        fontSize: 18,
        color: '#6B7280',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
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
    datePickerContainer: {
        width: '100%',
    },
    datePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 20,
    },
    dropdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dropdownSection: {
        flex: 1,
        marginHorizontal: 4,
    },
    dropdownLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    dropdownScroll: {
        height: 150,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    dropdownScrollView: {
        flex: 1,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    selectedDropdownItem: {
        backgroundColor: Colors.light.primary,
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
    },
    selectedDropdownItemText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    selectedDateContainer: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
    },
    selectedDateLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    selectedDateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    datePickerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        marginRight: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        marginLeft: 10,
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default PersonalInfoScreen;