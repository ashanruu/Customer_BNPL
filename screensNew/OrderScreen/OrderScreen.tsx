import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OrderCard from '../../components/OrderCard';
import BottomSheetModal from '../../components/BottomSheetModal';
import CustomButton from '../../components/CustomButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type OrderItem = {
    id: string;
    merchant: string;
    dueDateISO: string;
    amount: string;
    status: 'unpaid' | 'paid' | 'refunded';
};

type PaymentMethod = {
    id: string;
    brand: string;
    mask?: string;
    label?: string;
};

const SAMPLE_ORDERS: OrderItem[] = [
    { id: '1', merchant: 'Nolimit', dueDateISO: '2025-11-29', amount: 'Rs. 833.33', status: 'unpaid' },
    { id: '2', merchant: 'Fashion bug', dueDateISO: '2025-11-30', amount: 'Rs. 833.33', status: 'paid' },
    { id: '4', merchant: 'Blue Mart', dueDateISO: '2025-11-15', amount: 'Rs. 299.00', status: 'unpaid' },
    { id: '3', merchant: 'Carnage', dueDateISO: '2025-12-28', amount: 'Rs. 998.00', status: 'refunded' },
    { id: '5', merchant: 'GadgetPro', dueDateISO: '2025-12-05', amount: 'Rs. 1,250.00', status: 'paid' },
    { id: '6', merchant: 'HomeStyle', dueDateISO: '2025-10-02', amount: 'Rs. 450.00', status: 'paid' },
    { id: '7', merchant: 'Sportify', dueDateISO: '2025-10-20', amount: 'Rs. 650.00', status: 'unpaid' },
];

const TABS = [
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
    { key: 'refunded', label: 'Refunded' },
];

const PAYMENT_METHODS: PaymentMethod[] = [
    { id: 'card_visa_3816', brand: 'VISA', mask: '•••• 3816', label: 'VISA •••• 3816' },
    { id: 'card_mc_1290', brand: 'MASTERCARD', mask: '•••• 1290', label: 'Mastercard •••• 1290' },
    { id: 'upi_phone', brand: 'UPI', label: 'Google Pay (UPI)' },
];

const OrderScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [selectedTab, setSelectedTab] = useState<'unpaid' | 'paid' | 'refunded'>('unpaid');

    const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);
    const [showIdentity, setShowIdentity] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    const [methodOpen, setMethodOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showRescheduleSuccess, setShowRescheduleSuccess] = useState(false);
     const [rescheduleOpen, setRescheduleOpen] = useState(false);
     const [rescheduleOrder, setRescheduleOrder] = useState<OrderItem | null>(null);

    // selected index for reschedule date picker
    const [selectedRescheduleIndex, setSelectedRescheduleIndex] = useState<number>(0);

    // generate 2 weeks (14 days) of date options starting from the original due date
    const rescheduleDates = useMemo(() => {
        const baseIso = rescheduleOrder?.dueDateISO || activeOrder?.dueDateISO;
        if (!baseIso) return [];
        const start = new Date(baseIso);
        start.setHours(0, 0, 0, 0);
        const out: { date: Date; label: string; day: number; monthShort: string; iso: string; weekday: string }[] = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const monthShort = d.toLocaleString('en-US', { month: 'short' });
            const day = d.getDate();
            const iso = d.toISOString().slice(0, 10);
            const weekday = d.toLocaleString('en-US', { weekday: 'long' });
            out.push({ date: d, label: `${monthShort} ${day}`, day, monthShort, iso, weekday });
        }
        return out;
    }, [rescheduleOrder?.dueDateISO, activeOrder?.dueDateISO]);

    // reset selection when available dates change
    React.useEffect(() => {
        setSelectedRescheduleIndex(0);
    }, [rescheduleDates.length]);

    React.useEffect(() => {
        if (!activeOrder) {
            setMethodOpen(false);
            setShowIdentity(false);
            setShowSuccess(false);
        }
    }, [activeOrder]);

    const formatMonthYear = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    const formatDueLabel = (iso: string) => {
        const d = new Date(iso);
        const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `Due on ${formatted}`;
    };

    const parseAmountParts = (amountStr: string) => {
        const cleaned = amountStr.replace(/^Rs\.?\s*/i, '').trim();
        const [intPart = '0', decPart] = cleaned.split('.');
        const decimals = decPart ? '.' + decPart : '.00';
        return { intPart, decimals };
    };

    const amountParts = useMemo(() => {
        if (!activeOrder) return { intPart: '', decimals: '.00' };
        return parseAmountParts(activeOrder.amount);
    }, [activeOrder]);

    const sections = useMemo(() => {
        const filtered = SAMPLE_ORDERS.filter(o => o.status === selectedTab);
        const map = new Map<string, OrderItem[]>();
        for (const ord of filtered) {
            const key = formatMonthYear(ord.dueDateISO);
            const withLabel: OrderItem & { dueDate?: string } = { ...ord };
            (withLabel as any).dueDate = formatDueLabel(ord.dueDateISO);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(withLabel);
        }
        const sectionArray = Array.from(map.entries())
            .map(([title, data]) => ({ title, data }))
            .sort((a, b) => {
                const da = new Date(a.data[0].dueDateISO).getTime();
                const db = new Date(b.data[0].dueDateISO).getTime();
                return db - da;
            });
        return sectionArray;
    }, [selectedTab]);

    const openOrderModal = (item: OrderItem & { dueDate?: string }) => {
        setActiveOrder(item);
    };

    const closeModal = () => {
        setShowIdentity(false);
        setShowSuccess(false);
        setMethodOpen(false);
        setActiveOrder(null);
    };

    const handleIdentityConfirmed = () => {
        const id = 'OE#' + Math.floor(100000 + Math.random() * 900000).toString();
        setOrderId(id);
        setShowIdentity(false);
        setMethodOpen(false);
        setShowSuccess(true);
    };

    const renderItem = ({ item }: { item: OrderItem & { dueDate?: string } }) => (
        <OrderCard
            item={{ id: item.id, merchant: item.merchant, dueDate: item.dueDate || item.dueDateISO, amount: item.amount }}
            onPress={() => {
                // If viewing paid tab, navigate straight to success screen
                if (selectedTab === 'paid' || selectedTab === 'refunded') {
                    const amountNum = item.amount.replace(/^Rs\.?\s*/i, '').replace(/,/g, '');
                    // pass hideTitles when coming from refunded tab
                    navigation.navigate('PaymentSuccessScreen', { amount: amountNum, merchant: item.merchant, hideTitles: selectedTab === 'refunded' });
                    return;
                }
                // otherwise open the bottom sheet modal
                openOrderModal(item);
            }}
        />
    );

    const renderSectionHeader = ({ section }: any) => (
        <Text style={styles.monthTitle}>{section.title}</Text>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>My Payments</Text>
            </View>

            <View style={styles.tabsWrapper}>
                {TABS.map(tab => {
                    const active = tab.key === selectedTab;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setSelectedTab(tab.key as any)}
                            style={[styles.tabItem, active && styles.tabItemActive]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                ListEmptyComponent={<Text style={styles.emptyText}>No orders in this section.</Text>}
            />

            <BottomSheetModal
                visible={!!activeOrder}
                onClose={closeModal}
                // hide back button on the initial "Pay Early" screen;
                // show back when in identity, success or reschedule screens (NOT on reschedule success)
                showBackButton={showIdentity || showSuccess || rescheduleOpen}
                // show a close button only for the reschedule success screen
                showCloseButton={showRescheduleSuccess}
                onBackPress={() => {
                     if (rescheduleOpen) {
                         setRescheduleOpen(false);
                         return;
                     }
                     if (showRescheduleSuccess) {
                         setShowRescheduleSuccess(false);
                         return;
                     }
                      if (showSuccess) {
                          closeModal();
                          return;
                      }
                      if (showIdentity) {
                          setShowIdentity(false);
                          return;
                      }
                      closeModal();
                  }}
                  height="auto"
                  contentPadding={20}
                  backgroundColor="#FFFFFF"
              >
                {/* RESCHEDULE SCREEN */}
                {activeOrder && rescheduleOpen && (
                    <View style={{ paddingVertical: 6, paddingHorizontal: 6 }}>
                        <Text style={{ fontSize: 20, fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: 12 }}>Reschedule Payment</Text>

                        <View style={{ alignItems: 'center', marginBottom: 14 }}>
                            <View style={modalStyles.merchantLogo}>
                                <Text style={modalStyles.merchantLogoText}>{activeOrder.merchant.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <Text style={modalStyles.merchantTitle}>{activeOrder.merchant}</Text>
                            <Text style={modalStyles.installmentText}>Second Installment</Text>
                            <View style={modalStyles.orderPill}>
                                <Text style={modalStyles.orderPillText}>Order ID: {orderId || `OE#${activeOrder.id}`}</Text>
                            </View>
                            <Text style={{ marginTop: 8, color: '#004F85', fontSize: 12, paddingVertical: 6 }}>{formatDueLabel(activeOrder.dueDateISO)}</Text>

                        </View>

                        {/* payment method row (reuse existing styles) */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[modalStyles.methodBox, { marginBottom: 8 }]}
                            onPress={() => setMethodOpen(prev => !prev)}
                        >
                            <View style={modalStyles.cardBrandRow}>
                                <Text style={modalStyles.cardBrandText}>{selectedMethod.brand}</Text>
                                {selectedMethod.mask ? (
                                    <Text style={modalStyles.maskText}>{selectedMethod.mask}</Text>
                                ) : (
                                    <Text style={modalStyles.maskText}>{selectedMethod.label}</Text>
                                )}
                            </View>
                            <Icon name={methodOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#4B5563" />
                        </TouchableOpacity>

                        {methodOpen && (
                            <View style={modalStyles.methodDropdown}>
                                {PAYMENT_METHODS.map(m => {
                                    const isSel = m.id === selectedMethod.id;
                                    return (
                                        <TouchableOpacity
                                            key={m.id}
                                            style={[modalStyles.methodItem, isSel && modalStyles.methodItemSelected]}
                                            onPress={() => {
                                                setSelectedMethod(m);
                                                setMethodOpen(false);
                                            }}
                                        >
                                            <Text style={[modalStyles.methodItemText, isSel && { fontWeight: '700' }]}>{m.label || m.brand}</Text>
                                            {m.mask ? <Text style={modalStyles.methodItemMask}>{m.mask}</Text> : null}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        <Text style={{ color: '#6B7280', marginTop: 12,lineHeight: 18}}>You can reschedule the payment upto 2 weeks from the original due date</Text>

                        {/* simple placeholder date selector (ui-only) */}
                        <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, marginTop: 10 }}>
                            <View style={modalStyles.dateGrid}>
                                {rescheduleDates.map((opt, i) => {
                                    const selected = i === selectedRescheduleIndex;
                                    return (
                                        <TouchableOpacity
                                            key={opt.iso}
                                            activeOpacity={0.85}
                                            onPress={() => setSelectedRescheduleIndex(i)}
                                            style={[modalStyles.dateItem, selected && modalStyles.dateItemSelected]}
                                        >
                                            <Text style={[modalStyles.dateMonthText, selected && modalStyles.dateTextSelected]}>{opt.monthShort}</Text>
                                            <Text style={[modalStyles.dateDayText, selected && modalStyles.dateTextSelected]}>{opt.day}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* reschedule summary moved inside the date picker container */}
                            <View style={{ marginTop: 12, padding: 10,  }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ color: '#6B7280' }}>Reschedule To</Text>
                                    <Text>{rescheduleDates[selectedRescheduleIndex] ? `${rescheduleDates[selectedRescheduleIndex].weekday}, ${rescheduleDates[selectedRescheduleIndex].monthShort} ${rescheduleDates[selectedRescheduleIndex].day}, ${rescheduleDates[selectedRescheduleIndex].date.getFullYear()}` : ''}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <Text style={{ color: '#6B7280' }}>Reschedule Fee</Text>
                                    <Text style={{ color: '#DC2626' }}>Rs. 500.00</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: '#6B7280', fontSize: 16 }}>Total installment value</Text>
                                    <Text>
                                        <Text style={modalStyles.currencyLabel}>Rs.</Text>
                                        <Text style={modalStyles.rescheduleAmountMain}>{amountParts.intPart}</Text>
                                        <Text style={modalStyles.decimalsLabel}>{amountParts.decimals}</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
 
                        <CustomButton
                            title="Reschedule"
                            onPress={() => {
                                // show the reschedule success screen inside the sheet
                                setRescheduleOpen(false);
                                setShowRescheduleSuccess(true);
                                setMethodOpen(false);
                            }}
                            variant="primary"
                            style={{ marginTop: 16 }}
                        />
                    </View>
                )}

                {/* RESCHEDULE SUCCESS SCREEN */}
                {activeOrder && showRescheduleSuccess && (
                    <View style={modalStyles.rescheduleSuccessContainer}>
                        <Text style={[modalStyles.successTitle, { marginBottom: 6 }]}>Reschedule Success!</Text>

                        <View style={[modalStyles.merchantCenter, modalStyles.rescheduleMerchantSpacing]}>
                             <View style={modalStyles.merchantLogo}>
                                 <Text style={modalStyles.merchantLogoText}>{activeOrder.merchant.substring(0, 2).toUpperCase()}</Text>
                             </View>
                             <Text style={modalStyles.merchantTitle}>{activeOrder.merchant}</Text>
                             <Text style={modalStyles.installmentText}>Second Installment</Text>
                             <View style={modalStyles.orderPill}>
                                 <Text style={modalStyles.orderPillText}>Order ID: {orderId || `OE#${activeOrder.id}`}</Text>
                             </View>
                             <Text style={{ marginTop: 8, color: '#004F85', fontSize: 12 }}>Previously {formatDueLabel(activeOrder.dueDateISO)}</Text>
                         </View>

                        <View style={[modalStyles.rescheduleDetailsBox, { width: '100%' }]}>
                             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                 <Text style={{ color: '#6B7280' }}>Reschedule To</Text>
                                 <Text>{rescheduleDates[selectedRescheduleIndex] ? `${rescheduleDates[selectedRescheduleIndex].weekday}, ${rescheduleDates[selectedRescheduleIndex].monthShort} ${rescheduleDates[selectedRescheduleIndex].day}, ${rescheduleDates[selectedRescheduleIndex].date.getFullYear()}` : ''}</Text>
                             </View>
                             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                 <Text style={{ color: '#6B7280' }}>Reschedule Fee</Text>
                                 <Text style={{ color: '#DC2626' }}>Rs. 500.00</Text>
                             </View>
                             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                 <Text style={{ color: '#6B7280' , fontSize: 16 }}>New Installment value</Text>
                                 <Text>
                                     <Text style={modalStyles.currencyLabel}>Rs.</Text>
                                     <Text style={modalStyles.rescheduleAmountMain}>{amountParts.intPart}</Text>
                                     <Text style={modalStyles.decimalsLabel}>{amountParts.decimals}</Text>
                                 </Text>
                             </View>
                         </View>
 
                     </View>
                 )}

                {activeOrder && !showIdentity && !showSuccess && !rescheduleOpen && !showRescheduleSuccess && (
                    <View style={modalStyles.modalInner}>
                        {/* Top-right View Order button above everything */}
                        <TouchableOpacity
                            style={modalStyles.viewOrderBtnTop}
                            onPress={() => {
                                closeModal();
                                navigation.navigate('OrderDetailsScreen', { orderId: activeOrder.id });
                            }}
                        >
                            <Text style={modalStyles.viewOrderText}>View Order</Text>
                        </TouchableOpacity>

                        {/* Local back button aligned with View Order (left) */}
                        <TouchableOpacity
                            style={modalStyles.viewOrderBtnLeft}
                            onPress={() => {
                                // close only the sheet (do not use reusable back)
                                closeModal();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={modalStyles.backArrow}>←</Text>
                        </TouchableOpacity>

                        <View style={modalStyles.merchantRow}>
                            <View style={modalStyles.merchantCenter}>
                                <View style={modalStyles.merchantLogo}>
                                    <Text style={modalStyles.merchantLogoText}>{activeOrder.merchant.substring(0, 2).toUpperCase()}</Text>
                                </View>
                                <Text style={modalStyles.merchantTitle}>{activeOrder.merchant}</Text>
                                <Text style={modalStyles.installmentText}>Second Installment</Text>
                            </View>
                        </View>

                        <View style={{ marginVertical: 12 }}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={modalStyles.methodBox}
                                onPress={() => setMethodOpen(prev => !prev)}
                            >
                                <View style={modalStyles.cardBrandRow}>
                                    <Text style={modalStyles.cardBrandText}>{selectedMethod.brand}</Text>
                                    {selectedMethod.mask ? (
                                        <Text style={modalStyles.maskText}>{selectedMethod.mask}</Text>
                                    ) : (
                                        <Text style={modalStyles.maskText}>{selectedMethod.label}</Text>
                                    )}
                                </View>
                                <Icon
                                    name={methodOpen ? 'chevron-up' : 'chevron-down'}
                                    size={23}
                                    color="#4B5563"
                                    style={modalStyles.caret}
                                />
                            </TouchableOpacity>

                            {methodOpen && (
                                <View style={modalStyles.methodDropdown}>
                                    {PAYMENT_METHODS.map(m => {
                                        const isSel = m.id === selectedMethod.id;
                                        return (
                                            <TouchableOpacity
                                                key={m.id}
                                                style={[modalStyles.methodItem, isSel && modalStyles.methodItemSelected]}
                                                onPress={() => {
                                                    setSelectedMethod(m);
                                                    setMethodOpen(false);
                                                }}
                                            >
                                                <Text style={[modalStyles.methodItemText, isSel && { fontWeight: '700' }]}>{m.label || m.brand}</Text>
                                                {m.mask ? <Text style={modalStyles.methodItemMask}>{m.mask}</Text> : null}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        <View style={modalStyles.totalBox}>
                            <Text style={{ color: '#6B7280', marginBottom: 6 }}>Total Due Installment</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                <Text style={modalStyles.currencyLabel}>Rs.</Text>
                                <Text style={modalStyles.totalAmountMain}>{amountParts.intPart}</Text>
                                <Text style={modalStyles.decimalsLabel}>{amountParts.decimals}</Text>
                            </View>

                            <Text style={{ color: '#6B7280', marginTop: 8, fontSize: 12 }}>{formatDueLabel(activeOrder.dueDateISO)}</Text>

                            <TouchableOpacity
                                style={modalStyles.rescheduleBtn}
                                onPress={() => {
                                    // generate/order id (match ScanScreen success format) and open reschedule view
                                    const id = orderId || 'OE#' + Math.floor(100000 + Math.random() * 900000).toString();
                                    setOrderId(id);
                                    setRescheduleOrder(activeOrder);
                                    setRescheduleOpen(true);
                                    setMethodOpen(false);
                                }}
                            >
                                <Text style={modalStyles.rescheduleBtnText}>Reschedule</Text>
                            </TouchableOpacity>
                        </View>

                        <CustomButton
                            title="Pay Early"
                            onPress={() => {
                                setShowIdentity(true);
                                setMethodOpen(false);
                            }}
                            variant="primary"
                            style={{ marginTop: 8, marginBottom: 24 }}
                        />
                    </View>
                )}

                {activeOrder && showIdentity && (
                    <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', marginBottom: 18 }}>
                            <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937', marginBottom: 8 }}>Confirm Identity</Text>
                        </View>

                        <View style={modalStyles.faceIconBox}>
                            <Icon name="fingerprint" size={110} color="#006DB9" />
                        </View>

                        <CustomButton
                            title="Try Again"
                            onPress={handleIdentityConfirmed}
                            variant="outline"
                            style={{ marginTop: 20, width: '100%' }}
                        />

                        <TouchableOpacity
                            onPress={() => { Alert.alert('Use PIN', 'Navigating to PIN entry screen...'); }}
                            activeOpacity={0.8}
                            style={{ alignItems: 'center', padding: 20 }}
                        >
                            <Text style={modalStyles.usePinText}>
                                Having Trouble? <Text style={modalStyles.usePinLink}>Use PIN</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeOrder && showSuccess && (
                    <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', marginBottom: 8 }}>
                            <Text style={modalStyles.successIntro}>Installment Payment</Text>
                            <Text style={modalStyles.successTitle}>Successful!</Text>
                        </View>

                        <View style={modalStyles.merchantCenter}>
                            <View style={modalStyles.merchantLogo}>
                                <Text style={modalStyles.merchantLogoText}>{activeOrder.merchant.substring(0, 2).toUpperCase()}</Text>
                            </View>
                            <Text style={modalStyles.merchantTitle}>{activeOrder.merchant}</Text>
                            <Text style={modalStyles.installmentText}>Second Installment</Text>
                        </View>

                        <View style={{ alignItems: 'center', width: '100%', marginBottom: 16 }}>
                            <View style={modalStyles.cardBrandRow}>
                                <Text style={modalStyles.cardBrandText}>{selectedMethod.brand}</Text>
                                <Text style={modalStyles.maskText}>{selectedMethod.mask ? selectedMethod.mask : selectedMethod.label}</Text>
                            </View>
                        </View>

                        <CustomButton
                            title="View Order Details"
                            onPress={() => {
                                const amountNum = activeOrder
                                    ? activeOrder.amount.replace(/^Rs\.?\s*/i, '').replace(/,/g, '')
                                    : '0';
                                closeModal();
                                navigation.navigate('PaymentSuccessScreen', { amount: amountNum, merchant: activeOrder?.merchant });
                            }}
                            variant="secondary"
                            style={{ marginTop: 8, marginBottom: 24, width: '100%' }}
                        />
                    </View>
                )}
            </BottomSheetModal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerContainer: {
        paddingHorizontal: 20,
        marginTop: 16,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 24,
        color: '#1F2937',
        textAlign: 'center',
        ...Platform.select({
            ios: { fontFamily: 'System' },
            android: { fontFamily: 'Roboto' },
        }),
    },
    monthTitle: {
        fontSize: 14,
        color: '#69687B',
        marginBottom: 15,
        marginTop: 10,
        marginLeft: 8,
    },
    tabsWrapper: {
        flexDirection: 'row',
        alignSelf: 'center',
        width: '90%',
        marginTop: 28,
        marginBottom: 5,
        backgroundColor: '#EBEBED',
        borderRadius: 34,
        padding: 8,
        justifyContent: 'center',
    },
    tabItem: {
        width: 105,
        paddingVertical: 10,
        borderRadius: 28,
        marginHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: {
        backgroundColor: '#FFF',
        elevation: 4,
    },
    tabLabel: {
        color: '#333',
        fontSize: 15,
        textAlign: 'center',
    },
    tabLabelActive: {
        color: '#111',
        fontWeight: '500',
        fontSize: 15,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EEE',
        backgroundColor: '#FFF',
    },
    info: {},
    merchant: { fontSize: 16, fontWeight: '600' },
    due: { fontSize: 12, color: '#888', marginTop: 4 },
    amount: { fontSize: 16, fontWeight: '700' },
    emptyText: { textAlign: 'center', marginTop: 24, color: '#666' },
});

const modalStyles = StyleSheet.create({
    modalInner: { paddingVertical: 10 },
    rescheduleSuccessContainer: {
        paddingVertical: 14,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    rescheduleMerchantSpacing: {
        marginTop: 6,
        marginBottom: 12,
        alignItems: 'center',
    },
    rescheduleDetailsBox: {
        marginTop: 14,
        backgroundColor: '#FFF',
        padding: 12,
        marginBottom:10,
    },
    merchantRow: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        paddingBottom: 6,
    },
    merchantCenter: { alignItems: 'center' },
    merchantLogo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0EA5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    merchantLogoText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
    merchantTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0F172A',
        textAlign: 'center',
    },
    installmentText: { color: '#6B7280', marginTop: 2, fontSize: 13 },
    viewOrderBtnTop: {
        position: 'absolute',
        right: 12,
        zIndex: 20,
        elevation: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    viewOrderText: { color: '#1F2937', fontSize: 12, fontWeight: '600' },
    // NEW: left-aligned back button style (mirrors viewOrderBtnTop)
    viewOrderBtnLeft: {
        position: 'absolute',
        left: 12,
        zIndex: 20,
        elevation: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backArrow: {
        fontSize: 20,
        color: '#1F2937',
        fontWeight: '600',
        ...Platform.select({
            ios: { fontFamily: 'System' },
            android: { fontFamily: 'Roboto' },
        }),
    },
    methodBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cardBrandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 12 },
    cardBrandText: { fontSize: 14, fontWeight: '700', color: '#0B4DA0' },
    maskText: { fontSize: 14, fontWeight: '700', marginLeft: 10, color: '#21203B' },
    caret: { marginLeft: 12, alignSelf: 'center' },
    methodDropdown: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
    },
    methodItem: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
    },
    methodItemSelected: { backgroundColor: '#EEF2FF' },
    methodItemText: { color: '#111827', fontSize: 15 },
    methodItemMask: { color: '#6B7280', fontSize: 13 },
    totalBox: {
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 6,
    },
    totalAmountMain: { fontSize: 24, fontWeight: '500', color: '#0F172A', marginTop: 6 },
    currencyLabel: { fontSize: 14, fontWeight: '500', color: '#0F172A', alignSelf: 'flex-end' },
    decimalsLabel: { fontSize: 16, fontWeight: '500', color: '#0F172A', marginBottom: 3 },
    /* smaller main amount for reschedule summary */
    rescheduleAmountMain: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginLeft: 4 },
    rescheduleBtn: {
        marginTop: 14,
        backgroundColor: '#EBEBED',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 200,
    },
    rescheduleBtnText: { color: '#006DB9' },
    orderPill: {
        backgroundColor: '#E1EEF8',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 100,
        marginRight: 8,
        marginTop: 12,
    },
    orderPillText: {
        color: '#004F85',
        fontSize: 10,
        fontWeight: '600',
    },
    faceIconBox: {
        width: 88,
        height: 88,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    tryAgainBtn: {
        width: '100%',
        borderRadius: 40,
        borderWidth: 1.5,
        borderColor: '#0B67BB',
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    tryAgainText: { color: '#0B67BB', fontSize: 16, fontWeight: '600' },
    usePinText: { color: '#475569', fontSize: 14 },
    usePinLink: { color: '#0B67BB', fontWeight: '700' },
    successIntro: { fontSize: 20, fontWeight: '400', lineHeight: 24, marginBottom: 6, color: '#2AA743' },
    successTitle: { fontSize: 29, fontWeight: '500', lineHeight: 36, marginBottom: 10, color: '#2AA743' },
    /* Date picker grid - 7 items per row */
    dateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 2,
    },
    dateItem: {
        width: '14%', // approx 100/7
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    dateItemSelected: {
        backgroundColor: '#0B67BB',
        borderWidth: 0,
    },
    dateMonthText: {
        fontSize: 9,
        color: '#111',
        marginBottom: 1,
    },
    dateDayText: {
        fontSize: 13,
        fontWeight: '400',
        color: '#111',
    },
    dateTextSelected: {
        color: '#FFFFFF',
    },
});

export default OrderScreen;