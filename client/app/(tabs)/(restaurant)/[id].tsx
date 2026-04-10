import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { OswaldFonts } from '@/constants/theme';
import { MenuItemComponent, MenuItem } from '../../../components/MenuItem';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { Header } from '../../../components/Header';
import { useAuth } from '../../../services/authContext';
import menuAPI from '../../../services/menuService';
import { restaurantsAPI, ordersAPI } from '../../../services/api';

interface RestaurantInfo {
  id: number;
  name: string;
  rating: number;
  price_range: number;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

  const { customerId } = useAuth();
  const currentRestaurantId = id ? parseInt(id as string, 10) : NaN;

  const resetCart = useCallback(() => {
    setCart({});
  }, []);

  const loadMenu = useCallback(async () => {
    if (!id || isNaN(currentRestaurantId)) {
      setError('Invalid restaurant ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      resetCart();

      const restaurantResponse = await restaurantsAPI.getById(currentRestaurantId);
      const restaurantData = restaurantResponse.data.data || restaurantResponse.data;
      setRestaurant(restaurantData);

      const menuResponse = await menuAPI.getMenuByRestaurantId(currentRestaurantId);
      const rawItems = menuResponse.data.data || [];
      const items: MenuItem[] = rawItems.map((p) => ({
        id: String(p.id),
        name: p.name,
        description: p.description,
        price: p.cost,
      }));
      setMenuItems(items);

      const initialCart: Record<string, number> = {};
      items.forEach((item) => {
        initialCart[item.id] = 0;
      });
      setCart(initialCart);
    } catch {
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, currentRestaurantId, resetCart]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useFocusEffect(
    useCallback(() => {
      resetCart();
    }, [resetCart])
  );

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setCart((prev) => ({ ...prev, [itemId]: Math.max(0, newQuantity) }));
  };

  const hasItems = Object.values(cart).some((qty) => qty > 0);

  const totalPrice = Object.entries(cart).reduce((sum, [itemId, quantity]) => {
    const item = menuItems.find((m) => m.id === itemId);
    return sum + (item ? item.price * quantity : 0);
  }, 0);

  const handleConfirmOrder = async () => {
    const orderItems = Object.entries(cart)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({ menuItemId: itemId, quantity }));

    if (orderItems.length === 0) throw new Error('Please select at least one item');

    const response = await ordersAPI.create({
      restaurant_id: currentRestaurantId,
      customer_id: customerId,
      products: orderItems.map((i) => ({ id: parseInt(i.menuItemId, 10), quantity: i.quantity })),
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Order submission failed');
    }

    resetCart();
  };

  const getStars = (rating: number) =>
    '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  const getPriceDisplay = (priceRange: number) => '$'.repeat(priceRange);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMenu}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <Text style={styles.sectionTitle}>RESTAURANT MENU</Text>

        {/* Restaurant Info Row */}
        {restaurant && (
          <View style={styles.restaurantRow}>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantDetail}>
                Price: {getPriceDisplay(restaurant.price_range)}
              </Text>
              <Text style={styles.restaurantDetail}>
                Rating: {getStars(restaurant.rating)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.createOrderButton, !hasItems && styles.createOrderButtonDisabled]}
              onPress={() => setIsConfirmationModalVisible(true)}
              disabled={!hasItems}
              activeOpacity={0.8}
            >
              <Text style={styles.createOrderButtonText}>Create Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              quantity={cart[item.id] || 0}
              onQuantityChange={handleQuantityChange}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No menu items available</Text>
          </View>
        )}
      </ScrollView>

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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  restaurantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginBottom: 2,
  },
  restaurantDetail: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 1,
  },
  createOrderButton: {
    backgroundColor: '#DA583B',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  createOrderButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  createOrderButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
});
