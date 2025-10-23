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

import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/Shop/ShopScreen';
import OrdersScreen from '../screens/Orders/OrdersScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import SalesScreen from '../screens/Sales/SalesScreen';
// import TermsScreen from '../screens/TermsScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import LoginScreen from '../screens/LoginScreen';
import { Colors } from '../constants/Colors';
import HamburgerMenu from '../components/HamburgerMenu';

const { width: screenWidth } = Dimensions.get('window');

const getFontFamily = () => {
    if (Platform.OS === 'ios') return 'SF Pro Display';
    if (Platform.OS === 'android') return 'Roboto';
    return 'System';
};

const ManualTabNavigator: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation<any>();

    const tabs = [
        { name: 'Home', iconName: 'home-outline', component: HomeScreen },
        { name: 'Shop', iconName: 'cart-outline', component: ShopScreen },
        { name: 'Scan', iconName: 'qrcode-scan', component: SalesScreen }, 
        { name: 'Orders', iconName: 'text-box-outline', component: OrdersScreen },
        { name: 'Profile', iconName: 'account-outline', component: ProfileScreen },
    ];

    const menuItems = [
        { label: 'My Tickets', icon: 'ticket-outline', screen: 'MyTickets' },
        { label: 'Terms & Conditions', icon: 'file-document-outline', screen: 'Splash' },
        { label: 'Settings', icon: 'cog-outline', screen: 'Settings' },
        { label: 'Log Out', icon: 'logout', screen: 'Login', replace: true },
    ];

    const openDrawer = () => {
        setMenuVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const closeDrawer = () => {
        Animated.timing(slideAnim, {
            toValue: -screenWidth,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
        }).start(() => setMenuVisible(false));
    };

    const handleLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Get all AsyncStorage keys
                            const allKeys = await AsyncStorage.getAllKeys();
                            
                            // Filter out keys to preserve (biometric/PIN data and token)
                            const keysToPreserve = [
                                'pinEnabled',
                                'biometricEnabled', 
                                'userPin',
                                'securitySetupCompleted',
                                'securitySetupSkipped',
                                'bearerToken'  // Preserve the authentication token
                            ];
                            
                            // Get keys to remove (all keys except preserved keys)
                            const keysToRemove = allKeys.filter(key => !keysToPreserve.includes(key));
                            
                            // Remove all data except biometric/PIN settings and token
                            if (keysToRemove.length > 0) {
                                await AsyncStorage.multiRemove(keysToRemove);
                            }
                            
                            console.log('Logout successful - biometric data and token preserved');
                            
                            // Close drawer and navigate to login
                            closeDrawer();
                            navigation.replace('Login');
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('Error', 'Failed to log out. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const CurrentScreen = tabs[activeTab].component;

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Hamburger menu trigger */}
            <HamburgerMenu onPress={openDrawer} />

            {/* Render selected screen */}
            <View style={styles.screenContainer}>
                <CurrentScreen />
            </View>

            {/* Bottom tab bar */}
            <View style={[styles.tabBarContainer, { backgroundColor: themeColors.background }]}>
                <View style={[styles.tabBar, { backgroundColor: themeColors.background }]}>
                    {tabs.map((tab, index) => {
                        const isFocused = activeTab === index;
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setActiveTab(index)}
                                style={styles.tab}
                                activeOpacity={0.7}
                            >
                                <View style={styles.iconWrapper}>
                                    {isFocused && (
                                        <View style={[styles.activeLine, { backgroundColor: themeColors.tint }]} />
                                    )}
                                    <MaterialCommunityIcons
                                        name={tab.iconName}
                                        size={isFocused ? 28 : 22}
                                        color={isFocused ? themeColors.tabIconSelected : themeColors.tabIconDefault}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Side drawer menu */}
            {menuVisible && (
                <>
                    {/* Overlay */}
                    <Pressable style={styles.overlay} onPress={closeDrawer} />

                    {/* Slide-in drawer */}
                    <Animated.View
                        style={[
                            styles.drawer,
                            {
                                backgroundColor: themeColors.background,
                                transform: [{ translateX: slideAnim }],
                            },
                        ]}
                    >
                        {/* Drawer header */}
                        <View style={styles.drawerHeader}>
                            <Text style={styles.brandText}>BNPL</Text>
                        </View>

                        {/* Drawer menu items */}
                        {menuItems.map((item, index) => {
                            const isActive = false; // Optional: style active if needed
                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => {
                                        if (item.label === 'Log Out') {
                                            handleLogout();
                                        } else {
                                            closeDrawer();
                                            if (item.replace) {
                                                navigation.replace(item.screen);
                                            } else {
                                                navigation.navigate(item.screen);
                                            }
                                        }
                                    }}
                                    style={({ pressed }) => [
                                        styles.menuTab,
                                        {
                                            backgroundColor: pressed
                                                ? themeColors.tabIconDefault + '10'
                                                : isActive
                                                    ? themeColors.tabIconDefault + '20'
                                                    : 'transparent',
                                        },
                                    ]}
                                >
                                    {isActive && (
                                        <View
                                            style={[styles.menuActiveLine, { backgroundColor: themeColors.tint }]}
                                        />
                                    )}
                                    <MaterialCommunityIcons
                                        name={item.icon}
                                        size={24}
                                        color={isActive ? themeColors.tabIconSelected : themeColors.tabIconDefault}
                                        style={{ marginRight: 12 }}
                                    />
                                    <Text
                                        style={[
                                            styles.menuText,
                                            {
                                                color: isActive ? themeColors.tabIconSelected : themeColors.tabIconDefault,
                                            },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </Animated.View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    screenContainer: { flex: 1 },
    tabBarContainer: { paddingBottom: 20, paddingTop: 10 },
    tabBar: {
        flexDirection: 'row',
        height: 60,
        marginHorizontal: 20,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    iconWrapper: { alignItems: 'center' },
    activeLine: { width: 20, height: 3, marginBottom: 5, borderRadius: 2 },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Increased opacity
        zIndex: 9999, // Add high z-index
        elevation: 999, // Add high elevation for Android
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: screenWidth * 0.8,
        height: '100%',
        paddingTop: 60,
        paddingRight: 24,
        borderTopRightRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 1000, // Increase elevation significantly
        zIndex: 10000, // Add very high z-index
    },
    drawerHeader: {
        marginBottom: 30,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingBottom: 20,
        paddingLeft: 24,
        marginTop: 50,
    },
    brandText: { fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },
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
    menuText: { fontSize: 14, fontWeight: '500', fontFamily: getFontFamily() },
});

export default ManualTabNavigator;
