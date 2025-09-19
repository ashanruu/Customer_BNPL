import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';

interface CustomInputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string; // added error prop
}

const CustomInputField: React.FC<CustomInputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  multiline = false,
  numberOfLines = 1,
  error,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          !editable && styles.inputContainerDisabled,
          error && styles.inputContainerError, // red border if error
        ]}
      >
        {iconName && (
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color={isFocused ? Colors.light.tint : Colors.light.icon}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            !editable && styles.inputDisabled,
            value ? styles.largeInputText : styles.smallPlaceholder,
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.icon}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <MaterialCommunityIcons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.light.icon}
            />
          </TouchableOpacity>
        )}
      </View>
{error ? (
  <View style={styles.errorRow}>
    <MaterialCommunityIcons
      name="alert-circle-outline"
      size={14}
      color="red"
      style={styles.errorIcon}
    />
    <Text style={styles.errorText}>{error}</Text>
  </View>
) : null}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  inputContainerFocused: {
    borderBottomColor: Colors.light.tint,
  },
  inputContainerError: {
    borderBottomColor: 'red',
  },
  inputContainerDisabled: {
    backgroundColor: '#F9FAFB',
    borderBottomColor: '#E5E7EB',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.light.text,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    paddingVertical: 0,
  },
  smallPlaceholder: {
    fontSize: 14,
  },
  largeInputText: {
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: Colors.light.icon,
  },
  eyeIcon: {
    padding: 4,
  },
errorRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
  marginLeft: 4,
},

errorIcon: {
  marginRight: 4,
},

errorText: {
  color: 'red',
  fontSize: 12,
},

});

export default CustomInputField;
