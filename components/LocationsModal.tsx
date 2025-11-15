import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LocationsModalProps {
  locations: string[];
  onClose: () => void;
}

const LocationsModal: React.FC<LocationsModalProps> = ({
  locations,
  onClose,
}) => {
  return (
    <View style={styles.locationsContainer}>
      <View style={styles.locationsHeader}>
        <Text style={styles.locationsTitle}>Locations</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <Icon name="close" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.locationsList}>
        {locations.map((location, index) => (
          <View key={index} style={styles.locationItem}>
            <Text style={styles.locationText}>{location}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationsContainer: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  locationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationsList: {
    gap: 12,
  },
  locationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});

export default LocationsModal;
