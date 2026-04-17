import React, { useState, useEffect, useCallback } from 'react';
import { OswaldFonts } from '@/constants/theme';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/Header';
import { OrderHistoryDetailModal } from '@/components/OrderHistoryDetailModal';
import { useAuth } from '@/services/authContext';
import orderHistoryAPI, { Order } from '@/services/orderHistoryService';

// Sort orders newest-first by creation date
const sortByDate = (list: Order[]): Order[] =>
  [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export default function OrderHistoryScreen() {
  const { customerId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!customerId) return;
      const response = await orderHistoryAPI.getHistory(customerId);
      const orderList = Array.isArray(response.data.orders)
        ? response.data.orders
        : [];
      setOrders(sortByDate(orderList));
    } catch {
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (!customerId) return;
      const response = await orderHistoryAPI.getHistory(customerId);
      const orderList = Array.isArray(response.data.orders)
        ? response.data.orders
        : [];
      setOrders(sortByDate(orderList));
    } catch {
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [customerId]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      {/* Page Title */}
      <Text style={styles.pageTitle}>MY ORDERS</Text>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.columnHeader, styles.orderColumn]}>ORDER</Text>
        <Text style={[styles.columnHeader, styles.statusColumn]}>STATUS</Text>
        <Text style={[styles.columnHeader, styles.viewColumn]}>VIEW</Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#DA583B" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Start by ordering from a restaurant!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            {/* Restaurant Name */}
            <View style={[styles.cell, styles.orderColumn]}>
              <Text style={styles.restaurantName} numberOfLines={2}>
                {item.restaurantName}
              </Text>
            </View>

            {/* Status */}
            <View style={[styles.cell, styles.statusColumn]}>
              <Text style={styles.statusText}>
                {item.status.toUpperCase()}
              </Text>
            </View>

            {/* View Button */}
            <View style={[styles.cell, styles.viewColumn]}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewOrder(item)}
                activeOpacity={0.7}
              >
                <FontAwesomeIcon icon={faMagnifyingGlassPlus as any} size={16} color="#222126" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <OrderHistoryDetailModal
        visible={detailModalVisible}
        order={selectedOrder}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }}
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
  pageTitle: {
    fontSize: 18,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#DA583B',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  columnHeader: {
    fontFamily: OswaldFonts.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  orderColumn: {
    flex: 2,
  },
  statusColumn: {
    flex: 1.5,
  },
  viewColumn: {
    flex: 0.8,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222126',
  },
  statusText: {
    fontSize: 13,
    color: '#222126',
    fontWeight: '500',
  },
  viewButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#CCCCCC',
  },
});
