// components/HamburgerMenu.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors'; // Adjust path as needed

interface Props {
  onPress: () => void;
}

const HamburgerMenu: React.FC<Props> = ({ onPress }) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.button}>
        <MaterialCommunityIcons
          name="menu"
          size={28}
          color={themeColors.tabIconDefault}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPress} style={styles.bellbutton}>
        <MaterialCommunityIcons
          name="bell"
          size={24}
          color={themeColors.tabIconDefault}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Menu left, Bell right
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30, // adjust for SafeAreaView if needed
  },
  button: {
    padding: 10,
  },
  bellbutton: {
    padding: 10,
  },
});


export default HamburgerMenu;
