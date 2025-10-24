import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import AppNavigator from './navigation/AppNavigator'; // your stack or tab navigator

export default function App() {
  const [fontsLoaded] = useFonts({
    // Add your custom fonts here if you have any
    // 'CustomFont-Regular': require('./assets/fonts/CustomFont-Regular.ttf'),
    // 'CustomFont-Bold': require('./assets/fonts/CustomFont-Bold.ttf'),
  });

  // Wait for fonts to load before rendering the app
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

