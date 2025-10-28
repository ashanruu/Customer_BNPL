// screens/TicketDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, RouteProp, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { callMobileApi } from "../../scripts/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "../../components/CustomButton";

type Message = {
  id: string;
  text: string;
  sender: "user" | "support";
  time: string;
  messageDate?: string;
  isFromCustomer?: boolean;
};

const TicketDetailsScreen = ({ route }: { route: RouteProp<any> }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const ticket = route.params?.ticket || {
    id: "1",
    ticketId: "1",
    title: "App crashes on launch",
    mainReason: "App crashes on launch",
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [closingTicket, setClosingTicket] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID from AsyncStorage
  const getUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        const parsedUserId = parseInt(storedUserId);
        setUserId(parsedUserId);
        return parsedUserId;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };

  // Close ticket function
  const closeTicket = async () => {
    Alert.alert(
      "Close Ticket",
      "Are you sure you want to close this ticket? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Close Ticket",
          style: "destructive",
          onPress: async () => {
            try {
              setClosingTicket(true);
              
              // Get UserId from the ticket data (fK_UserId) or from AsyncStorage as fallback
              let currentUserId = ticket.fK_UserId;
              
              if (!currentUserId) {
                currentUserId = userId || await getUserId();
              }
              
              if (!currentUserId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                return;
              }

              const payload = {
                UserId: currentUserId,
                TicketId: parseInt(ticket.ticketId || ticket.id)
              };

              console.log('Closing ticket with payload:', payload);

              const response = await callMobileApi(
                'CloseTicket',
                payload,
                `close-ticket-${ticket.ticketId || ticket.id}-${Date.now()}`,
                '',
                'ticket'
              );

              console.log('CloseTicket response:', response);

              if (response.statusCode === 200) {
                Alert.alert(
                  'Success',
                  'Ticket has been closed successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to close ticket');
              }
            } catch (error: any) {
              console.error('Error closing ticket:', error);
              const errorMessage = error.response?.data?.message || 'Failed to close ticket. Please try again.';
              Alert.alert('Error', errorMessage);
            } finally {
              setClosingTicket(false);
            }
          }
        }
      ]
    );
  };

  // Fetch messages from API
  const fetchTicketMessages = async () => {
    try {
      setLoading(true);
      
      // Get UserId from the ticket data (fK_UserId) or from AsyncStorage as fallback
      let currentUserId = ticket.fK_UserId;
      
      if (!currentUserId) {
        currentUserId = userId || await getUserId();
      }
      
      if (!currentUserId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      const payload = {
        UserId: currentUserId,
        Ticketid: parseInt(ticket.ticketId || ticket.id)
      };

      console.log('Fetching messages with payload:', payload);

      const response = await callMobileApi(
        'T_IdListMessages',
        payload,
        `get-ticket-messages-${ticket.ticketId || ticket.id}-${Date.now()}`,
        '',
        'ticket'
      );

      console.log('T_IdListMessages response:', response);
      
      // Add more detailed logging for the response data
      console.log('Response status code:', response.statusCode);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      if (response.statusCode === 200) {
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Extract the actual messages array from the nested structure
          const messagesArray = response.data[0]; // Get the first element which contains the messages
          
          console.log('Extracted messages array:', JSON.stringify(messagesArray, null, 2));
          console.log('Number of messages received:', messagesArray?.length || 0);
          
          if (Array.isArray(messagesArray)) {
            // Transform API response to match our Message type
            const transformedMessages: Message[] = messagesArray.map((msg: any, index: number) => ({
              id: msg.messageId?.toString() || index.toString(),
              text: msg.message || '',
              sender: (msg.isSentByAdmin ? "support" : "user") as "support" | "user",
              time: formatMessageTime(msg.createdAt || ''),
              messageDate: msg.createdAt ? String(msg.createdAt) : undefined,
              isFromCustomer: !msg.isSentByAdmin
            }));
            
            console.log('Transformed messages:', JSON.stringify(transformedMessages, null, 2));
            
            // Sort messages by date (oldest first)
            transformedMessages.sort((a: Message, b: Message) => {
              const timeA = a.messageDate ? new Date(a.messageDate).getTime() : 0;
              const timeB = b.messageDate ? new Date(b.messageDate).getTime() : 0;
              return timeA - timeB;
            });
            
            console.log('Final sorted messages:', JSON.stringify(transformedMessages, null, 2));
            
            setMessages(transformedMessages);
          } else {
            console.log('Messages array is not an array or is empty');
            setMessages([]);
          }
        } else {
          console.log('No messages data or data is not properly structured');
          setMessages([]);
        }
      } else {
        console.error('API call failed with status:', response.statusCode, 'Message:', response.message);
        Alert.alert('Error', response.message || 'Failed to fetch messages');
      }
    } catch (error: any) {
      console.error('Error fetching ticket messages:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to fetch messages. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    if (!dateString) return 'Unknown time';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      if (messageDate.getTime() === today.getTime()) {
        return `Today ${time}`;
      } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        return `Yesterday ${time}`;
      } else {
        return `${date.toLocaleDateString()} ${time}`;
      }
    } catch (error) {
      return dateString;
    }
  };

  // Send reply function - updated to use SendMessage API
  const sendReply = async () => {
    if (!reply.trim()) return;
    
    try {
      // Get UserId from the ticket data (fK_UserId) or from AsyncStorage as fallback
      let currentUserId = ticket.fK_UserId;
      
      if (!currentUserId) {
        currentUserId = userId || await getUserId();
      }
      
      if (!currentUserId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      // Store current reply for error handling
      const currentReply = reply;
      
      // Add optimistic update to UI
      const newMsg: Message = {
        id: (messages.length + 1).toString(),
        text: currentReply,
        sender: "user",
        time: "Today " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        messageDate: new Date().toISOString(),
        isFromCustomer: true
      };
      
      // Update UI immediately for better UX
      setMessages(prevMessages => [...prevMessages, newMsg]);
      setReply("");

      // Prepare API payload matching your backend structure
      const payload = {
        SenderId: currentUserId,
        TicketId: parseInt(ticket.ticketId || ticket.id),
        Message: currentReply
      };

      console.log('Sending message with payload:', payload);

      // Call the SendMessage API
      const response = await callMobileApi(
        'SendMessage',
        payload,
        `send-message-${ticket.ticketId || ticket.id}-${Date.now()}`,
        '',
        'ticket'
      );

      console.log('SendMessage response:', response);

      if (response.statusCode === 200) {
        // Message sent successfully - refresh messages to get updated list from server
        console.log('Message sent successfully');
        // Fetch updated messages to ensure consistency with server
        await fetchTicketMessages();
      } else {
        // API call failed - revert optimistic update
        setMessages(prevMessages => prevMessages.slice(0, -1));
        setReply(currentReply);
        Alert.alert('Error', response.message || 'Failed to send message');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Revert optimistic update on error
      setMessages(prevMessages => prevMessages.slice(0, -1));
      setReply(reply);
      
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  // Fetch messages when component mounts and when focused
  useEffect(() => {
    getUserId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (userId || ticket) {
        fetchTicketMessages();
      }
    }, [userId, ticket])
  );

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.sender === "user") {
      return (
        <View style={[styles.messageContainer, { alignItems: "flex-end" }]}>
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{item.text}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.messageContainer, { alignItems: "flex-start" }]}>
        <View style={styles.supportRow}>
          <View style={styles.supportAvatar}>
            <Ionicons name="headset" size={16} color="#666" />
          </View>
          <View style={styles.supportBubble}>
            <Text style={styles.supportText}>{item.text}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1a1a2e" />
      <Text style={styles.loadingText}>Loading messages...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubble-outline" size={64} color="#E5E5E5" />
      </View>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Start the conversation by sending a message below</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={22} color="#666" />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text style={styles.ticketId}>TICKET #{ticket.ticketId || ticket.id}</Text>
          <Text style={styles.headerTitle}>{ticket.mainReason || ticket.title}</Text>
        </View>

        {/* Only show Close Ticket button for active tickets */}
        {ticket.isActive && (
          <CustomButton
            title="Close Ticket"
            onPress={closeTicket}
            loading={closingTicket}
            disabled={closingTicket}
            variant="outline"
            size="small"
            style={styles.closeTicketButton}
            textStyle={styles.closeTicketButtonText}
          />
        )}
      </View>

      {/* Chat Messages */}
      {loading ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={messages.length === 0 ? styles.emptyListContainer : styles.messagesContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          style={styles.messagesList}
        />
      )}

      {/* Reply Box - Only show for active tickets */}
      {ticket.isActive && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={80}
        >
          <View style={styles.replyContainer}>
            <View style={styles.replyBox}>
              <TextInput
                style={styles.replyInput}
                placeholder="Type your reply..."
                placeholderTextColor="#bdbdbd"
                value={reply}
                onChangeText={setReply}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity 
                style={[styles.sendButton, { opacity: reply.trim() ? 1 : 0.6 }]} 
                onPress={sendReply}
                disabled={!reply.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Show closed ticket message for inactive tickets */}
      {!ticket.isActive && (
        <View style={styles.closedTicketContainer}>
          <View style={styles.closedTicketBanner}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.closedTicketText}>This ticket has been closed</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TicketDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
    marginHorizontal: 16,
  },
  closeTicketButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderColor: '#000',
    borderRadius: 20,
  },
  closeTicketButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: -0.3,
    lineHeight: 22,
  },

  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  userBubble: {
    backgroundColor: "#1a1a2e",
    padding: 16,
    borderRadius: 20,
    borderBottomRightRadius: 8,
    maxWidth: "85%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "85%",
  },
  supportAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  supportBubble: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 8,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  supportText: {
    color: "#1a1a1a",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontWeight: '400',
  },

  // Reply Box
  replyContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  replyBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  replyInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#1a1a1a',
    fontWeight: '500',
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    backgroundColor: "#1a1a2e",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Add new styles for closed ticket banner
  closedTicketContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  closedTicketBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  closedTicketText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
