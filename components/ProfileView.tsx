import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePickerComponent from './DatePickerComponent';

interface ProfileField {
  value: string;
  type?: 'text' | 'phone' | 'date' | 'address' | 'email';
}

interface ProfileViewProps {
  name: string;
  nicNumber: string;
  memberSince: string;
  avatarUrl?: string;
  fields: ProfileField[];
  onEditAvatar?: () => void;
  onEditField?: (field: ProfileField) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  name,
  nicNumber,
  memberSince,
  avatarUrl,
  fields,
  onEditAvatar,
  onEditField,
}) => {
  const [editableName, setEditableName] = useState(name);
  const [editableFields, setEditableFields] = useState(fields);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  
  const handleDateSelect = (date: Date, index: number) => {
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const newFields = [...editableFields];
    newFields[index].value = formattedDate;
    setEditableFields(newFields);
    setShowDatePicker(false);
    setSelectedDateIndex(null);
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={require('../assets/images/Group 1000003942.png')} 
            style={styles.avatar} 
          />
          {onEditAvatar && (
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={onEditAvatar}
              activeOpacity={0.8}
            >
              <Icon name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Name and Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.nicNumber}>NIC No: {nicNumber}</Text>
        <Text style={styles.memberSince}>Member Since {memberSince}</Text>
      </View>

      {/* Fields Section */}
      <View style={styles.fieldsContainer}>
        {/* Name Field */}
        <View style={styles.fieldWrapper}>
          <TextInput
            style={styles.fieldInput}
            value={editableName}
            onChangeText={setEditableName}
            placeholder="Name"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Other Fields */}
        {editableFields.map((field, index) => (
          <View key={index} style={styles.fieldWrapper}>
            {field.type === 'date' ? (
              <TouchableOpacity
                style={[styles.fieldInputWrapper, styles.fieldWithIcon]}
                onPress={() => {
                  setSelectedDateIndex(index);
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.fieldInputEditable}>{field.value}</Text>
                <Icon name="calendar-blank" size={20} color="#6B7280" />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.fieldInputWrapper,
                  field.type === 'email' && styles.fieldWithIcon,
                ]}
              >
                <TextInput
                  style={styles.fieldInputEditable}
                  value={field.value}
                  onChangeText={(text) => {
                    const newFields = [...editableFields];
                    newFields[index].value = text;
                    setEditableFields(newFields);
                  }}
                  placeholder={field.type === 'phone' ? 'Phone' : field.type === 'address' ? 'Address' : 'Email'}
                  placeholderTextColor="#9CA3AF"
                  keyboardType={field.type === 'phone' ? 'phone-pad' : field.type === 'email' ? 'email-address' : 'default'}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Date Picker Modal */}
      {selectedDateIndex !== null && (
        <DatePickerComponent
          visible={showDatePicker}
          selectedDate={null}
          onDateSelect={(date) => handleDateSelect(date, selectedDateIndex)}
          onCancel={() => {
            setShowDatePicker(false);
            setSelectedDateIndex(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  nicNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  memberSince: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  fieldsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldInput: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    fontSize: 16,
    fontWeight: '400',
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
  fieldInputWrapper: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldInputEditable: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
    padding: 0,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  fieldContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldWithIcon: {
    justifyContent: 'space-between',
  },
  fieldValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
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
  emailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emailIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
});

export default ProfileView;
