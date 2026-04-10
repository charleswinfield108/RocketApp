import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
      {/* Thumbnail */}
      <Image
        source={require('@/assets/images/Restaurants/RestaurantMenu.jpg')}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Item Info */}
      <View style={styles.itemInfo}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>$ {item.price.toFixed(2)}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Stepper */}
      <Stepper
        value={quantity}
        onIncrement={() => onQuantityChange(item.id, quantity + 1)}
        onDecrement={() => onQuantityChange(item.id, quantity - 1)}
        min={0}
        max={999}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222126',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#666666',
  },
});
