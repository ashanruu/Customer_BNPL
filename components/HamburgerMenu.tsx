// components/HamburgerMenu.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors'; // Adjust path as needed
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onPress: () => void;
}

const HamburgerMenu: React.FC<Props> = ({ onPress }) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <MaterialCommunityIcons
            name="menu"
            size={28}
            color="white"
          />
        </TouchableOpacity>
        <View style={{ marginLeft: 3 }}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>BNPL</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={styles.planButton}>
          <Text style={styles.planText}>Plan</Text>
        </TouchableOpacity>
        <Ionicons name="language" size={22} color="#fff" style={styles.icon} />
        <TouchableOpacity onPress={onPress} style={styles.bellbutton}>
          <MaterialCommunityIcons
            name="bell"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Menu left, Bell right
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 50, // adjust for SafeAreaView if needed
    backgroundColor: 'rgba(32, 34, 46, 1)',
    paddingBottom: 10,
  },
  button: {
    padding: 10,
  },
  bellbutton: {
    padding: 10,
  },
  planButton: {
    backgroundColor: '#444',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 8
  },
  planText: { color: '#fff' },
  iconRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginLeft: 15 },
});


export default HamburgerMenu;
