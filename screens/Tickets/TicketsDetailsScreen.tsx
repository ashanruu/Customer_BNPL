// screens/TicketDetailsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HamburgerMenu from "../../components/HamburgerMenu";

type Message = {
  id: string;
  text: string;
  sender: "user" | "support";
  time: string;
};

const TicketDetailsScreen = ({ route }: { route: RouteProp<any> }) => {
  const navigation = useNavigation();
  const ticket = route.params?.ticket || {
    id: "1",
    title: "App crashes on launch",
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla convallis egestas rhoncus.",
      sender: "user",
      time: "Yesterday 12:09 PM",
    },
    {
      id: "2",
      text: "Donec facilisis fermentum sem, ac viverra ante luctus vel. Donec vel mauris quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      sender: "support",
      time: "Yesterday 12:09 PM",
    },
  ]);

  const [reply, setReply] = useState("");

  const sendReply = () => {
    if (!reply.trim()) return;
    const newMsg: Message = {
      id: (messages.length + 1).toString(),
      text: reply,
      sender: "user",
      time: "Today " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setReply("");
  };

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
          <Ionicons name="headset-outline" size={18} color="#333" style={{ marginRight: 6 }} />
          <View style={styles.supportBubble}>
            <Text style={styles.supportText}>{item.text}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ Hamburger Menu */}
      <HamburgerMenu onPress={() => navigation.openDrawer()} />

      {/* ✅ Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.ticketId}>TICKET ID {ticket.id}</Text>
          <Text style={styles.ticketTitle}>{ticket.title}</Text>
        </View>
      </View>

      {/* ✅ Chat Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* ✅ Reply Box */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.replyBox}>
          <TextInput
            style={styles.replyInput}
            placeholder="Type your reply..."
            value={reply}
            onChangeText={setReply}
          />
          <TouchableOpacity style={styles.replyButton} onPress={sendReply}>
            <Text style={styles.replyText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default TicketDetailsScreen;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  ticketId: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: "600",
  },

  messageContainer: {
    marginBottom: 16,
    paddingHorizontal: 15
  },
  userBubble: {
    backgroundColor: "#37375cff",
    padding: 15,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  supportBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 12,
    maxWidth: "80%",
  },
  supportText: {
    color: "#333",
    fontSize: 14,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: "#777",
    marginTop: 4,
  },

  replyBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 25,
    borderTopWidth: 1,
    borderColor: "#f7f7f7ff",
    backgroundColor: "#fff",
  },
  replyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 14,
  },
  replyButton: {
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  replyText: {
    color: "#fff",
    fontWeight: "600",
  },
});
