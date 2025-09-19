import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.title}>Terms and Conditions</Text>
            <Text style={styles.content}>
              {/* Replace with your actual terms content */}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
              convallis egestas rhoncus. Donec facilisis fermentum sem, ac
              viverra ante luctus vel. Donec vel mauris quam. Lorem ipsum dolor
              sit amet, consectetur adipiscing elit.
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 20,
  },
  scrollView: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    color: Colors.light.text,
  },
  content: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: Colors.light.tint,
    borderRadius: 6,
  },
  closeButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TermsModal;
