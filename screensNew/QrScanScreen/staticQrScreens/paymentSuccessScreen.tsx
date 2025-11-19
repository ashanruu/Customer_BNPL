import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Dimensions,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import InstallmentCard from '../../../components/InstallmentCard';
import CustomButton from '../../../components/CustomButton';

type RootStackParamList = {
    PaymentScreen: {
        qrData?: string;
        amount?: string;
        merchant?: string;
    };
    PaymentSuccessScreen?: { amount?: string; merchant?: string; hideTitles?: boolean; qrData?: string };
    PaymentMoreInfo?: { amount?: string; merchant?: string; qrData?: string }; // <--- added
};

const { width } = Dimensions.get('window');

const PaymentSuccessScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RootStackParamList, 'PaymentSuccessScreen'>>();
    const amount = route.params?.amount || '0.00';
    const merchant = route.params?.merchant || 'NOLIMIT';
    const hideTitles = !!route.params?.hideTitles;

    const cardBrand = 'VISA';
    const cardMask = '**** 3816';

    const installments = [
        { title: 'First Installment', date: 'Paid on Oct 28, 2025', amount: (parseFloat(amount || '0') / 3).toFixed(2), paid: true },
        { title: 'Second Installment', date: 'Due on Nov 28, 2025', amount: (parseFloat(amount || '0') / 3).toFixed(2), paid: false },
        { title: 'Third Installment', date: 'Due on Dec 28, 2025', amount: (parseFloat(amount || '0') / 3).toFixed(2), paid: false },
    ];

    return (
        <SafeAreaView style={[styles.containerRoot, { backgroundColor: '#FFFFFF' }]}>
            <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
                backgroundColor="#FFFFFF"
            />
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Header (back button removed) */}
                <View style={styles.header} />

                {/* Title Section */}
                <View style={styles.titleSection}>
                    {!hideTitles && <Text style={styles.topTitle}>Installment Payment</Text>}

                    {/* Row that only contains the main title + More Info button aligned on the same baseline */}
                    <View style={styles.mainTitleRow}>
                        {/* !hideTitles && <Text style={styles.mainTitle}>Successful!</Text> */}

                        {/* keep a left flex area so the More Info button stays right-aligned even when title is hidden */}
                        <View style={{ flex: 1 }}>
                            {!hideTitles && <Text style={styles.mainTitle}>Successful!</Text>}
                        </View>

                        <TouchableOpacity
                            style={styles.moreInfoButton}
                            onPress={() => {
                                navigation.navigate('PaymentMoreInfo', { amount, merchant, qrData: route.params?.qrData });
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.moreInfoText}>More Info</Text>
                            <Icon name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Merchant summary card (dashed / light background similar to scanScreen amount box */}
                    <View style={styles.merchantCard}>
                        <View style={{ alignItems: 'center' }}>

                            <Text style={styles.totalLabel}>Total order value</Text>

                            <View style={styles.merchantLogo}>
                                <Text style={styles.merchantLogoText}>NOLIMIT</Text>
                            </View>

                            <View style={styles.amountRowCentered}>
                                <Text style={styles.currency}>Rs.</Text>
                                {(() => {
                                    const formatted = parseFloat(amount || '0').toFixed(2);
                                    const [whole, fraction] = formatted.split('.');
                                    return (
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                            <Text style={styles.totalAmountCentered}>{whole}</Text>
                                            <Text style={styles.currency}>.{fraction}</Text>
                                        </View>
                                    );
                                })()}
                            </View>

                            <View style={styles.orderMetaCentered}>
                                <TouchableOpacity style={styles.orderId}>
                                    <Text style={styles.orderIdText}>Order ID: OE#984532</Text>
                                </TouchableOpacity>
                                <Text style={styles.dateText}>28 October 2025, 01:25 PM</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={[styles.infoText, { textAlign: 'left'}]}>
                        You've paid the first installment for your purchase at {merchant}. Your next payment will be automatically debited at the scheduled dates.
                    </Text>

                    {/* Installments card */}
                    <View>
                        <View style={{ marginTop: 2 }}>
                            {installments.map((it, idx) => (
                                <View key={idx} style={{ marginBottom: 10 }}>
                                    <InstallmentCard
                                        installmentTitle={it.title}
                                        currentInstallment={idx + 1}
                                        dueDate={it.date.replace(/^(Paid on |Due on )/, '')}
                                        dateLabel={it.date}
                                        amount={parseFloat(it.amount)}
                                        currency="Rs."
                                        isPaid={it.paid}
                                        isOverdue={false}
                                        cardBrand={cardBrand}
                                        cardMask={cardMask}
                                      />
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <CustomButton
                        title="Back to Home"
                        onPress={() => navigation.popToTop?.() ?? navigation.navigate('Home')}
                        variant="secondary"
                        size="medium"
                        style={styles.button}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    containerRoot: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        width: '100%',
    },
    mainTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        width: '100%',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 28 : 32,
        paddingBottom: 16,
    },
    titleSection: {
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    topTitle: {
        fontSize: 20,
        fontWeight: '500',
        lineHeight: 24,
        marginBottom: 6,
        color: '#2AA743',
    },
    mainTitle: {
        fontSize: 29,
        fontWeight: '700',
        lineHeight: 36,
        marginBottom: 10,
        color: '#2AA743',
    },
    moreInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 24,
        gap: 2,
    },
    moreInfoText: {
        color: '#6B7280',
        fontWeight: '600',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },

    merchantCard: {
        width: width - 48,
        alignSelf: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        paddingVertical: 20,
        paddingHorizontal: 18,
        marginBottom: 18,
    },
    merchantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    merchantLogo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0EA5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    merchantLogoText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 500,
        color: '#6B7280',
        marginBottom: 7,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    amountRowCentered: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginTop: 8,
    },
    currency: {
        fontSize: 16,
        color: '#1E293B',
        marginRight: 6,
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
    },
    totalAmountCentered: {
        fontSize: 30,
        fontWeight: '800',
        color: '#0F172A',
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    orderMetaCentered: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        justifyContent: 'center',
        gap: 12,
    },
    orderId: {
        backgroundColor: '#E1EEF8',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 12,
    },
    orderIdText: {
        color: '#004F85',
        fontSize: 11,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 11,
        color: '#6B7280',
    },
    infoText: {
        color: '#475569',
        lineHeight: 20,
        fontSize: 14,
        marginBottom: 20,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 12 : 50,
    },
    button: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaymentSuccessScreen;