import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
} from 'react-native';
import { MainText, SubText, LinkText } from '../../components/CustomText';
import CustomButton from '../../components/CustomButton';
import VerificationCodeInput from '../../components/VerificationCodeInput';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const LogInOtpScreen: React.FC = ({ navigation }: any) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // Disable swipe gesture
    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
    }, [navigation]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleCodeComplete = (completedCode: string) => {
        setCode(completedCode);
        // Auto-verify when code is complete
        handleVerification(completedCode);
    };

    const handleVerification = async (verificationCode?: string) => {
        const codeToVerify = verificationCode || code;

        if (codeToVerify.length !== 4) {
            Alert.alert('Error', 'Please enter the complete verification code');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            if (codeToVerify === '1234') { // Mock verification
                Alert.alert('Success', 'Verification successful!');
                navigation.navigate('Main');
            } else {
                Alert.alert('Error', 'Invalid verification code');
            }
        }, 2000);
    };

    const handleResendCode = () => {
        if (!canResend) return;

        setCanResend(false);
        setResendTimer(60);
        setCode('');

        // Simulate resend API call
        Alert.alert('Code Sent', 'A new verification code has been sent to your phone');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Fixed Header Section - Always Visible */}

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>


            {/* Scrollable Form Section */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        <View style={styles.formContainer}>
                            {/* Header */}
                            <View style={styles.header}>
                                <MainText size="xlarge" weight="bold" >
                                    Enter Verification Code
                                </MainText>
                                <SubText size="medium" style={styles.subtitle}>
                                    A 4 digit code has been sent to{'\n'}+94 xx xxx xx99
                                </SubText>
                            </View>

                            {/* Verification Code Input */}
                            <VerificationCodeInput
                                length={4}
                                onCodeComplete={handleCodeComplete}
                                onCodeChange={setCode}
                                autoFocus
                            />

                            {/* Verify Button */}
                            <CustomButton
                                title={loading ? "Verifying..." : "Verify"}
                                style={{ marginTop: 30 }}
                                onPress={() => handleVerification()}
                                loading={loading}
                                disabled={code.length !== 4 || loading}
                            />

                            {/* Resend Code */}
                            <View style={styles.resendContainer}>
                                {canResend ? (
                                    <LinkText
                                        style={{ fontSize: 14 }}
                                        onPress={handleResendCode}
                                    >
                                        Resend OTP
                                    </LinkText>
                                ) : (
                                    <SubText size="small" style={styles.mutedText}>
                                        Resend OTP in {resendTimer}s
                                    </SubText>
                                )}
                            </View>
                        </View>
                    </ScrollView>
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
    backButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'hsla(0, 8%, 22%, 0.20)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    header: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        elevation: 2,
    },
    subtitle: {
        marginTop: 12,
        lineHeight: 20,
        textAlign: 'center',
        color: Colors.light.mutedText,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        marginTop: 20,
        backgroundColor: Colors.light.background,
    },
    formContainer: {
        paddingHorizontal: 24,
        paddingTop: 120,
        paddingBottom: 100,
        minHeight: 400,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 24,
    },
    mutedText: {
        color: Colors.light.mutedText,
        fontSize: 14,
    },
});

export default LogInOtpScreen;
