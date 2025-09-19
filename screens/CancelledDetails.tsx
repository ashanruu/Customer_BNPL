import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const DetailsScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const { order } = route.params;

  const installments = [
    { title: "First Instalment", price: order.price, status: "Paid", date: order.date },
    { title: "Second Instalment", price: order.price, status: "Pay Early", date: order.date },
    { title: "Third Instalment", price: order.price, status: "Pay Early", date: order.date },
  ];

  const [paymentMethods, setPaymentMethods] = useState(
    installments.map(() => "Credit Card")
  );

  const handlePaymentChange = (index: number, value: string) => {
    const updated = [...paymentMethods];
    updated[index] = value;
    setPaymentMethods(updated);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancelled Orders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.orderPrice}>{order.price}</Text>
        <Text style={styles.orderId}>Order ID: {order.id}</Text>
        <Text style={styles.orderDate}>Date: {order.date}</Text>

        {/* Vertical timeline */}
        <View style={styles.timeline}>
          {installments.map((item, index) => (
            <View key={index} style={styles.installmentContainer}>
              {/* Circle & Line */}
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.circle,
                    index === 0 ? styles.circleFilled : styles.circleEmpty,
                  ]}
                />
                {index < installments.length - 1 && <View style={styles.line} />}
              </View>

              {/* Card */}
              <View style={styles.card}>
                {/* Status at top-right */}
                <View style={styles.cardTopRight}>
                  <Text style={styles.statusTextTop}>{item.status}</Text>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardPrice}>${item.price}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>

                

                {/* {item.status === "Pay Early" && (
                  <TouchableOpacity style={styles.rescheduleButton}>
                    <Text style={styles.rescheduleText}>Reschedule</Text>
                  </TouchableOpacity>
                )} */}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  content: { padding: 20, paddingLeft:30, },
  orderId: { fontSize: 16, color: "#555" },
  orderDate: { fontSize: 16, color: "#555", marginBottom: 30 },
  orderPrice: { fontSize: 28, fontWeight: "700", marginBottom: 10 },

  timeline: { flexDirection: "column" },
  installmentContainer: { flexDirection: "row", marginBottom: 20 },
  timelineLeft: { width: 40, alignItems: "center" },
  circle: { width: 20, height: 20, borderRadius: 10, marginBottom: 5 },
  circleFilled: { backgroundColor: "#20222e" },
  circleEmpty: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#20222e" },
  line: { width: 2, flex: 1, backgroundColor: "#20222e" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginLeft: 10,
    position: "relative",
  },
  cardTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ddd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusTextTop: { fontSize: 12, fontWeight: "600" },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 5 },
  cardPrice: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  cardDate: { fontSize: 14, color: "#888", marginBottom: 10 },

  picker: {
    height: Platform.OS === "ios" ? 50 : 50,
    width: Platform.OS === "ios" ? "50%" : "50%",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  rescheduleButton: {
    borderWidth: 1,
    backgroundColor: "#20222e",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  rescheduleText: { fontSize: 12, fontWeight: "600", color: "white" },
});
