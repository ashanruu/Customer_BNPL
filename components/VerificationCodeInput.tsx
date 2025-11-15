import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface VerificationCodeInputProps {
  length?: number;
  onCodeComplete: (code: string) => void;
  onCodeChange?: (code: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
  showKeypad?: boolean; // Show custom numeric keypad
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 4,
  onCodeComplete,
  onCodeChange,
  autoFocus = false,
  editable = true,
  showKeypad = true,
}) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputRefs = useRef<TextInput[]>([]);

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (autoFocus && !showKeypad && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, showKeypad]);

  const handleCodeChange = (newCode: string[]) => {
    setCode(newCode);
    
    if (onCodeChange) {
      onCodeChange(newCode.join(''));
    }

    // Check if code is complete
    if (newCode.every(digit => digit !== '') && newCode.join('').length === length) {
      onCodeComplete(newCode.join(''));
    }
  };

  // Handle keypad number press
  const handleKeypadPress = (digit: string) => {
    const currentIndex = code.findIndex(d => d === '');
    
    if (currentIndex !== -1) {
      const newCode = [...code];
      newCode[currentIndex] = digit;
      handleCodeChange(newCode);
      setFocusedIndex(Math.min(currentIndex + 1, length - 1));
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    const lastFilledIndex = code.map((d, i) => d ? i : -1).filter(i => i !== -1).pop();
    
    if (lastFilledIndex !== undefined && lastFilledIndex >= 0) {
      const newCode = [...code];
      newCode[lastFilledIndex] = '';
      handleCodeChange(newCode);
      setFocusedIndex(lastFilledIndex);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const digit = text.slice(-1);
    if (digit && !/^\d$/.test(digit)) return;

    const newCode = [...code];
    newCode[index] = digit;
    handleCodeChange(newCode);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    } else if (!digit && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace') {
      const newCode = [...code];

      if (code[index]) {
        newCode[index] = '';
        handleCodeChange(newCode);
      } else if (index > 0) {
        newCode[index - 1] = '';
        handleCodeChange(newCode);
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    // Don't blur focus indicator when using keypad
    if (!showKeypad) {
      setFocusedIndex(-1);
    }
  };

  const getInputStyle = (index: number) => {
    const isFilled = code[index] !== '';
    const isFocused = focusedIndex === index;

    return [
      styles.input,
      {
        backgroundColor: themeColors.background,
        color: themeColors.text,
      },
      isFilled && styles.filledInput,
      isFocused && {
        borderColor: '#0066CC',
        borderWidth: 2,
      },
      !editable && styles.disabledInput,
    ];
  };

  // Public method to clear the code
  const clearCode = () => {
    const newCode = new Array(length).fill('');
    setCode(newCode);
    setFocusedIndex(0);
    if (onCodeChange) {
      onCodeChange('');
    }
    if (!showKeypad && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  // Render numeric keypad
  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.keyButton} />;
              }

              if (key === 'backspace') {
                return (
                  <TouchableOpacity
                    key={keyIndex}
                    style={[styles.keyButton, styles.backspaceButton]}
                    onPress={handleBackspace}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.backspaceIcon}>⌫</Text>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={keyIndex}
                  style={styles.keyButton}
                  onPress={() => handleKeypadPress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: themeColors.text }]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Code Input Dots */}
      <View style={styles.container}>
        {Array.from({ length }, (_, index) => {
          if (showKeypad) {
            // Show dots indicator when using keypad
            return (
              <View
                key={index}
                style={[
                  styles.dotIndicator,
                  code[index] && styles.dotIndicatorFilled,
                  focusedIndex === index && styles.dotIndicatorFocused,
                ]}
              />
            );
          } else {
            // Show text input boxes
            return (
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
            );
          }
        })}
      </View>

      {/* Custom Numeric Keypad */}
      {showKeypad && renderKeypad()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  
  // Text Input Boxes (when not using keypad)
  input: {
    width: 50,
    height: 56,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filledInput: {
    backgroundColor: '#F9FAFB',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    opacity: 0.6,
  },
  
  // Dot Indicators (when using keypad)
  dotIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dotIndicatorFilled: {
    backgroundColor: '#0066CC',
  },
  dotIndicatorFocused: {
    transform: [{ scale: 1.2 }],
  },
  
  // Custom Keypad Styles
  keypad: {
    width: '100%',
    maxWidth: 320,
    marginTop: 32,
    paddingHorizontal: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 12,
  },
  keyButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 70,
    maxHeight: 70,
    backgroundColor: '#F3F4F6',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  backspaceButton: {
    backgroundColor: '#E5E7EB',
  },
  backspaceIcon: {
    fontSize: 24,
    color: '#6B7280',
  },
});

export default VerificationCodeInput;
