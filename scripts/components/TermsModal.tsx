import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  content?: string; // Make content optional with default fallback
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose, content }) => {
  // Default content if none is provided
  const defaultContent = ` `;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            {/* Header with close button */}
            <View style={styles.header}>
              <Text style={styles.title}>Terms and Conditions</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors.light.text}
                />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.content}>
                {content || defaultContent}
              </Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    maxHeight: '85%',
    minHeight: '50%',
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
  },
});

export default TermsModal;
