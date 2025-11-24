import React, { useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    useColorScheme,
    Animated,
    Pressable,
    Text,
    Easing,
    Platform,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

const getFontFamily = () => {
    if (Platform.OS === 'ios') return 'SF Pro Display';
    if (Platform.OS === 'android') return 'Roboto';
    return 'System';
};

type ManualTabNavigatorProps = {
    HomeComponent: React.ComponentType<any>;
    StoreComponent?: React.ComponentType<any>;
    ScanComponent?: React.ComponentType<any>;
    OrdersComponent?: React.ComponentType<any>;
    ProfileComponent?: React.ComponentType<any>;
    initialTab?: number;
};

const ManualTabNavigator: React.FC<ManualTabNavigatorProps> = ({
    HomeComponent,
    StoreComponent,
    ScanComponent,
    OrdersComponent,
    ProfileComponent,
    initialTab = 0,
}) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [menuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation<any>();
    const { t } = useTranslation();

    const tabs = [
        { name: t('navigation.home'), iconName: 'home-outline', component: HomeComponent, label: 'Home', index: 0 },
        { name: t('navigation.shop'), iconName: 'store-outline', component: StoreComponent || HomeComponent, label: 'Store', index: 1 },
        { name: t('navigation.scan'), iconName: 'qrcode-scan', component: ScanComponent || HomeComponent, label: 'Scan', index: 2, isCenter: true },
        { name: t('navigation.orders'), iconName: 'cart-outline', component: OrdersComponent || HomeComponent, label: 'Orders', index: 3 },
        { name: t('navigation.profile'), iconName: 'account-outline', component: ProfileComponent || HomeComponent, label: 'Profile', index: 4 },
    ];

   
   
    

    const CurrentScreen = tabs[activeTab].component;

    return (
        <View style={[styles.container, { backgroundColor: '#fff' }]}>
            {/* Render selected screen */}
            <View style={styles.screenContainer}>
                <CurrentScreen />
            </View>

            {/* Bottom tab bar */}
            <View style={[styles.tabBarContainer, { backgroundColor: '#FFFFFF' }]}>
                <View style={[styles.tabBar, { backgroundColor: '#fffffffe' }]}>
                    <View style={styles.leftTabs}>
                        {tabs
                            .filter(tab => !tab.isCenter && tab.index < 2)
                            .map(tab => {
                                const isFocused = activeTab === tab.index;
                                return (
                                    <TouchableOpacity
                                        key={tab.index}
                                        onPress={() => setActiveTab(tab.index)}
                                        style={[styles.tab, tab.index === 1 && styles.storeOffset]}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.tabContent}>
                                            <MaterialCommunityIcons
                                                name={tab.iconName}
                                                size={24}
                                                color={isFocused ? '#0066CC' : '#9CA3AF'}
                                            />
                                            <Text
                                                style={[
                                                    styles.tabLabel,
                                                    {
                                                        color: isFocused ? '#0066CC' : '#9CA3AF',
                                                        fontWeight: isFocused ? '600' : '400',
                                                    },
                                                ]}
                                            >
                                                {tab.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>

                    {tabs
                        .filter(tab => tab.isCenter)
                        .map(tab => (
                            <View key={tab.index} style={styles.centerButton} pointerEvents="box-none">
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('ScanScreen')}
                                    style={styles.centerButtonInner}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.centerIconWrapper}>
                                        <MaterialCommunityIcons
                                            name={tab.iconName}
                                            size={40}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}

                    <View style={styles.rightTabs}>
                        {tabs
                            .filter(tab => !tab.isCenter && tab.index > 2)
                            .map(tab => {
                                const isFocused = activeTab === tab.index;
                                return (
                                    <TouchableOpacity
                                        key={tab.index}
                                        onPress={() => setActiveTab(tab.index)}
                                        style={[styles.tab, tab.index === 3 && styles.ordersOffset]}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.tabContent}>
                                            <MaterialCommunityIcons
                                                name={tab.iconName}
                                                size={24}
                                                color={isFocused ? '#0066CC' : '#9CA3AF'}
                                            />
                                            <Text
                                                style={[
                                                    styles.tabLabel,
                                                    {
                                                        color: isFocused ? '#0066CC' : '#9CA3AF',
                                                        fontWeight: isFocused ? '600' : '400',
                                                    },
                                                ]}
                                            >
                                                {tab.label}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>
                </View>
            </View>

            {/* Side drawer menu */}
            {menuVisible && (
                <>
               

                    {/* Slide-in drawer */}
                    <Animated.View
                        style={[
                            styles.drawer,
                            {
                                backgroundColor: '#fff',
                                transform: [{ translateX: slideAnim }],
                            },
                        ]}
                    >
                        {/* Drawer header */}
                        <View style={styles.drawerHeader}>
                            <Text style={styles.brandText}>BNPL</Text>
                        </View>
                    </Animated.View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenContainer: { flex: 1 },

    // Tab Bar Styles
    tabBarContainer: {
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    tabBar: {
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#ffffffff',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        position: 'relative',
    },
    tab: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        zIndex: 2,
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        
    },
    tabLabel: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: getFontFamily(),
    },
    leftTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        marginLeft: -5
    },
    rightTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
        marginRight: -5
    },
    storeOffset: {
        marginRight: 32,
    },
    ordersOffset: {
        marginLeft: 32,
    },
    centerButton: {
        position: 'absolute',
        top: -35,
        left: '50%',
        marginLeft: -20,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: 80,
        zIndex: 3,
    },
    centerButtonInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#0066CC',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    centerIconWrapper: {
        backgroundColor: '#0066CC',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Drawer Styles
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        elevation: 999,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth * 0.65,
        height: '100%',
        paddingTop: 60,
        paddingRight: 24,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 1000,
        zIndex: 10000,
    },
    drawerHeader: {
        marginBottom: 30,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingBottom: 20,
        paddingLeft: 24,
        marginTop: 50,
    },
    brandText: {
        fontSize: 26,
        fontWeight: 'bold',
        letterSpacing: 1,
        fontFamily: getFontFamily(),
    },
    menuTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        marginBottom: 10,
        position: 'relative',
    },
    menuActiveLine: {
        position: 'absolute',
        left: 0,
        width: 4,
        height: '100%',
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    menuText: {
        fontSize: 14,
        fontWeight: '500',
        fontFamily: getFontFamily(),
    },
});

export default ManualTabNavigator;
