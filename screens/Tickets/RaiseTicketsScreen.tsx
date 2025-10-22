import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { callMobileApi } from "../../scripts/api";
import CustomButton from "../../components/CustomButton";

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
          <Text style={styles.headerTitle}>Raise a Ticket</Text>
          <Text style={styles.subText}>Fill out the form below to submit a support request</Text>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        {/* Input Fields */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <Text style={styles.label}>Title</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <Text style={styles.label}>Transaction ID (If Relevant)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Transaction ID (If Relevant)"
              value={transactionId}
              onChangeText={setTransactionId}
            />
          </View>

          <Text style={styles.label}>Message</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Message"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.label}>Upload Screenshots (If Any)</Text>
          <TouchableOpacity style={styles.uploadWrapper}>
            <Ionicons name="cloud-upload-outline" size={24} color="#bdbdbd" style={styles.uploadIcon} />
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadTitle}>Upload Screenshots</Text>
              <Text style={styles.uploadSubtitle}>Tap to select images (PNG, JPG)</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <View style={styles.submitButtonContainer}>
          <CustomButton
            title="Submit"
            size="medium"
            variant="primary"
            onPress={handleSubmitTicket}
            disabled={loading}
          />
        </View>
      </View>
    </View>
  );
};

export default RaiseTicketsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 10,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  inputSection: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    marginTop: 6,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingHorizontal: 12,
    elevation: 2,
    marginBottom: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: '#000',
    fontWeight: '500',
  },
  messageInput: {
    minHeight: 80,
    maxHeight: 120,
  },
  uploadWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    elevation: 2,
    marginBottom: 16,
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadTextContainer: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#bdbdbd',
    marginBottom: 2,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#cccccc',
    textAlign: 'center',
  },
  submitButtonContainer: {
    alignSelf: 'center',
    width: '75%',
    paddingBottom: 50,
  },
});
