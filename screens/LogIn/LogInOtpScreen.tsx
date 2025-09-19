import React, { useState, useEffect } from 'react'; 
import {
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
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
    const themeColors = Colors[colorScheme ?? 'light']; // fallback to 'light' if undefined

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
            <View style={styles.content}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>

                {/* Centered content */}
                <View style={styles.centeredContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <MainText size="xlarge" color="#374151">
                            Enter Verification Code
                        </MainText>
                        <SubText style={styles.subtitle}>
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
                        title="Verify"
                        onPress={() => handleVerification()}
                        loading={loading}
                        disabled={code.length !== 4}
                        style={styles.verifyButton}
                    />

                    {/* Resend Code */}
                    <View style={styles.resendContainer}>
                        {canResend ? (
                            <LinkText onPress={handleResendCode}>
                                Resend OTP
                            </LinkText>
                        ) : (
                            <SubText size="small">
                                Resend OTP in {resendTimer}s
                            </SubText>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    subtitle: {
        marginTop: 12,
        lineHeight: 20,
        textAlign: 'center',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch', 
    },
    verifyButton: {
        marginTop: 40,
        marginBottom: 24,
        width: '100%',  // add this line
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
});

export default LogInOtpScreen;
