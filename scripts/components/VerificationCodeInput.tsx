import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface VerificationCodeInputProps {
  length?: number;
  onCodeComplete: (code: string) => void;
  onCodeChange?: (code: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 4,
  onCodeComplete,
  onCodeChange,
  autoFocus = true,
  editable = true,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<TextInput[]>([]);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChangeText = (text: string, index: number) => {
    const digit = text.slice(-1);
    if (digit && !/^\d$/.test(digit)) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (onCodeChange) {
      onCodeChange(newCode.join(''));
    }

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else if (digit && index === length - 1) {
      inputRefs.current[index]?.blur();
      setFocusedIndex(-1);
      onCodeComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace') {
      const newCode = [...code];

      if (code[index]) {
        newCode[index] = '';
        setCode(newCode);
        if (onCodeChange) {
          onCodeChange(newCode.join(''));
        }
      } else if (index > 0) {
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
        if (onCodeChange) {
          onCodeChange(newCode.join(''));
        }
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(-1);
  };
  
const getInputStyle = (index: number) => {
  const style: any = {
    ...styles.input,
    borderWidth: 0,
    backgroundColor: themeColors.background,
    color: themeColors.text,
    shadowColor: '#000',
    shadowOpacity: 0.15,           // Slightly darker than before
    shadowRadius: 2,               // Tight shadow
    shadowOffset: { width: 0, height: 1 }, // Very subtle offset
    elevation: 3,                  // Slightly elevated on Android
  };

  if (focusedIndex === index) {
    Object.assign(style, {
      borderColor: themeColors.tint,
      borderWidth: 2,
      shadowOpacity: 0.2,          // Slightly darker on focus
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    });
  }

  if (code[index]) {
    Object.assign(style, {
      backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F8FAFC',
      borderColor: focusedIndex === index ? themeColors.tint : 'transparent',
      borderWidth: focusedIndex === index ? 2 : 0,
    });
  }

  if (!editable) {
    Object.assign(style, {
      backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F9FAFB',
      borderColor: themeColors.icon,
      color: themeColors.mutedText,
      borderWidth: 0,
    });
  }

  return style;
};


  // Public method to clear the code
  const clearCode = () => {
    setCode(new Array(length).fill(''));
    if (onCodeChange) {
      onCodeChange('');
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) {
              inputRefs.current[index] = ref;
            }
          }}
          style={getInputStyle(index)}
          value={code[index]}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          keyboardType="numeric"
          maxLength={1}
          selectTextOnFocus
          editable={editable}
          textAlign="center"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
  },
  input: {
    width: 45,
    height: 50,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  },
});

export default VerificationCodeInput;
