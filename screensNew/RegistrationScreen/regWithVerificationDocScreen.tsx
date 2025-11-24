import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenTemplate from '../../components/ScreenTemplate';

type RootStackParamList = {
  RegWithVerificationDocScreen: undefined;
  RegWithNicScreen: { mobileNumber: string; documentType: DocumentType };
};

type RegWithVerificationDocScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'RegWithVerificationDocScreen'
>;

type DocumentType = 'NIC' | 'DrivingLicense' | 'Passport' | null;

const RegWithVerificationDocScreen: React.FC = () => {
  const navigation = useNavigation<RegWithVerificationDocScreenNavigationProp>();
  const [selectedDocument, setSelectedDocument] = useState<DocumentType>(null);

  const handleContinue = () => {
    if (selectedDocument) {
      console.log('Selected document:', selectedDocument);
      navigation.navigate('RegWithNicScreen', { 
        mobileNumber: '', 
        documentType: selectedDocument 
      });
    }
  };

  const DocumentOption = ({ 
    label, 
    value 
  }: { 
    label: string; 
    value: DocumentType;
  }) => {
    const isSelected = selectedDocument === value;

    return (
      <TouchableOpacity
        style={[styles.documentOption, isSelected && styles.documentOptionSelected]}
        onPress={() => setSelectedDocument(value)}
        activeOpacity={0.7}
      >
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.documentLabel, isSelected && styles.documentLabelSelected]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenTemplate
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      topTitle="Let's verify"
      mainTitle="Select Your Verification Document"
      description="Select your preferred verification document type"
      buttonText="Continue"
      onButtonPress={handleContinue}
      buttonDisabled={!selectedDocument}
      scrollable={false}
    >
      <View style={styles.optionsContainer}>
        <DocumentOption 
          label="National Identity Card (NIC)" 
          value="NIC" 
        />
        <DocumentOption 
          label="Driving License" 
          value="DrivingLicense" 
        />
        <DocumentOption 
          label="Passport" 
          value="Passport" 
        />
      </View>
    </ScreenTemplate>
  );
};

const styles = StyleSheet.create({
  optionsContainer: {
    marginTop: 24,
  },
  documentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  documentOptionSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F7FF',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioOuterSelected: {
    borderColor: '#0066CC',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066CC',
  },
  documentLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
        includeFontPadding: false,
      },
    }),
  },
  documentLabelSelected: {
    color: '#0066CC',
  },
});

export default RegWithVerificationDocScreen;
