import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { Ionicons } from "@expo/vector-icons";
import { callMobileApi } from "../../scripts/api";
import CustomButton from "../../components/CustomButton";

const RaiseTicketsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(""); // For uploaded documents
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Auto scroll when keyboard appears
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              y: 100,
              animated: true,
            });
          }
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleSubmitTicket = async () => {
    // Basic validation
    if (!subject.trim() || !title.trim() || !message.trim()) {
      Alert.alert(t('common.error'), t('tickets.fillRequiredFields'));
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
          t('common.success'),
          t('tickets.ticketSubmittedSuccessfully'),
          [
            {
              text: t('common.ok'),
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
        Alert.alert(t('common.error'), response.message || t('tickets.failedToSubmit'));
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.mainWrapper}>
            {/* Fixed Header Section */}
            <View style={styles.fixedHeader}>
              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="arrow-back" size={22} color="#666" />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.titleSection}>
                <Text style={styles.headerTitle}>{t('tickets.raiseTicket')}</Text>
                <Text style={styles.subText}>{t('tickets.fillFormSubmitRequest')}</Text>
              </View>
            </View>

            {/* Scrollable Form Section */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContainer,
                { paddingBottom: Math.max(80, keyboardHeight / 3) }
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {/* Form Content */}
              <View style={styles.content}>
                {/* Input Fields */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>{t('tickets.subject')}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('tickets.subject')}
                      value={subject}
                      onChangeText={setSubject}
                    />
                  </View>

                  <Text style={styles.label}>{t('tickets.title')}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('tickets.title')}
                      value={title}
                      onChangeText={setTitle}
                    />
                  </View>

                  <Text style={styles.label}>{t('tickets.transactionIdOptional')}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('tickets.transactionIdOptional')}
                      value={transactionId}
                      onChangeText={setTransactionId}
                    />
                  </View>

                  <Text style={styles.label}>{t('tickets.message')}</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.messageInput]}
                      placeholder={t('tickets.message')}
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
                    title={t('tickets.submit')}
                    size="medium"
                    variant="primary"
                    onPress={handleSubmitTicket}
                    disabled={loading}
                    loading={loading}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RaiseTicketsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  mainWrapper: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#fff",
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: 30,
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
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: 600, // Ensure enough height for scrolling
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
    paddingTop: 20,
    paddingBottom: 40,
  },
});