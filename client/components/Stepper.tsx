import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface StepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 999,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onIncrement();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === min && styles.buttonDisabled]}
        onPress={handleDecrement}
        disabled={value === min}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, value === min && styles.buttonTextDisabled]}>
          −
        </Text>
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity
        style={[styles.button, value === max && styles.buttonDisabled]}
        onPress={handleIncrement}
        disabled={value === max}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, value === max && styles.buttonTextDisabled]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#222126',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222126',
  },
  buttonDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextDisabled: {
    color: '#CCCCCC',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222126',
    minWidth: 40,
    textAlign: 'center',
  },
});
