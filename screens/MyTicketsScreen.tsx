// screens/MyTicketsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HamburgerMenu from "../components/HamburgerMenu";
import { callMobileApi } from "../scripts/api";


const MyTicketsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("active");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true);

      const payload = {};

      const response = await callMobileApi(
        'GetTicketByU_Id',
        payload,
        'mobile-app-get-tickets',
        '',
        'ticket'
      );

      console.log('GetTicketByU_Id response:', response);

      if (response.statusCode === 200) {
        if (response.data) {
          const ticketsData = Array.isArray(response.data) ? response.data : [response.data];
          setTickets(ticketsData);
        } else {
          setTickets([]);
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch tickets');
      }
    } catch (error: any) {
      console.error('GetTicketByU_Id error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch tickets. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch tickets when component mounts
  useEffect(() => {
    fetchTickets();
  }, []);

  // Refresh tickets when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTickets();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  // Filter tickets based on active tab
  const getFilteredTickets = () => {
    if (activeTab === "active") {
      return tickets.filter((ticket: any) => ticket.isActive === true);
    } else {
      return tickets.filter((ticket: any) => ticket.isActive === false);
    }
  };

  const renderTicket = ({ item }: any) => (
    <TouchableOpacity
      style={styles.ticketWrapper}
      onPress={() =>
        (navigation as any).navigate("TicketsDetails", { ticket: item })
      }
    >
      {/* ✅ Date outside card */}
      <Text style={styles.date}>{item.createdAt || item.date || 'N/A'}</Text>

      <View style={styles.ticketCard}>
        <View>
          <Text style={styles.ticketTitle}>Ticket #{item.ticketId || 'N/A'}</Text>
          <Text style={styles.ticketSubtitle}>{item.mainReason || 'No Description'}</Text>
          <Text style={styles.ticketStatus}>
            Status: {item.isActive ? 'Active' : 'Closed'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ Hamburger Menu at top */}
      <HamburgerMenu
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />

      {/* ✅ Screen Content */}
      <View style={styles.container}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Tickets</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subText}>View and track your support requests</Text>

        {/* Raise Ticket Card */}
        <TouchableOpacity
          style={styles.raiseCard}
          onPress={() => (navigation as any).navigate("RaiseTickets")}
        >
          <Text style={styles.raiseText}>Raise A Help Desk Ticket</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && styles.activeTab]}
            onPress={() => setActiveTab("active")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "active" && styles.activeTabText,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "history" && styles.activeTabText,
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1a1a2e" />
            <Text style={styles.loadingText}>Loading tickets...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredTickets()}
            renderItem={renderTicket}
            keyExtractor={(item: any, index) => item.ticketId?.toString() || index.toString()}
            contentContainerStyle={{ paddingVertical: 10 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="ticket-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>
                  {activeTab === "active" ? "No active tickets" : "No ticket history"}
                </Text>
                <Text style={styles.emptySubtext}>
                  {activeTab === "active" 
                    ? "Your active support requests will appear here" 
                    : "Your resolved tickets will appear here"
                  }
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default MyTicketsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 25,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "600",
    left: 10,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
    marginLeft: 4,
  },
  raiseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 25,
    marginBottom: 20,
  },
  raiseText: { color: "#fff", fontSize: 16, fontWeight: "600", left: 10 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#e6e6e6",
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeTab: { backgroundColor: "#1a1a2e" },
  tabText: { fontSize: 14, fontWeight: "500", color: "#555" },
  activeTabText: { color: "#fff" },

  ticketWrapper: {
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    color: "#999",
    marginBottom: 6,
    marginLeft: 6,
  },
  ticketCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 12,
  },
  ticketTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  ticketSubtitle: { fontSize: 14, color: "#666", marginBottom: 2 },
  ticketStatus: { fontSize: 12, color: "#999", fontStyle: 'italic' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
