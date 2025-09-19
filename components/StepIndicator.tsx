// components/StepIndicator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../constants/Colors';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps = 6 }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <React.Fragment key={index}>
            <View
              style={[
                styles.circle,
                isCompleted && styles.completedCircle,
                isCurrent && styles.currentCircle,
              ]}
            >
              {isCompleted ? (
                <MaterialCommunityIcons name="check" size={14} color="#fff" />
              ) : (
                <View style={styles.emptyDot} />
              )}
            </View>

            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.line,
                  step < currentStep ? styles.completedLine : styles.incompleteLine,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  completedCircle: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  currentCircle: {
    borderColor: Colors.light.tint,
    backgroundColor: 'white',
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#D1D5DB', // light gray line by default
  },
  completedLine: {
    backgroundColor: Colors.light.tint,
  },
  incompleteLine: {
    backgroundColor: '#D1D5DB',
  },
});

export default StepIndicator;
