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

  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        gestureEnabled: false,
      });
    }, [navigation])
  );


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
      activeOpacity={0.7}
    >
      <Text style={styles.date}>{item.createdAt || item.date || 'N/A'}</Text>
      <View style={styles.ticketCard}>
        <View style={styles.ticketContent}>
          <Text style={styles.ticketTitle}>#{item.ticketId || 'N/A'}</Text>
          <Text style={styles.ticketSubtitle} numberOfLines={2}>
            {item.mainReason || 'No Description'}
          </Text>
          <View style={[
            styles.statusBadge,
            item.isActive ? styles.activeBadge : styles.closedBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.isActive ? styles.activeStatusText : styles.closedStatusText
            ]}>
              {item.isActive ? 'Active' : 'Closed'}
            </Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color="#C1C1C1" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenContainer}>
      {/* <HamburgerMenu
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      /> */}

      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={22} color="#666" />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.headerTitle}>My Tickets</Text>
            <Text style={styles.subText}>View and track your support requests</Text>
          </View>
        </View>

        {/* Raise Ticket Card */}
        <TouchableOpacity
          style={styles.raiseCard}
          onPress={() => (navigation as any).navigate("RaiseTickets")}
          activeOpacity={0.7}
        >
          <Text style={styles.raiseText}>Raise New Ticket</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && styles.activeTab]}
            onPress={() => setActiveTab("active")}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "history" && styles.activeTab]}
            onPress={() => setActiveTab("history")}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2C2C2E" />
            <Text style={styles.loadingText}>Loading tickets...</Text>
          </View>
        ) : (
          <FlatList
            data={getFilteredTickets()}
            renderItem={renderTicket}
            keyExtractor={(item: any, index) => item.ticketId?.toString() || index.toString()}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="ticket-outline" size={64} color="#E5E5E7" />
                </View>
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
  screenContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 22,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 0,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subText: {
    fontSize: 15,
    color: "#666",
    textAlign: 'center',
    lineHeight: 20,
  },
  raiseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: 'rgba(32, 34, 46, 1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  raiseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 3,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E8E93",
    letterSpacing: -0.2,
  },
  activeTabText: {
    color: "#2C2C2E",
  },
  listContainer: {
    paddingBottom: 20,
  },
  ticketWrapper: {
    marginBottom: 16,
  },
  date: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  ticketCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  ticketContent: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
    color: "#2C2C2E",
    letterSpacing: -0.2,
  },
  ticketSubtitle: {
    fontSize: 15,
    color: "#6D6D70",
    marginBottom: 12,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  closedBadge: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  activeStatusText: {
    color: '#34C759',
  },
  closedStatusText: {
    color: '#8E8E93',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6D6D70',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});