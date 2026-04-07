import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stepper } from './Stepper';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface MenuItemProps {
  item: MenuItem;
  quantity: number;
  onQuantityChange: (id: string, newQuantity: number) => void;
}

export const MenuItemComponent: React.FC<MenuItemProps> = ({
  item,
  quantity,
  onQuantityChange,
}) => {
  const handleIncrement = () => {
    onQuantityChange(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    onQuantityChange(item.id, quantity - 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.itemInfo}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.stepperContainer}>
        <Stepper
          value={quantity}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          min={0}
          max={999}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DA583B',
  },
  stepperContainer: {
    paddingVertical: 8,
  },
});
