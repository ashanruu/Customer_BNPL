import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const plans = [
  {
    id: "1",
    title: "Basic",
    price: "$10/month",
    features: [
      "Task management",
      "Basic reports",
      "Limited support",
      "Reports & filters",
      "Team collaboration",
      "Email support",
    ],
  },
  {
    id: "2",
    title: "Standard",
    price: "$15/month",
    features: [
      "Task management",
      "Reports & filters",
      "Team collaboration",
      "Email support",
    ],
  },
  {
    id: "3",
    title: "Pro",
    price: "$25/month",
    features: [
      "Time tracking & workload",
      "Advanced reports",
      "Custom labels & priorities",
      "Project insights",
      "Billing & usage tracking",
      "Priority support",
    ],
  },
  {
    id: "4",
    title: "Enterprise",
    price: "Custom",
    features: [
      "All Pro features",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 support",
    ],
  },
];

const PlansScreen: React.FC = () => {
  const navigation = useNavigation();

  const renderPlan = ({ item }: any) => (
    <LinearGradient
      colors={["#3f4b68ff", "#182848"]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.planTitle}>{item.title}</Text>
      <Text style={styles.planPrice}>{item.price}</Text>

      <ScrollView style={styles.featuresContainer}>
        {item.features.map((feature, index) => (
          <Text key={index} style={styles.featureText}>
            ✓ {feature}
          </Text>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Start with {item.title}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["#20222E", "#090B1A"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Select Your Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Plans */}
      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width * 0.8 + 20}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 20 }}
      />
    </LinearGradient>
  );
};

export default PlansScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  card: {
    width: width * 0.8,
    height: height * 0.8,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    justifyContent: "space-between",
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "left",
    paddingTop: 30,
    marginLeft: 20,
    
  },
  planPrice: {
    fontSize: 20,
    color: "#d1d1d1",
    textAlign: "left",
    marginVertical: 10,
    marginLeft: 20,
    marginBottom: 20
  },
  featuresContainer: {
    flex: 1,
    marginVertical: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    marginLeft: 20
  },
  button: {
    backgroundColor: "#ffb347",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 10,
    
  },
  buttonText: {
    color: "#191E2B",
    fontWeight: "700",
    fontSize: 16,
  },
});
