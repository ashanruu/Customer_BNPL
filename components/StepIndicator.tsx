// components/StepIndicator.tsx
import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 4,
  activeColor = '#0066CC',
  inactiveColor = '#D1D5DB',
  style,
  size = 'medium',
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { dotSize: 8, spacing: 6 };
      case 'large':
        return { dotSize: 14, spacing: 10 };
      default:
        return { dotSize: 10, spacing: 8 };
    }
  };

  const { dotSize, spacing } = getSizeConfig();

  return (
    <View style={[styles.container, style]}>
      {steps.map((step, index) => {
        const isActive = step <= currentStep;

        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: isActive ? activeColor : inactiveColor,
                marginHorizontal: spacing / 2,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  dot: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default StepIndicator;
