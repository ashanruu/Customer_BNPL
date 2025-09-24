import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/SplashScreen";
import ManualTabNavigator from "../components/ManualTabNavigator";

// LogIn
import LoginScreen from "../screens/LogIn/LoginScreen";
import LogInOtpScreen from "../screens/LogIn/LogInOtpScreen";
import BiometricPinLoginScreen from "../screens/LogIn/BiometricPinLoginScreen";
// Register
import GetStartedScreen from "../screens/SignUp/GetStartedScreen";
import OtpVerificationScreen from "../screens/SignUp/OtpVerificationScreen";
import PersonalInfoScreen from "../screens/SignUp/PersonalInfoScreen";
import AddressDetailsScreen from "../screens/SignUp/AddressDetailsScreen";
import SecuritySetupScreen from "../screens/SignUp/SecuritySetupScreen";

// Other Screens
import DetailsScreen from "../screens/DetailsScreen";
import HistoryDetails from "../screens/HistoryDetails";
import CancelledDetails from "../screens/CancelledDetails";
import PlansScreen from "../screens/PlansScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TermsScreen from "../screens/TermsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MyTicketsScreen from "../screens/MyTicketsScreen";
import RaiseTicketsScreen from "../screens/RaiseTicketsScreen";
import TicketsDetailsScreen from "../screens/TicketsDetailsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import SalesScreen from "../screens/SalesScreen";
import OrderPageScreen from "../screens/OrderPageScreen";
import PaymentProcessScreen from "../screens/PaymentProcessScreen";
//import QRProgressScreen from "../screens/QRProgressScreen";

import HomeScreen from "../screens/HomeScreen";

//Web View Screen
import WebViewScreen from "../screens/WebViewScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen name="Main" component={ManualTabNavigator} />

      {/* LogIn */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LogInOtp" component={LogInOtpScreen} />
      <Stack.Screen name="BiometricPinLogin" component={BiometricPinLoginScreen} options={{ gestureEnabled: false }} />

      {/* Register */}
      <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="AddressDetails" component={AddressDetailsScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SecuritySetupScreen" component={SecuritySetupScreen} options={{ gestureEnabled: false }} />

      {/* Other Screens */}
      <Stack.Screen name="DetailsScreen" component={DetailsScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="HistoryDetails" component={HistoryDetails} options={{ gestureEnabled: false }} />
      <Stack.Screen name="CancelledDetails" component={CancelledDetails} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PlansScreen" component={PlansScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
      <Stack.Screen name="RaiseTickets" component={RaiseTicketsScreen} />
      <Stack.Screen name="TicketsDetails" component={TicketsDetailsScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="SalesScreen" component={SalesScreen} />
      <Stack.Screen name="OrderPageScreen" component={OrderPageScreen} />
      <Stack.Screen name="PaymentProcessScreen" component={PaymentProcessScreen} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ gestureEnabled: false }} />
      {/* <Stack.Screen name="QRProgressScreen" component={QRProgressScreen} options={{ gestureEnabled: false }} /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
