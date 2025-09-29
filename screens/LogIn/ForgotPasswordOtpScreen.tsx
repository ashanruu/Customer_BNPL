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
import CustomNotification from '../../components/CustomNotification';
import { useNotification } from '../../components/useNotification';
import { verifyRecoveryOtp, forgotPassword } from '../../scripts/api';

const ForgotPasswordOtpScreen: React.FC = ({ navigation, route }: any) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    
    // Get the email and otpReferenceNum from the previous screen
    const { email, otpReferenceNum } = route.params || {};
    
    const { notification, showSuccess, showError, hideNotification } = useNotification();
    
    // Format email for display (show first 2 chars and domain)
    const formatEmail = (email: string) => {
        if (!email) return 'your email';
        
        const [localPart, domain] = email.split('@');
        if (localPart && domain) {
            const maskedLocal = localPart.charAt(0) + 
                               'x'.repeat(Math.max(0, localPart.length - 2)) + 
                               (localPart.length > 1 ? localPart.charAt(localPart.length - 1) : '');
            return `${maskedLocal}@${domain}`;
        }
        return email;
    };

    const handleCodeComplete = (code: string) => {
        setOtp(code);
        setError('');
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setError('Please enter the complete OTP');
            return;
        }
        
        if (!otpReferenceNum) {
            showError('OTP reference number is missing. Please try again.');
            return;
        }
        
        setError('');
        setLoading(true);

        try {
            const response = await verifyRecoveryOtp(otpReferenceNum, otp);

            console.log('OTP Verification response:', response);

            if (response.statusCode === 200) {
                showSuccess('OTP verified successfully!');
                setTimeout(() => {
                    // Navigate to reset password screen with recovery reference number
                    navigation.navigate('ResetPassword', { 
                        email: email,
                        recoveryReferenceNum: response.payload?.recoveryReferenceNum
                    });
                }, 1500);
            } else {
                showError(response.message || 'OTP verification failed');
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'OTP verification failed. Please try again.';
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setResendLoading(true);

        try {
            // Call the forgot password API again to resend OTP
            const response = await forgotPassword(email);

            if (response.statusCode === 200 || response.success) {
                showSuccess('New OTP sent to your email!');
                setOtp(''); // Clear current OTP
                
                // Update the otpReferenceNum if it changed
                const newOtpReferenceNum = response.payload?.otpReferenceNum || response.otpReferenceNum;
                if (newOtpReferenceNum && newOtpReferenceNum !== otpReferenceNum) {
                    // Update the route params with new reference number
                    navigation.setParams({ 
                        otpReferenceNum: newOtpReferenceNum 
                    });
                }
            } else {
                showError(response.message || 'Failed to resend OTP');
            }
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'Failed to resend OTP. Please try again.';
            showError(errorMessage);
        } finally {
            setResendLoading(false);
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
                                We've sent a 6-digit verification code to{'\n'}{formatEmail(email)}
                            </SubText>
                        </View>

                        {/* OTP Input */}
                        <View style={styles.otpInputWrapper}>
                            <VerificationCodeInput 
                                length={6} 
                                onCodeComplete={handleCodeComplete} 
                                onCodeChange={setOtp} 
                            />
                            {!!error && <Text style={styles.errorText}>{error}</Text>}
                        </View>

                        {/* Verify Button */}
                        <CustomButton
                            title="Verify OTP"
                            onPress={handleVerifyOtp}
                            loading={loading}
                            style={styles.verifyButton}
                        />

                        {/* Resend OTP */}
                        <View style={styles.resendRow}>
                            <SubText size="small" style={styles.mutedText}>
                                Didn't receive the code?{' '}
                            </SubText>
                            <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                                <SubText
                                    size="small"
                                    style={{
                                        ...styles.linkText,
                                        ...(resendLoading ? styles.disabledText : {}),
                                    }}
                                >
                                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                                </SubText>
                            </TouchableOpacity>
                        </View>
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
        color: '#EF4444',
        textAlign: 'center',
    },
    verifyButton: {
        marginTop: 16,
    },
    resendRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    mutedText: {
        color: Colors.light.mutedText,
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    disabledText: {
        opacity: 0.5,
    },
});

export default ForgotPasswordOtpScreen;