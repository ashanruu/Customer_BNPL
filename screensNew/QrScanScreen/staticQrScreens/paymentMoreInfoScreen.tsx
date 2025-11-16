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
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import CustomButton from '../../../components/CustomButton';

type MoreInfoParams = {
    PaymentMoreInfo: {
        amount?: string;
        merchant?: string;
        qrData?: string;
    };
};

const { width } = Dimensions.get('window');

const PaymentMoreInfoScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<MoreInfoParams, 'PaymentMoreInfo'>>();
    const amount = route.params?.amount || '0.00';
    const merchant = route.params?.merchant || 'NOLIMIT';

    const cardBrand = 'VISA';
    const cardMask = '**** 3816';

    const installments = [
        { title: 'First Installment', date: '28 October 2025', subtitle: 'First Installment settled', amount: (parseFloat(amount || '0') / 3).toFixed(2), paid: true },
        { title: 'Second Installment', date: '28 November 2025', subtitle: 'Second Installment scheduled', amount: (parseFloat(amount || '0') / 3).toFixed(2), paid: false },
        { title: 'Third Installment', date: '28 December 2025', subtitle: 'Third Installment scheduled', amount: (parseFloat(amount || '0') / 3).toFixed(2), paid: false },
    ];

    const formatted = parseFloat(amount || '0').toFixed(2);
    const [whole, fraction] = formatted.split('.');

    // Added: dashed separator renderer (works reliably cross-platform)
    const DashedSeparator: React.FC = () => {
        const dashWidth = 6; // shorter dash
        const dashMargin = 1; // tighter spacing
        const totalUnit = dashWidth + dashMargin * 2;
        const dashCount = Math.max(6, Math.floor((width - 80) / totalUnit)); // adapt to screen
        return (
            <View style={styles.separator}>
                {Array.from({ length: dashCount }).map((_, i) => (
                    <View key={i} style={[styles.dash, { width: dashWidth, marginHorizontal: dashMargin }]} />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle={Platform.OS === 'ios' ? 'dark-content' : 'default'}
                backgroundColor="#FFFFFF"
            />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>More Info</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <View style={styles.logo}>
                            <Text style={styles.logoText}>{merchant ? merchant[0] : 'N'}</Text>
                        </View>
                        <View style={styles.cardAmounts}>
                            <View style={styles.cardRow}>
                                <Text style={styles.label}>Order value</Text>
                                <Text style={styles.value}>Rs. {whole}.{fraction}</Text>
                            </View>
                            <View style={styles.cardRow}>
                                <Text style={styles.label}>Final order value</Text>
                                <Text style={styles.value}>Rs. {whole}.{fraction}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.cardBottom}>
                        <TouchableOpacity style={styles.orderId}>
                            <Text style={styles.orderIdText}>Order ID: OE#984532</Text>
                        </TouchableOpacity>
                        <Text style={styles.cardDate}>28 October 2025, 01:25 PM</Text>
                    </View>
                </View>

                <View style={{ marginTop: 18 }}>
                    {installments.map((it, idx) => (
                        <View key={idx} style={styles.installmentBlock}>
                            <Text style={styles.installmentDate}>{it.date}</Text>

                            <View style={styles.installmentRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.installmentTitle, it.paid && styles.paidTitle]}>{it.subtitle}</Text>

                                    <View style={styles.noteRow}>
                                        <Text style={styles.installmentNote}>Installment value</Text>
                                        <Text style={styles.installmentAmount}>Rs. {parseFloat(it.amount).toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>

                            {idx < installments.length - 1 && <DashedSeparator />}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <CustomButton
                    title="Back to Home"
                    onPress={() => navigation.popToTop?.() ?? navigation.navigate('Home')}
                    variant="secondary"
                    size="medium"
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingTop: Platform.OS === 'ios' ? 18 : 22,
        paddingBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'Roboto',
            },
        }),
    },
    content: { paddingHorizontal: 18, paddingBottom: 24 },
    card: {
        width: width - 36,
        alignSelf: 'center',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        padding: 16,
    },
    // Changed: logo is now in its own centered row above the amounts
    cardTop: { flexDirection: 'column', alignItems: 'center' },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0EA5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    logoText: { color: '#fff', fontWeight: '700' },
    cardAmounts: { flex: 1, width: '100%' },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    label: { color: '#6B7280', fontSize: 13 },
    value: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' },
    orderId: { backgroundColor: '#E1EEF8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    orderIdText: { color: '#004F85', fontSize: 11, fontWeight: '600' },
    cardDate: { fontSize: 11, color: '#6B7280' },

    installmentBlock: { paddingVertical: 5 },
    installmentDate: { color: '#6B7280', fontSize: 12, marginBottom: 6 },
    installmentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    installmentTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    paidTitle: { color: '#16A34A' },
    installmentNote: { fontSize: 14, color: '#0F172A', marginTop: 4 ,fontWeight: '600' },
    installmentAmount: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
    noteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },

    separator: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
        paddingHorizontal: 2,
    },
    dash: {
        width: 10,
        height: 1.5,
        backgroundColor: '#E5E7EB', // same as card border color
        borderRadius: 1,
        marginHorizontal: 2,
    },

    footer: { paddingHorizontal: 18, paddingVertical: Platform.OS === 'ios' ? 12 : 18 },
    button: { width: '100%', justifyContent: 'center' },
});

export default PaymentMoreInfoScreen;