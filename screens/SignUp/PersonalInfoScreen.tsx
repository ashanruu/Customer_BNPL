import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import StepIndicator from '../../components/StepIndicator';
import { validatePassword, validatePasswordConfirmation } from '../../utils/authUtils';
import { useTranslation } from 'react-i18next';

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

    const validateFields = () => {
        let valid = true;
        const newErrors = { name: '', nic: '', email: '', password: '', confirmPassword: '' };

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
                                <MainText size="xlarge" weight="bold" align="left">
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

                                    <CustomButton
                                        title={t('common.next')}
                                        onPress={handleNext}
                                        loading={loading}
                                        style={styles.sendButton}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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
});

export default PersonalInfoScreen;