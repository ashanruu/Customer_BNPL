import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface TermsSection {
  title: string;
  content: string;
  subItems?: string[];
}

interface TermsAndConditionsContentProps {
  sections: TermsSection[];
  showCheckbox?: boolean;
  checkboxLabel?: string;
  onCheckboxChange?: (checked: boolean) => void;
  initialChecked?: boolean;
  title?: string;
  lastUpdated?: string;
}

const TermsAndConditionsContent: React.FC<TermsAndConditionsContentProps> = ({
  sections,
  showCheckbox = true,
  checkboxLabel = 'I have read and agree to the Terms & Conditions',
  onCheckboxChange,
  initialChecked = false,
  title,
  lastUpdated,
}) => {
  const [isChecked, setIsChecked] = useState(initialChecked);

  const handleCheckboxToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onCheckboxChange?.(newValue);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.termsScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {title && (
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {lastUpdated && (
              <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
            )}
          </View>
        )}
        
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
            {section.subItems && (
              <View style={styles.subItemsContainer}>
                {section.subItems.map((item, subIndex) => (
                  <Text key={subIndex} style={styles.bulletItem}>• {item}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {showCheckbox && (
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={handleCheckboxToggle}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, isChecked && styles.checkboxBoxChecked]}>
              {isChecked && (
                <Icon name="check" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>{checkboxLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  termsScrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  titleContainer: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  lastUpdated: {
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
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
  sectionContent: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 20,
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
  subItemsContainer: {
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 14,
    fontWeight: '400',
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
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
  checkboxContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxBoxChecked: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
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

export default TermsAndConditionsContent;
