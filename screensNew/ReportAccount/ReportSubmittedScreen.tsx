import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';

const ReportSubmittedScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {/* cute image placed top-right before other content */}
            <Image
                source={require('../../assets/images/cute.png')}
                style={styles.cuteImage}
                resizeMode="contain"
            />

            <View style={styles.content}>
                <Text style={styles.title}>We’ve logged this issue for review.</Text>
                <Text style={styles.body}>
                    Our support team will contact you within 2 working days to verify your details and assist you.
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.body}>Need help sooner?</Text>
                <Text style={styles.contact}>
                    <Text style={styles.contact}>011 234 5678</Text>
                    <Text style={styles.body}> {' | '} </Text>
                    <Text style={styles.contact}>support@yourapp.com</Text>
                </Text>
            </View>

            {/* Bottom fixed Ok button (full width like ScreenTemplate footer) */}
            <View style={styles.bottomButtonContainer}>
                <CustomButton
                    title="Ok"
                    onPress={() => navigation.navigate('MyAccountScreen' as any)}
                    fullWidth
                    variant="primary"
                    size="medium"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 28,
        paddingTop: 40,
        justifyContent: 'flex-start', 
        position: 'relative',
        paddingBottom: 160, 
    },
    content: {
        marginTop: 172, 
    },
    title: {
        marginTop: 14,
        fontSize: 34,
        fontWeight: '700',
        lineHeight: 44,
        marginBottom: 12,
        color: '#111827',
        alignSelf: 'flex-start',
        textAlign: 'left',
    },
    body: {
        marginTop: 10,
        textAlign: 'left',
        color: '#6B7280',
        fontSize: 16,
        lineHeight: 24,
        paddingHorizontal: 0,
    },
    footer: {
        position: 'absolute',
        top: 698,          // placed directly under the cute image (96 + 160 + 12 gap)
        left: 28,
        right: 28,
        alignItems: 'center',
        paddingBottom: 70,
    },
    contact: {
        fontSize: 15,
        color: '#111827',
        marginBottom: 18,
        fontWeight: '500',
    },
    okButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#0077CC',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    okText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cuteImage: {
        position: 'absolute',
        top: 96,
        right: 16,
        width: 140,
        height: 160,
        zIndex: 10,
    },
    bottomButtonContainer: {
        position: 'absolute',
        left: 28,
        right: 28,
        bottom: 32,
        zIndex: 20,
    },
});

export default ReportSubmittedScreen;