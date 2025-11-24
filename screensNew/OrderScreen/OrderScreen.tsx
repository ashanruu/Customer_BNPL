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
import { callMobileApi } from '../../scripts/api'; 

type OrderItem = {
    id: string;
    merchant: string;
    dueDateISO: string;
    amount: string;
    status: 'unpaid' | 'paid' | 'refunded';
    numOfInstallments?: number; // number of installments already paid (from GetLoanDetail.numOfPaidInstallments)
    noOfInstallments?: number;  // total number of installments (from GetLoanDetail.loan.noOfInstallments)
    loanId?: number | string;   // <-- NEW: keep reference to parent loan
};

type PaymentMethod = {
    id: string;
    brand: string;
    mask?: string;
    label?: string;
};

const TABS = [
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
    { key: 'refunded', label: 'Refunded' },
];

const PAYMENT_METHODS: PaymentMethod[] = [
    // removed dummy fallback card entries — rely only on fetched customer cards now
];

const OrderScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [selectedTab, setSelectedTab] = useState<'unpaid' | 'paid' | 'refunded'>('unpaid');

    const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null);
    const [showIdentity, setShowIdentity] = useState(false);
    const [orderId, setOrderId] = useState<string>('');
    const [methodOpen, setMethodOpen] = useState(false);
    // initial selectedMethod is now a neutral empty object — real value is set after fetching cards
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>({ id: '', brand: '', label: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [showRescheduleSuccess, setShowRescheduleSuccess] = useState(false);
     const [rescheduleOpen, setRescheduleOpen] = useState(false);
     const [rescheduleOrder, setRescheduleOrder] = useState<OrderItem | null>(null);

    // fetched loans and details
    const [loans, setLoans] = useState<any[]>([]);
    const [installmentsByLoan, setInstallmentsByLoan] = useState<Record<number, any>>({});

    // fetched customer cards
    const [customerCards, setCustomerCards] = useState<any[]>([]);

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

    // convert number to ordinal string (1 -> 1st, 2 -> 2nd, 3 -> 3rd, 4 -> 4th, etc.)
    const toOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // build installment label based on numOfInstallments (number of installments already paid)
    // now prefers word-form ordinals (First, Second, Third, ...) for common counts
    const getInstallmentLabel = (order?: OrderItem | null) => {
        if (!order) return 'Installment';
        const paid = Number(order.numOfInstallments ?? 0);
        const current = Math.max(1, paid + 1);

        const ordinalWordMap: Record<number, string> = {
            1: 'First',
            2: 'Second',
            3: 'Third',
            4: 'Fourth',
            5: 'Fifth',
            6: 'Sixth',
            7: 'Seventh',
            8: 'Eighth',
            9: 'Ninth',
            10: 'Tenth',
            11: 'Eleventh',
            12: 'Twelfth',
            13: 'Thirteenth',
            14: 'Fourteenth',
            15: 'Fifteenth',
            16: 'Sixteenth',
            17: 'Seventeenth',
            18: 'Eighteenth',
            19: 'Nineteenth',
            20: 'Twentieth'
        };

        const word = ordinalWordMap[current];
        return `${word ?? toOrdinal(current)} Installment`;
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
        // Flatten installments from loans + installmentsByLoan into OrderItem-like objects
        const allInstallments: OrderItem[] = [];

        loans.forEach((loan: any) => {
            const loanId = loan.loanId;
            const sale = loan.sale || {};
            const merchantName = sale.provider || sale.productName || `Loan ${loanId}`;

            const details = installmentsByLoan[loanId] || {};
            // possible property names for installments in API response
            const rawInst = details?.installments || details?.loanInstallments || details?.installmentSchedule || details?.installmentsList || details?.data?.installments;

            if (Array.isArray(rawInst) && rawInst.length) {
                rawInst.forEach((inst: any, idx: number) => {
                    // due date (many possible keys)
                    const dueIso = inst.dueDate || inst.dueDateISO || inst.dueDateUtc || inst.dueDateTime || inst.due || loan.createdOn || new Date().toISOString();

                    // amount (support GetLoanDetail shape: instAmount)
                    const amountVal = inst.instAmount ?? inst.amount ?? inst.dueAmount ?? inst.installmentAmount ?? inst.installmentValue;
                    const amountNum = typeof amountVal === 'number' ? amountVal : parseFloat(String(amountVal || 0));
                    const formattedAmount = `Rs. ${Number.isFinite(amountNum) ? amountNum.toFixed(2) : '0.00'}`;

                    // status mapping from instStatus (GetLoanDetail) or fallback keys
                    const rawStatus = (inst.instStatus ?? inst.status ?? inst.paymentStatus ?? '').toString().toLowerCase();
                    let status: OrderItem['status'] = 'unpaid';
                    if (rawStatus === 'paid') status = 'paid';
                    else if (rawStatus === 'refunded') status = 'refunded';
                    else status = 'unpaid'; // treat Pending and other as unpaid

                    // id: prefer installId (GetLoanDetail) then common keys, else fallback
                    const id = inst.installId ? String(inst.installId) : (inst.installmentId ? String(inst.installmentId) : `${loanId}-${idx}`);

                    // counts from loan detail response (details may be the GetLoanDetail.data structure)
                    const noOfInstallments = details?.loan?.noOfInstallments ?? loan.noOfInstallments ?? 0;
                    const numOfInstallments = details?.numOfPaidInstallments ?? details?.loan?.numOfInstallments ?? 0;

                    allInstallments.push({
                        id,
                        merchant: merchantName,
                        dueDateISO: dueIso.slice ? dueIso.slice(0, 10) : String(dueIso),
                        amount: formattedAmount,
                        status,
                        numOfInstallments,
                        noOfInstallments,
                        loanId: loanId, // <-- NEW: attach loanId so downstream screens can fetch details
                    });
                });
            } else {
                // fallback — represent the loan as a single card (if no installments returned)
                const perInst = loan.noOfInstallments && loan.totLoanValue ? (loan.totLoanValue / Math.max(1, loan.noOfInstallments)) : (loan.totLoanValue || loan.totCreditValue || 0);
                const formattedAmount = `Rs. ${Number(perInst).toFixed(2)}`;
                allInstallments.push({
                    id: `loan-${loanId}`,
                    merchant: merchantName,
                    dueDateISO: loan.createdOn ? (loan.createdOn.slice ? loan.createdOn.slice(0,10) : String(loan.createdOn)) : new Date().toISOString().slice(0,10),
                    amount: formattedAmount,
                    status: 'unpaid',
                    numOfInstallments: loan.numOfInstallments ?? 0,
                    noOfInstallments: loan.noOfInstallments ?? 0,
                    loanId: loanId, // <-- NEW
                });
            }
        });

        // filter by selectedTab status
        const filtered = allInstallments.filter(i => i.status === selectedTab);

        // group by month-year (same as previous behavior)
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
    }, [selectedTab, loans, installmentsByLoan]);

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
            item={{
                id: item.id,
                merchant: item.merchant,
                dueDate: item.dueDate || item.dueDateISO,
                amount: item.amount,
                numOfInstallments: item.numOfInstallments,
                noOfInstallments: item.noOfInstallments,
            }}
            onPress={() => {
                // If viewing paid tab, navigate straight to success screen
                if (selectedTab === 'paid' || selectedTab === 'refunded') {
                    const amountNum = item.amount.replace(/^Rs\.?\s*/i, '').replace(/,/g, '');
                    // pass hideTitles when coming from refunded tab, and pass loanId for fetching installments
                    navigation.navigate('PaymentSuccessScreen', { amount: amountNum, merchant: item.merchant, hideTitles: selectedTab === 'refunded', loanId: item.loanId });
                    return;
                }
                // otherwise open the bottom sheet modal
                openOrderModal(item);
            }}
        />
    );

    const renderSectionHeader = ({ section }: any) => (
        <View style={styles.sectionHeaderContainer}>
            <Text style={styles.monthTitle}>{section.title}</Text>
        </View>
    );

    React.useEffect(() => {
        const fetchLoans = async () => {
            try {
                const res = await callMobileApi(
                    'GetLoanList',
                    {}, // payload
                    'mobile-app-get-loan-list',
                    '', // apiKey if any
                    'payment'
                );
                // console.log('GetLoanList response:', res);

                const activeLoans = res?.data?.activeLoans || [];
                setLoans(activeLoans);

                // Fetch details/installments for each loanId
                const detailsMap: Record<number, any> = {};
                await Promise.all(activeLoans.map(async (ln: any) => {
                    try {
                        const detailRes = await callMobileApi(
                            'GetLoanDetail',
                            { loanId: ln.loanId },
                            'mobile-app-get-loan-detail',
                            '',
                            'payment'
                        );
                        detailsMap[ln.loanId] = detailRes?.data;
                    } catch (e) {
                        console.error(`GetLoanDetail error for loanId ${ln.loanId}:`, e);
                    }
                }));
                setInstallmentsByLoan(detailsMap);

            } catch (err) {
                console.error('GetLoanList error:', err);
            }
        };
        fetchLoans();
    }, []);

    // fetch customer cards (similar pattern to GetLoanDetail)
    React.useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await callMobileApi(
                    'GetCusCard',
                    {}, // payload
                    'mobile-app-get-cus-card',
                    '',
                    'customer'
                );
                console.log('GetCusCard response:', res); // keep only card log

                // normalize different response shapes
                const data = res?.data;
                let cardsArr: any[] = [];

                // if API returned an array-like container
                if (Array.isArray(data)) {
                    cardsArr = data;
                } else if (data?.cards && Array.isArray(data.cards)) {
                    cardsArr = data.cards;
                } else if (data?.customerCards && Array.isArray(data.customerCards)) {
                    cardsArr = data.customerCards;
                } else if (data && (data.cardNumber || data.cardType || data.cardDate)) {
                    // single-object shape (your example) -> wrap as array
                    cardsArr = [data];
                } else {
                    // fallback to empty
                    cardsArr = [];
                }

                setCustomerCards(cardsArr);

                // set first card as selected payment method if any (map to PaymentMethod)
                if (cardsArr.length) {
                    const c0 = cardsArr[0];
                    const last4 = String(c0.cardNumber ?? '').slice(-4);
                    const mapped: PaymentMethod = {
                        id: String(c0.cardId ?? c0.id ?? `card_0`),
                        brand: String(c0.cardType ?? c0.brand ?? 'CARD'),
                        mask: last4 ? `•••• ${last4}` : (c0.mask ?? undefined),
                        label: c0.cardType ? `${String(c0.cardType)} •••• ${last4 || ''}` : (c0.label ?? undefined),
                    };
                    setSelectedMethod(mapped);
                }
            } catch (e) {
                console.error('GetCusCard error:', e);
            }
        };
        fetchCards();
    }, []);

    // compute available payment methods (fetched customer cards first, then fallbacks)
    const availableMethods = useMemo<PaymentMethod[]>(() => {
        const mappedFromCustomer = customerCards.map((c: any, i: number) => {
            const last4 = String(c.cardNumber ?? '').slice(-4);
            return {
                id: String(c.cardId ?? c.id ?? `card_${i}`),
                brand: String(c.cardType ?? c.brand ?? c.cardBrand ?? 'CARD'),
                mask: last4 ? `•••• ${last4}` : (c.mask ?? undefined),
                label: c.cardType ? `${String(c.cardType)} •••• ${last4 || ''}` : (c.label ?? undefined),
            } as PaymentMethod;
        });

        // avoid duplicates by id/brand — append fallbacks if not already present
        const fallbacks = PAYMENT_METHODS.filter(pm => !mappedFromCustomer.some(m => m.id === pm.id || (m.brand && m.brand.toLowerCase() === pm.brand.toLowerCase())));
        return [...mappedFromCustomer, ...fallbacks];
    }, [customerCards]);

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
                stickySectionHeadersEnabled={true}
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
                            <Text style={modalStyles.installmentText}>{getInstallmentLabel(activeOrder)}</Text>
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
                                {availableMethods.map(m => {
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
                             <Text style={modalStyles.installmentText}>{getInstallmentLabel(activeOrder)}</Text>
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
                                <Text style={modalStyles.installmentText}>{getInstallmentLabel(activeOrder)}</Text>
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
                                    {availableMethods.map(m => {
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
                            <Text style={modalStyles.installmentText}>{getInstallmentLabel(activeOrder)}</Text>
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
                                // pass loanId so PaymentSuccessScreen can fetch full loan installments
                                navigation.navigate('PaymentSuccessScreen', { amount: amountNum, merchant: activeOrder?.merchant, loanId: activeOrder?.loanId });
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
    sectionHeaderContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        zIndex: 10,
        elevation: 3,
    },
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
        marginBottom: 0,
        marginTop: 0,
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