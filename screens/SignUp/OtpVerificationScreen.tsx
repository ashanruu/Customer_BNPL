import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Text,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { MainText, SubText } from '../../components/CustomText';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import CustomButton from '../../components/CustomButton';
import StepIndicator from '../../components/StepIndicator';
import CustomNotification from '../../components/CustomNotification';
import { useNotification } from '../../components/useNotification';
import { callAuthApi } from '../../scripts/api';

const OtpVerificationScreen: React.FC = ({ navigation, route }: any) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Get the phone number from the previous screen
    const { phoneNumber } = route.params || {};
    
    const { notification, showSuccess, showError, hideNotification } = useNotification();
    
    // Format phone number for display (show actual number)
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '+94 xxx xxxx xxx';
        
        // Show first 3 and last 3 digits for security
        if (phone.length >= 6) {
            const first = phone.substring(0, 3);
            const last = phone.substring(phone.length - 3);
            const middle = 'x'.repeat(phone.length - 6);
            return `${first} ${middle} ${last}`;
        }
        return `+94 ${phone}`;
    };

    const handleCodeComplete = (code: string) => {
        setOtp(code);
        setError('');
    };

    const handleVerify = async () => {
        if (otp.length < 6) {
            setError('Please enter the complete OTP');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const payload = {
                phone: phoneNumber,
                otp: otp
            };

            const response = await callAuthApi(
                'VerifyMobileOtp',
                payload,
            );

            console.log('OTP Verification response:', response);

            // Handle successful verification
            if (response.statusCode === 200) {
                showSuccess('OTP verified successfully!');
                setTimeout(() => {
                    navigation.navigate('PersonalInfo', { 
                        phoneNumber: phoneNumber 
                    });
                }, 1500);
            } else {
                showError(response.message || 'OTP verification failed');
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            
            // Extract the server error message
            const errorMessage = error.response?.data?.message || 'OTP verification failed. Please try again.';
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.innerContainer}>
                    <CustomNotification
                        message={notification.message}
                        type={notification.type}
                        visible={notification.visible}
                        duration={notification.duration}
                        onHide={hideNotification}
                    />
                    
                    <View style={styles.contentWrapper}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <MainText size="xlarge" weight="bold" align="left">
                        Enter Verification Code
                    </MainText>
                    <SubText size="medium" align="left" style={styles.subtitle}>
                        We've sent a 6-digit verification code to{'\n'}{formatPhoneNumber(phoneNumber)}
                    </SubText>
                </View>

                {/* Step Indicator */}
                <View style={styles.stepIndicatorWrapper}>
                    <StepIndicator currentStep={2} />
                </View>

                {/* OTP Input */}
                <View style={styles.otpInputWrapper}>
                    <VerificationCodeInput length={6} onCodeComplete={handleCodeComplete} onCodeChange={setOtp} />
                    {!!error && <Text style={styles.errorText}>{error}</Text>}
                </View>

                {/* Verify Button */}
                <CustomButton
                    title="Verify"
                    onPress={handleVerify}
                    loading={loading}
                    style={styles.verifyButton}
                />
            </View>
                </View>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    innerContainer: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
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
        marginTop: 8,
    },
    otpInputWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    verifyButton: {
        marginTop: 16,
    },
    stepIndicatorWrapper: {
        width: '80%',
        maxWidth: 400,
        alignSelf: 'center',
    },

});

export default OtpVerificationScreen;
