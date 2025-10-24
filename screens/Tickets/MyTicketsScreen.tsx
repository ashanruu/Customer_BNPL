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
import { useNavigation, DrawerActions, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { callMobileApi } from "../../scripts/api";

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
          // Format the tickets data to match the UI expectations
          const formattedTickets = ticketsData.map((ticket: { createAt: string; }) => ({
            ...ticket,
            createdAt: ticket.createAt, // Map createAt to createdAt for consistency
            date: formatDate(ticket.createAt) // Format date for display
          }));
          setTickets(formattedTickets);
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
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

  // Helper function for left border styling
  const getLeftBorderStyle = (isActive: boolean) => {
    return styles.defaultBorderLine; // Use same style for all tickets
  };

  // Helper function for status dot styling
  const getStatusDotStyle = (isActive: boolean) => {
    return isActive ? styles.activeStatusDot : styles.closedStatusDot;
  };

  const renderTicket = ({ item }: any) => (
    <View style={styles.ticketWrapper}>
      <Text style={styles.date}>{item.date || formatDate(item.createdAt) || 'N/A'}</Text>
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() =>
          (navigation as any).navigate("TicketsDetails", { ticket: item })
        }
        activeOpacity={0.7}
      >
        {/* Left Border Line */}
        <View style={[styles.leftBorderLine, getLeftBorderStyle(item.isActive)]} />

        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Ticket ID with Status Dot */}
          <View style={styles.ticketIdRow}>
            <Text style={styles.ticketId}>
              #{item.ticketId || 'N/A'}
            </Text>
            <View style={[styles.statusDot, getStatusDotStyle(item.isActive)]} />
          </View>

          {/* Main Reason with Status Tag */}
          <View style={styles.ticketDescriptionContainer}>
            <View style={styles.ticketDescriptionWithTag}>
              <Text style={styles.ticketDescription} numberOfLines={2}>
                {item.mainReason || item.subject || 'No Description'}
              </Text>
              <View style={[
                styles.statusTag,
                item.isActive ? styles.activeTag : styles.closedTag
              ]}>
                <Text style={[
                  styles.statusTagText,
                  item.isActive ? styles.activeTagText : styles.closedTagText
                ]}>
                  {item.isActive ? 'Active' : 'Closed'}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Info if needed */}
          {item.category && (
            <Text style={styles.categoryInfo}>
              Category: {item.category}
            </Text>
          )}
        </View>

        {/* Right Side - Date and Arrow */}
        <View style={styles.rightSection}>
          <View style={styles.createdDateContainer}>
            <Text style={styles.createdDateLabel}>Created</Text>
            <Text style={styles.createdDateValue}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          {/* Arrow indicator */}
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screenContainer}>
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
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.95)",
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
    fontWeight: "500",
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  ticketCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: 'hidden',
    position: 'relative',
  },
  // Left border line styles
  leftBorderLine: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 2,
    height: '30%',
    alignSelf: 'center',
  },
  defaultBorderLine: {
    backgroundColor: '#9E9E9E',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 12,
  },
  // Ticket ID row with status dot
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginRight: 8,
  },
  // Status dot styles
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeStatusDot: {
    backgroundColor: '#4CAF50',
  },
  closedStatusDot: {
    backgroundColor: '#8B4513',
  },
  // Ticket description container
  ticketDescriptionContainer: {
    marginBottom: 8,
  },
  ticketDescriptionWithTag: {
    flexDirection: 'column',
    gap: 8,
  },
  ticketDescription: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
    lineHeight: 20,
  },
  statusTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  activeTag: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  closedTag: {
    backgroundColor: '#F5F5F5',
    borderColor: '#8E8E93',
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeTagText: {
    color: '#4CAF50',
  },
  closedTagText: {
    color: '#8E8E93',
  },
  categoryInfo: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  rightSection: {
    paddingRight: 16,
    paddingLeft: 8,
    paddingTop: 18,
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
  },
  createdDateContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  createdDateLabel: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createdDateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  arrowContainer: {
    marginTop: 0,
    alignItems: 'center',
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