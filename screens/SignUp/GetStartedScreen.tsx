import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { callAuthApi, validateCustomer } from '../../scripts/api';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import StepIndicator from '../../components/StepIndicator';

const GetStartedScreen: React.FC = ({ navigation }: any) => {
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const formatPhoneNumber = (text: string): string => {
        // Remove all non-digit characters except +
        const cleaned = text.replace(/[^\d+]/g, '');
        
        // If it starts with +94, format it accordingly
        if (cleaned.startsWith('+94')) {
            const digits = cleaned.substring(3);
            if (digits.length <= 9) {
                return `+94 ${digits}`;
            }
            return `+94 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 9)}`;
        }
        
        // If it starts with 94, add + and format
        if (cleaned.startsWith('94') && cleaned.length > 2) {
            const digits = cleaned.substring(2);
            if (digits.length <= 9) {
                return `+94 ${digits}`;
            }
            return `+94 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5, 9)}`;
        }
        
        // If it starts with 0 (Sri Lankan local format)
        if (cleaned.startsWith('0')) {
            if (cleaned.length <= 10) {
                return cleaned;
            }
            return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)}`;
        }
        
        return cleaned;
    };

    const validatePhoneNumber = (phone: string): { isValid: boolean; message: string } => {
        // Remove all non-digit characters except + for validation
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const digitsOnly = cleanPhone.replace(/\D/g, '');
        
        // Check if phone number is empty
        if (!phone.trim()) {
            return { isValid: false, message: t('signup.enterMobile') };
        }
        
        // Check for Sri Lankan mobile number formats
        if (cleanPhone.startsWith('+94')) {
            // +94 format - should be 12 digits total (+94XXXXXXXXX)
            if (digitsOnly.length !== 12) {
                return { isValid: false, message: t('signup.mobile94Format') };
            }
            // Check if the number after +94 starts with 7 (Sri Lankan mobile pattern)
            const sriLankanDigits = digitsOnly.substring(2); // Remove 94
            if (!sriLankanDigits.startsWith('7')) {
                return { isValid: false, message: t('signup.mobileStart7') };
            }
        } else if (cleanPhone.startsWith('0')) {
            // Local format starting with 0 - should be 10 digits total (0XXXXXXXXX)
            if (digitsOnly.length !== 10) {
                return { isValid: false, message: t('signup.mobile0Format') };
            }
            // Check if it starts with 07 (Sri Lankan mobile pattern)
            if (!digitsOnly.startsWith('07')) {
                return { isValid: false, message: t('signup.mobileStart07') };
            }
        } else {
            // If it doesn't start with +94 or 0, it's not a valid format
            return { isValid: false, message: t('signup.mobileValidFormat') };
        }
        
        return { isValid: true, message: '' };
    };

    const handleSendOTP = async () => {
        // Validate phone number
        const validation = validatePhoneNumber(phoneNumber);
        if (!validation.isValid) {
            setPhoneError(validation.message);
            return;
        }

        setPhoneError('');
        setLoading(true);

        try {
            console.log('Sending OTP to phone number:', phoneNumber.trim());
            
            const response = await callAuthApi(
                "SendMobileOtp",
                {
                    phone: phoneNumber.replace(/\D/g, '') // Send only digits to API
                }
            );

            setLoading(false);

            if (response.statusCode === 200) {
                // Pass the phone number to the next screen
                navigation.navigate('OtpVerification', { 
                    phoneNumber: phoneNumber.trim() 
                });
            } else {
                Alert.alert(t('common.error'), response.message || t('signup.otpSendFailed'));
            }
        } catch (error) {
            setLoading(false);
            console.error('Error during customer validation or OTP sending:', error);
            Alert.alert(t('common.error'), t('signup.requestFailed'));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <MainText size="xlarge" weight="bold" align="left" color={Colors.light.primary}>
                        {t('signup.getStarted')}
                    </MainText>
                    <SubText size="medium" align="left" style={styles.subtitle}>
                        {t('signup.enterMobileToSignup')}
                    </SubText>
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicatorWrapper}>
                    <StepIndicator currentStep={1} />
                </View>


                {/* Form Box */}
                <View style={styles.centeredBox}>
                    <View style={styles.form}>

                        <CustomInputField
                            placeholder={t('signup.mobileNumber')}
                            value={phoneNumber}
                            onChangeText={(text) => {
                                const formatted = formatPhoneNumber(text);
                                setPhoneNumber(formatted);
                                // Clear error when user starts typing
                                if (phoneError) {
                                    setPhoneError('');
                                }
                            }}
                            iconName="phone-outline"
                            keyboardType="phone-pad"
                            error={phoneError}
                        />
                        
                        {!phoneError && (
                            <SubText size="small" align="left" style={styles.helpText}>
                                {t('signup.mobileHelp')}
                            </SubText>
                        )}

                        <CustomButton
                            title={t('signup.sendOtp')}
                            onPress={handleSendOTP}
                            loading={loading}
                            style={styles.sendButton}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    centeredBox: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
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
        marginTop: 50,
        marginBottom: 40,
    },
    subtitle: {
        color: Colors.light.mutedText,
    },
    form: {
        width: '100%',
    },

    sendButton: {
        marginTop: 16,
    },
    stepIndicatorWrapper: {
        width: '80%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    helpText: {
        marginTop: 8,
        marginBottom: 16,
        color: Colors.light.mutedText,
        fontSize: 12,
        lineHeight: 16,
    },

});


export default GetStartedScreen;