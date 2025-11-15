import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';

interface TabOption {
  label: string;
  value: string;
}

interface TabFilterProps {
  // Options
  options: TabOption[];
  
  // Selection
  selectedValue: string;
  onSelect: (value: string) => void;
  
  // Appearance
  backgroundColor?: string;
  selectedBackgroundColor?: string;
  unselectedTextColor?: string;
  selectedTextColor?: string;
  
  // Customization
  borderRadius?: number;
  height?: number;
}

const TabFilter: React.FC<TabFilterProps> = ({
  options,
  selectedValue,
  onSelect,
  backgroundColor = '#E5E7EB',
  selectedBackgroundColor = '#FFFFFF',
  unselectedTextColor = '#6B7280',
  selectedTextColor = '#1F2937',
  borderRadius = 24,
  height = 48,
}) => {
  return (
    <View style={[styles.container, { backgroundColor, borderRadius, height }]}>
      {options.map((option, index) => {
        const isSelected = option.value === selectedValue;
        const isFirst = index === 0;
        const isLast = index === options.length - 1;
        
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.tab,
              {
                backgroundColor: isSelected ? selectedBackgroundColor : 'transparent',
                borderRadius: isSelected ? borderRadius - 4 : 0,
              },
              isFirst && styles.firstTab,
              isLast && styles.lastTab,
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isSelected ? selectedTextColor : unselectedTextColor,
                  fontWeight: isSelected ? '600' : '500',
                },
              ]}
            >
              {option.label}
            </Text>
            {isSelected && Platform.OS === 'ios' && (
              <View style={styles.selectedShadow} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
    padding: 4,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  tabText: {
    fontSize: 15,
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
  selectedShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});

export default TabFilter;
