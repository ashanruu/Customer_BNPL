import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/LogIn/SplashScreen";
// ManualTabNavigator intentionally not used as a screen here to avoid cycles

// LogIn
import LoginScreen from "../screens/LogIn/LoginScreen";
import LogInOtpScreen from "../screens/LogIn/LogInOtpScreen";
import BiometricPinLoginScreen from "../screens/LogIn/BiometricPinLoginScreen";
import ForgotPasswordScreen from "../screens/LogIn/ForgotPasswordScreen";
import ForgotPasswordOtpScreen from "../screens/LogIn/ForgotPasswordOtpScreen";
import ResetPasswordScreen from "../screens/LogIn/ResetPasswordScreen";

// Register
import GetStartedScreen from "../screens/SignUp/GetStartedScreen";
import OtpVerificationScreen from "../screens/SignUp/OtpVerificationScreen";
import PersonalInfoScreen from "../screens/SignUp/PersonalInfoScreen";
import AddressDetailsScreen from "../screens/SignUp/AddressDetailsScreen";
import SecuritySetupScreen from "../screens/SignUp/SecuritySetupScreen";
import TermsAndConditionsScreen from "../screens/SignUp/TermsAndConditionsScreen";

// Legal
import LegalTermsAndConditionsScreen from "../screens/Legal/LegalTermsAndConditionsScreen";

// Other Screens
// import PlansScreen from "../screens/PlansScreen";
// import ProfileScreen from "../screens/Profile/ProfileScreen";
// import SettingsScreen from "../screens/Settings/SettingsScreen";
// import ChangePinScreen from "../screens/Settings/ChangePinScreen";
// import MyTicketsScreen from "../screens/Tickets/MyTicketsScreen";
// import RaiseTicketsScreen from "../screens/Tickets/RaiseTicketsScreen";
// import TicketsDetailsScreen from "../screens/Tickets/TicketsDetailsScreen";
// import UserProfileScreen from "../screens/Profile/UserProfileScreen";
// import SalesScreen from "../screens/Sales/SalesScreen";
// import OrderPageScreen from "../screens/Sales/OrderPageScreen";
// import PaymentProcessScreen from "../screens/Sales/PaymentProcessScreen";
// import HomeScreen from "../screens/HomeScreen";
// import CardAddedSuccessScreen from "../screens/Cards/CardAddedSuccessScreen";

//Web View Screen
import WebViewScreen from "../screens/Profile/WebViewScreen";
import OrderDetailsScreen from "../screens/Orders/OrderDetailsScreen";
import ChangePasswordScreen from "../screens/Settings/ChangePasswordScreen";
import ShopDetailsScreen from "../screens/Shop/ShopDetailsScreen";
import CategoryShopsScreen from "../screens/Shop/CategoryShopsScreen";
import NotificationPreferencesScreen from "../screens/Settings/NotificationPreferencessScreen";
import PrivacySettingsScreen from "../screens/Settings/PrivacySettingScreen";



//new Screen Set
import OpenScreen from "../screensNew/onboardScreen/openScreen";
import IntroOneScreen from "../screensNew/onboardScreen/introOneScreen";
import IntroTwoScreen from "../screensNew/onboardScreen/introTwoScreen";
import IntroThreeScreen from "../screensNew/onboardScreen/introThreeScreen";

import RegWithMobileNoScreen from "../screensNew/RegistrationScreen/regWithMobileNoScreen";
import RegWithOtpScreen from "../screensNew/RegistrationScreen/regWithOtpScreen";
import RegWithNicScreen from "../screensNew/RegistrationScreen/regWithNicScreen";
import RegWithPersonalDetailsScreen from "../screensNew/RegistrationScreen/regWithPersonalDetailsScreen";
import RegWithAgreementScreen from "../screensNew/RegistrationScreen/regWithAggrementScreen";
import RegWithPasswordScreen from "../screensNew/RegistrationScreen/regWithPasswordScreen";
import RegWithPinScreen from "../screensNew/RegistrationScreen/regWithPinScreen";
import RegWithReEnterPinScreen from "../screensNew/RegistrationScreen/regWithReEnterPin";
import RegWithFaceLoginScreen from "../screensNew/RegistrationScreen/regWithFaceLoginScreen";
import RegWithFingerLoginScreen from "../screensNew/RegistrationScreen/regWithFingerLoginScreen";
import RegWithEmailScreen from "../screensNew/RegistrationScreen/regWithEmailScreen";
import RegWithEmailOtpScreen from "../screensNew/RegistrationScreen/regWithEmailOtpScreen";
import RegWithLoginScreen from "../screensNew/RegistrationScreen/regWithLoginScreen";

import DashboardScreen from "../screensNew/dashboardScreen/dashboardScreen";
import StoresSectionScreen from "../screensNew/StoreManagement/StoresSectionScreen";
import SelectedStoreScreen  from "../screensNew/StoreManagement/SelectedStoreScreen";
import ShoppingSelectedScreen from "../screensNew/StoreManagement/ShoppingSelectedScreen";
import StoreWebViewScreen from "../screensNew/StoreManagement/StoreWebViewScreen";
import ScanScreen from "../screensNew/QrScanScreen/staticQrScreens/scanScreen";
import MyAccountScreen from "../screensNew/MyProfile/MyAccountScreen";
import SecurityScreen from "../screensNew/Security/SecurityScreen";
import IncreaseCreditLimitScreen from "../screensNew/CreditLimit/IncreaseCreditLimitScreen";
import PaymentSuccessScreen from "../screensNew/QrScanScreen/staticQrScreens/paymentSuccessScreen";
import PaymentMoreInfoScreen from "../screensNew/QrScanScreen/staticQrScreens/paymentMoreInfoScreen";


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="OpenScreen"  //IntroOneScreen
      screenOptions={{ headerShown: false }}
    >
    

      {/* Keep Dashboard screen registered for direct navigation if needed */}
      <Stack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen name="StoresSectionScreen" component={StoresSectionScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SelectedStoreScreen" component={SelectedStoreScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ShoppingSelectedScreen" component={ShoppingSelectedScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="StoreWebViewScreen" component={StoreWebViewScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="MyAccountScreen" component={MyAccountScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SecurityScreen" component={SecurityScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="IncreaseCreditLimitScreen" component={IncreaseCreditLimitScreen} options={{ gestureEnabled: false }} />

      {/* onboarding Screen */ }
      <Stack.Screen name="OpenScreen" component={OpenScreen} options={{ gestureEnabled: true }} />
      <Stack.Screen name="IntroOneScreen" component={IntroOneScreen} options={{ gestureEnabled: true }} />
      <Stack.Screen name="IntroTwoScreen" component={IntroTwoScreen} options={{ gestureEnabled: true }} />
      <Stack.Screen name="IntroThreeScreen" component={IntroThreeScreen} options={{ gestureEnabled: true }} />

      {/* Registration Screens */}
      <Stack.Screen name="regWithMobileNo" component={RegWithMobileNoScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithOtpScreen" component={RegWithOtpScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithNicScreen" component={RegWithNicScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithPersonalDetailsScreen" component={RegWithPersonalDetailsScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithAgreementScreen" component={RegWithAgreementScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithPasswordScreen" component={RegWithPasswordScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithPinScreen" component={RegWithPinScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithReEnterPinScreen" component={RegWithReEnterPinScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithFaceLoginScreen" component={RegWithFaceLoginScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithFingerLoginScreen" component={RegWithFingerLoginScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithEmailScreen" component={RegWithEmailScreen} options={{ gestureEnabled: false, headerLeft: () => null }} />
      <Stack.Screen name="RegWithEmailOtpScreen" component={RegWithEmailOtpScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="RegWithLoginScreen" component={RegWithLoginScreen} options={{ gestureEnabled: false }} />

      {/* Sale Screen */}
      <Stack.Screen name="ScanScreen" component={ScanScreen} options={{ gestureEnabled: false }} />

      {/* LogIn */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false, headerLeft: () => null }} />
      <Stack.Screen name="LogInOtp" component={LogInOtpScreen} />
      <Stack.Screen name="BiometricPinLogin" component={BiometricPinLoginScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

      {/* Register */}
      <Stack.Screen name="GetStarted" component={GetStartedScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="AddressDetails" component={AddressDetailsScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SecuritySetupScreen" component={SecuritySetupScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={{ gestureEnabled: false }} />

      {/* Legal */}
      <Stack.Screen name="LegalTermsAndConditions" component={LegalTermsAndConditionsScreen} />

      {/* Settings */}
      {/* <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePinScreen" component={ChangePinScreen} /> */}
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />

      {/* Shop Screens */}
      <Stack.Screen name="ShopDetailsScreen" component={ShopDetailsScreen} />
      <Stack.Screen name="CategoryShopsScreen" component={CategoryShopsScreen} />

      {/* Scan Screens */}
      <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentMoreInfo" component={PaymentMoreInfoScreen} />

      {/* Other Screens */}
      {/* <Stack.Screen name="PlansScreen" component={PlansScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
      <Stack.Screen name="RaiseTickets" component={RaiseTicketsScreen} />
      <Stack.Screen name="TicketsDetails" component={TicketsDetailsScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="SalesScreen" component={SalesScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="SettingScreen" component={SettingsScreen}/>

      <Stack.Screen name="OrderPageScreen" component={OrderPageScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="OrderDetailsScreen" component={OrderDetailsScreen} options={{ gestureEnabled: false }} />
      
      <Stack.Screen name="PaymentProcessScreen" component={PaymentProcessScreen} options={{ gestureEnabled: false }}  />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ gestureEnabled: false }} />
      {/* <Stack.Screen name="QRProgressScreen" component={QRProgressScreen} options={{ gestureEnabled: false }} /> */}
      {/* <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="CardAddedSuccess" component={CardAddedSuccessScreen} options={{ headerShown: false }} /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;