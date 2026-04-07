import React, { useState, useEffect, useCallback } from 'react';
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
import { OrderHistoryDetailModal } from '../../components/OrderHistoryDetailModal';
import orderHistoryAPI, { Order } from '../../services/orderHistoryService';

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return '#4CAF50';
    case 'preparing':
      return '#2196F3';
    case 'out for delivery':
      return '#FF9800';
    case 'cancelled':
      return '#F44336';
    case 'confirmed':
    default:
      return '#9E9E9E';
  }
};

const capitalizeStatus = (status: string): string => {
  return status
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatOrderDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Load orders from API
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderHistoryAPI.getHistory();
      const orderList = response.data.orders || [];
      // Sort by date (newest first)
      orderList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(orderList);
    } catch (err) {
      console.error('Error loading order history:', err);
      setError('Failed to load order history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reload orders when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await orderHistoryAPI.getHistory();
      const orderList = response.data.orders || [];
      orderList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(orderList);
    } catch (err) {
      console.error('Error refreshing orders:', err);
      setError('Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle View button click
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DA583B" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyStateText}>No orders yet</Text>
        <Text style={styles.emptyStateSubtext}>Your orders will appear here</Text>
      </View>
    );
  }

  // Table header
  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.columnHeader, styles.orderColumn]}>Order</Text>
      <Text style={[styles.columnHeader, styles.statusColumn]}>Status</Text>
      <Text style={[styles.columnHeader, styles.viewColumn]}>View</Text>
    </View>
  );

  // Table row
  const renderOrderRow = ({ item }: { item: Order }) => (
    <View style={styles.tableRow}>
      <View style={[styles.cell, styles.orderColumn]}>
        <Text style={styles.orderIdText} numberOfLines={1}>
          {item.orderId}
        </Text>
        <Text style={styles.orderDateText}>{formatOrderDate(item.createdAt)}</Text>
      </View>

      <View style={[styles.cell, styles.statusColumn]}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusBadgeText} numberOfLines={1}>
            {capitalizeStatus(item.status)}
          </Text>
        </View>
      </View>

      <View style={[styles.cell, styles.viewColumn]}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewOrder(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonIcon}>📋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Table Header */}
      {renderHeader()}

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={renderOrderRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#DA583B"
          />
        }
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No orders found</Text>
          </View>
        }
      />

      {/* Order Detail Modal */}
      <OrderHistoryDetailModal
        visible={detailModalVisible}
        order={selectedOrder}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999999',
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#CCCCCC',
    marginTop: 6,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  // Table styles
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  columnHeader: {
    fontWeight: '700',
    fontSize: 12,
    color: '#222126',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderColumn: {
    flex: 1.5,
  },
  statusColumn: {
    flex: 1,
  },
  viewColumn: {
    flex: 0.6,
    alignItems: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 2,
  },
  orderDateText: {
    fontSize: 11,
    color: '#999999',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonIcon: {
    fontSize: 16,
  },
});
