import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
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
  const [selectedFile, setSelectedFile] = useState<{
    type: 'image' | 'document' | null;
    data: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset | null;
  }>({ type: null, data: null });

  // Image picker function
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile({ type: 'image', data: result.assets[0] });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Document picker function
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile({ type: 'document', data: result.assets[0] });
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // Remove file function
  const removeFile = () => {
    setSelectedFile({ type: null, data: null });
  };

  // Create ticket function directly in the component
  const createTicket = async (payload: {
      Subject: string; MainReason: string; 
      transactionId: string | null; message: string; document: string | null;
    }) => {
    try {
      console.log('Creating ticket with payload:', payload);
      
      const response = await callMobileApi(
        'CreateTicket',
        payload,
        `create-ticket-${Date.now()}`,
        '',
        'ticket'
      );

      console.log('CreateTicket response:', response);
      return response;
    } catch (error) {
      console.error('CreateTicket error:', error);
      throw error;
    }
  };

  const handleSubmitTicket = async () => {
    // Basic validation
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Subject and Message)');
      return;
    }

    setLoading(true);

    try {
      // Prepare payload to match your backend structure
      const payload = {
        Subject: subject.trim(),
        MainReason: title.trim() || "Technical", // Use title as MainReason or default to "Technical"
        transactionId: transactionId.trim() || null,
        message: message.trim(),
        document: selectedFile.data ? JSON.stringify(selectedFile) : null
      };

      const response = await createTicket(payload);

      if (response.statusCode === 200 || response.success) {
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
                setSelectedFile({ type: null, data: null });
                // Navigate back or to tickets list
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('common.error'), response.message || t('tickets.failedToSubmit'));
      }
    } catch (error) {
      console.error('CreateTicket error:', error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error instanceof Error ? error.message : null) ||
        'Failed to submit ticket. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.fixedHeader}>
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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Input Fields */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Subject *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter subject (e.g., payment, refund, etc.)"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <Text style={styles.label}>Main Reason</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Main reason (e.g., Technical, Payment, etc.)"
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

            <Text style={styles.label}>Message *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="Describe your issue in detail..."
                value={message}
                onChangeText={setMessage}
                multiline
                textAlignVertical="top"
              />
            </View>

            <Text style={styles.label}>Upload File (Image or Document)</Text>
            
            {!selectedFile.data ? (
              <View style={styles.uploadOptionsContainer}>
                <TouchableOpacity style={styles.uploadWrapper} onPress={pickImage}>
                  <Ionicons name="image-outline" size={24} color="#bdbdbd" style={styles.uploadIcon} />
                  <View style={styles.uploadTextContainer}>
                    <Text style={styles.uploadTitle}>Upload Image</Text>
                    <Text style={styles.uploadSubtitle}>Tap to select image (PNG, JPG)</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.orText}>OR</Text>

                <TouchableOpacity style={styles.uploadWrapper} onPress={pickDocument}>
                  <Ionicons name="document-outline" size={24} color="#bdbdbd" style={styles.uploadIcon} />
                  <View style={styles.uploadTextContainer}>
                    <Text style={styles.uploadTitle}>Upload Document</Text>
                    <Text style={styles.uploadSubtitle}>Tap to select document (PDF, Images)</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectedFilesContainer}>
                {selectedFile.type === 'image' && selectedFile.data && (
                  <View style={styles.selectedFileItem}>
                    <Image 
                      source={{ uri: (selectedFile.data as ImagePicker.ImagePickerAsset).uri }} 
                      style={styles.imagePreview} 
                    />
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileType}>Image</Text>
                      <Text style={styles.fileName}>
                        {(selectedFile.data as ImagePicker.ImagePickerAsset).fileName || 'image.jpg'}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.removeDocButton} onPress={removeFile}>
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                )}
                
                {selectedFile.type === 'document' && selectedFile.data && (
                  <View style={styles.selectedFileItem}>
                    <View style={styles.documentIcon}>
                      <Ionicons name="document" size={24} color="#666" />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileType}>Document</Text>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {(selectedFile.data as DocumentPicker.DocumentPickerAsset).name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {(selectedFile.data as DocumentPicker.DocumentPickerAsset).size 
                          ? `${((selectedFile.data as DocumentPicker.DocumentPickerAsset).size! / 1024).toFixed(1)} KB` 
                          : ''}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.removeDocButton} onPress={removeFile}>
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitButtonContainer}>
            <CustomButton
              title={loading ? "Submitting..." : "Submit Ticket"}
              size="medium"
              variant="primary"
              onPress={handleSubmitTicket}
              disabled={loading}
            />
          </View>
        </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedFilesContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  documentSize: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  removeDocButton: {
    padding: 4,
  },
  uploadOptionsContainer: {
    gap: 12,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginVertical: 8,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
});