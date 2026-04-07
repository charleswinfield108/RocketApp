import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MenuItemComponent, MenuItem } from '../../../components/MenuItem';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import menuAPI from '../../../services/menuService';
import { restaurantsAPI } from '../../../services/api';

interface CartItem extends MenuItem {
  quantity: number;
}

interface RestaurantInfo {
  id: string;
  name: string;
  rating: number;
  priceRange: number;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  // Current restaurant ID for detecting changes
  const currentRestaurantId = id as string;

  // Reset cart when restaurant changes
  const resetCart = useCallback(() => {
    setCart({});
  }, []);

  // Load menu when component mounts or restaurant ID changes
  const loadMenu = useCallback(async () => {
    if (!currentRestaurantId) return;

    setLoading(true);
    setError(null);

    try {
      // Reset cart when switching restaurants
      resetCart();

      // Fetch restaurant details
      const restaurantResponse = await restaurantsAPI.getById(currentRestaurantId);
      setRestaurant(restaurantResponse.data);

      // Fetch menu items
      const menuResponse = await menuAPI.getMenuByRestaurantId(currentRestaurantId);
      const items = Array.isArray(menuResponse.data)
        ? menuResponse.data
        : menuResponse.data.items || [];
      setMenuItems(items);

      // Initialize cart with zeros
      const initialCart: Record<string, number> = {};
      items.forEach((item) => {
        initialCart[item.id] = 0;
      });
      setCart(initialCart);
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentRestaurantId, resetCart]);

  // Load menu on mount and when restaurant ID changes
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Also reset cart when screen comes into focus (user navigates back)
  useFocusEffect(
    useCallback(() => {
      resetCart();
    }, [resetCart])
  );

  // Handle quantity change - only allow via buttons, minimum 0
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    // Ensure quantity never goes below 0
    const quantity = Math.max(0, newQuantity);
    setCart((prev) => ({
      ...prev,
      [itemId]: quantity,
    }));
  };

  // Check if any items have quantity > 0
  const hasItems = Object.values(cart).some((qty) => qty > 0);

  // Calculate total items and price
  const getTotals = () => {
    let totalItems = 0;
    let totalPrice = 0;

    Object.entries(cart).forEach(([itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (item) {
        totalItems += quantity;
        totalPrice += item.price * quantity;
      }
    });

    return { totalItems, totalPrice };
  };

  const { totalItems, totalPrice } = getTotals();

  const handleCreateOrder = () => {
    if (!hasItems) {
      Alert.alert('Alert', 'Please select at least one item');
      return;
    }
    // Open confirmation modal
    setIsConfirmationModalVisible(true);
  };

  const handleConfirmOrder = () => {
    // TODO: Submit order to API
    setIsConfirmationModalVisible(false);
    Alert.alert('Success', 'Order placed successfully!');
    resetCart();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMenu}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Restaurant Menu Image */}
      <Image
        source={require('../../../assets/images/RestaurantMenu.jpg')}
        style={styles.menuImage}
        resizeMode="cover"
      />

      {/* Restaurant Header */}
      {restaurant && (
        <View style={styles.header}>
          <View>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantInfo}>
              {'★'.repeat(Math.floor(restaurant.rating))} • {'$'.repeat(restaurant.priceRange)}
            </Text>
          </View>
        </View>
      )}

      {/* Menu Items List */}
      {menuItems.length > 0 ? (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MenuItemComponent
              item={item}
              quantity={cart[item.id] || 0}
              onQuantityChange={handleQuantityChange}
            />
          )}
          scrollEnabled={false}
          style={styles.menuList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No menu items available</Text>
        </View>
      )}

      {/* Create Order Button */}
      <View style={styles.footer}>
        {hasItems && (
          <View style={styles.totalsContainer}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Items:</Text>
              <Text style={styles.totalsValue}>{totalItems}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total:</Text>
              <Text style={styles.totalsValue}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.createOrderButton, !hasItems && styles.createOrderButtonDisabled]}
          onPress={handleCreateOrder}
          disabled={!hasItems}
          activeOpacity={hasItems ? 0.8 : 1}
        >
          <Text
            style={[
              styles.createOrderButtonText,
              !hasItems && styles.createOrderButtonTextDisabled,
            ]}
          >
            {hasItems ? 'Create Order' : 'Add Items to Order'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={isConfirmationModalVisible}
        items={menuItems
          .filter((item) => (cart[item.id] || 0) > 0)
          .map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: cart[item.id] || 0,
          }))}
        totalPrice={totalPrice}
        restaurantName={restaurant?.name || 'Restaurant'}
        onConfirm={handleConfirmOrder}
        onCancel={() => setIsConfirmationModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222126',
    marginBottom: 4,
  },
  restaurantInfo: {
    fontSize: 13,
    color: '#666666',
  },
  menuList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    fontSize: 14,
    color: '#DA583B',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#DA583B',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalsContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalsLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  totalsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222126',
  },
  createOrderButton: {
    paddingVertical: 14,
    backgroundColor: '#DA583B',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createOrderButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  createOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createOrderButtonTextDisabled: {
    color: '#CCCCCC',
  },
});
