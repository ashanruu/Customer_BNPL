import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import HamburgerMenu from "../components/HamburgerMenu";
import { callMobileApi } from "../scripts/api";

const RaiseTicketsScreen = () => {
  const navigation = useNavigation();

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(""); // For uploaded documents

  const handleSubmitTicket = async () => {
    // Basic validation
    if (!subject.trim() || !title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Subject, Title, and Message)');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        MainReason: "Customer Support Request",
        Title: title.trim(),
        Subject: subject.trim(),
        message: message.trim(),
        transactionId: transactionId.trim() || null,
        document: document || null
      };

      const response = await callMobileApi(
        'CreateTicket',
        payload,
        'mobile-app-ticket-creation',
        '',
        'ticket'
      );

      console.log('CreateTicket response:', response);

      if (response.statusCode === 200) {
        Alert.alert(
          'Success',
          'Your ticket has been submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear form
                setSubject('');
                setTitle('');
                setTransactionId('');
                setMessage('');
                setDocument('');
                // Navigate back or to tickets list
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit ticket');
      }
    } catch (error: any) {
      console.error('CreateTicket error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit ticket. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ✅ HamburgerMenu remains */}
      <HamburgerMenu onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />

      {/* ✅ Main form scrollable */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.header}>Raise a Ticket</Text>
        </View>

        <Text style={styles.subText}>
          Fill out the form below to submit a support request
        </Text>

        {/* Input Fields */}
        <TextInput
          style={styles.input}
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Transaction ID (If Relevant)"
          value={transactionId}
          onChangeText={setTransactionId}
        />
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Message"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        {/* Upload Banner */}
        <TouchableOpacity style={styles.uploadBox}>
          <Ionicons name="cloud-upload-outline" size={28} color="#666" />
          <Text style={styles.uploadText}>Upload the Screenshots</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmitTicket}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RaiseTicketsScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    paddingTop: 30, // offset for hamburger
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  header: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: 8,
  },
  subText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 40,

  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
  },
});
