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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import StepIndicator from '../../components/StepIndicator';
import { callAuthApi } from '../../scripts/api';

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

    // Get the phone number from the previous screen
    const { phoneNumber } = route?.params || {};

    const [errors, setErrors] = useState({
        name: '',
        nic: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

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
            newErrors.name = 'Please enter your name';
            valid = false;
        }
        if (!nic.trim()) {
            newErrors.nic = 'Please enter your NIC number';
            valid = false;
        }
        if (!email.trim()) {
            newErrors.email = 'Please enter your email';
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Invalid email format';
            valid = false;
        }
        if (!password.trim()) {
            newErrors.password = 'Please enter a password';
            valid = false;
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleNext = async () => {
        if (!validateFields()) return;

        setLoading(true);

        try {
            const payload = {
                firstName: name.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber,
                nic: nic.trim(),
                password: password,
                userType: 2
            };

            const response = await callAuthApi('RegisterUser', payload);

            console.log('Registration response:', response);

            if (response.statusCode === 200) {
                // Save the token to AsyncStorage
                if (response.payload && response.payload.token) {
                    try {
                        await AsyncStorage.setItem('bearerToken', response.payload.token);
                        console.log('Token saved successfully');
                    } catch (storageError) {
                        console.error('Failed to save token:', storageError);
                    }
                }

                Alert.alert(
                    'Success',
                    'Registration successful!',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('AddressDetails', { 
                                phoneNumber: phoneNumber,
                                personalInfo: {
                                    fullName: name.trim(),
                                    nic: nic.trim(),
                                    email: email.trim(),
                                },
                                userInfo: {
                                    firstName: name.trim(),
                                    email: email.trim(),
                                    nic: nic.trim(),
                                    userType: response.payload?.userType,
                                    token: response.payload?.token
                                }
                            })
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            const errorMessage = error?.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Error', errorMessage);
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
                        <View style={styles.contentWrapper}>
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
                                    Start with the basics
                                </MainText>
                                <SubText size="medium" align="left" style={styles.subtitle}>
                                    Let's get the essentials out of the way
                                </SubText>
                            </View>

                            {/* Step Indicator */}
                            <View style={styles.stepIndicatorWrapper}>
                                <StepIndicator currentStep={3} />
                            </View>

                            {/* Form */}
                            <View style={styles.centeredBox}>
                                <View style={styles.form}>
                                    <CustomInputField
                                        placeholder="Full Name"
                                        value={name}
                                        onChangeText={handleNameChange}
                                        iconName="account-outline"
                                        error={errors.name}
                                        autoCapitalize="words"
                                    />

                                    <CustomInputField
                                        placeholder="NIC Number"
                                        value={nic}
                                        onChangeText={handleNicChange}
                                        iconName="card-account-details-outline"
                                        error={errors.nic}
                                        autoCapitalize="characters"
                                    />

                                    <CustomInputField
                                        placeholder="Email Address"
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        iconName="email-outline"
                                        keyboardType="email-address"
                                        error={errors.email}
                                        autoCapitalize="none"
                                    />

                                    <CustomInputField
                                        placeholder="Password"
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        iconName="lock-outline"
                                        secureTextEntry={true}
                                        error={errors.password}
                                    />

                                    <CustomInputField
                                        placeholder="Re-enter Password"
                                        value={confirmPassword}
                                        onChangeText={handleConfirmPasswordChange}
                                        iconName="lock-check-outline"
                                        secureTextEntry={true}
                                        error={errors.confirmPassword}
                                    />

                                    <CustomButton
                                        title="Next"
                                        onPress={handleNext}
                                        loading={loading}
                                        style={styles.sendButton}
                                    />
                                </View>
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
    keyboardContainer: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
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
        marginTop: 30,
        marginBottom: 20,
    },
    subtitle: {
        color: Colors.light.mutedText,
    },
    form: {
        width: '100%',
    },
    sendButton: {
        marginTop: 24,
    },
    stepIndicatorWrapper: {
        width: '90%',
        maxWidth: 400,
        alignSelf: 'center',
    },
});

export default PersonalInfoScreen;