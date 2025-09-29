import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { callAuthApi, validateCustomer } from '../../scripts/api';
import { MainText, SubText } from '../../components/CustomText';
import CustomInputField from '../../components/CustomInputField';
import CustomButton from '../../components/CustomButton';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import StepIndicator from '../../components/StepIndicator';

const GetStartedScreen: React.FC = ({ navigation }: any) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const handleSendOTP = async () => {
        if (!phoneNumber.trim()) {
            setPhoneError('Please enter your mobile number');
            return;
        }

        setPhoneError('');
        setLoading(true);

        try {
            // First, validate the customer
            console.log('Validating customer with phone number:', phoneNumber.trim());
            
            const validateResponse = await validateCustomer(phoneNumber.trim());

            console.log('Customer validation response:', validateResponse);

            // Check if validation was successful
            if (validateResponse.statusCode !== 200) {
                setLoading(false);
                Alert.alert('Validation Error', validateResponse.message || 'Customer validation failed');
                return;
            }

            // Check the success status and message from the validation response
            const validationData = validateResponse.data || validateResponse.payload || validateResponse;
            
            if (!validationData.success) {
                setLoading(false);
                // Handle specific error messages
                if (validationData.message === "Phone number is required") {
                    Alert.alert('Validation Error', 'Phone number is required');
                } else if (validationData.message === "Phone number already exists") {
                    Alert.alert('Phone Number Exists', 'This phone number is already registered. Please use a different number or try logging in.');
                } else {
                    Alert.alert('Validation Error', validationData.message || 'Customer validation failed');
                }
                return;
            }

            // Only proceed if message is "Phone number is available"
            if (validationData.message === "Phone number is available") {
                console.log('Customer validated successfully, sending OTP...');
                
                const response = await callAuthApi(
                    "SendMobileOtp",
                    {
                        phone: phoneNumber.trim()
                    }
                );

                setLoading(false);

                if (response.statusCode === 200) {
                    // Pass the phone number to the next screen
                    navigation.navigate('OtpVerification', { 
                        phoneNumber: phoneNumber.trim() 
                    });
                } else {
                    Alert.alert('Error', response.message || 'Failed to send OTP');
                }
            } else {
                setLoading(false);
                Alert.alert('Validation Error', 'Unexpected validation response');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error during customer validation or OTP sending:', error);
            Alert.alert('Error', 'Failed to process request. Please try again.');
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
                    <MainText size="xlarge" weight="bold" align="left">
                        Get Started
                    </MainText>
                    <SubText size="medium" align="left" style={styles.subtitle}>
                        Enter your mobile number to sign up
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
                            placeholder="Mobile Number"
                            value={phoneNumber}
                            onChangeText={(text) => {
                                setPhoneNumber(text);
                                setPhoneError('');
                            }}
                            iconName="phone-outline"
                            keyboardType="numeric"
                            error={phoneError}
                        />

                        <CustomButton
                            title="Send OTP"
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

});


export default GetStartedScreen;