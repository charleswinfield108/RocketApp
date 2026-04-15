import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/services/authContext';
import { getDeliveries, advanceOrderStatus, ApiOrderDTO } from '@/services/courierService';
import StatusBadge from '@/components/StatusBadge';
import { OswaldFonts } from '@/constants/theme';

export default function CourierDeliveriesScreen() {
  const { courierId } = useAuth();

  const [deliveries, setDeliveries] = useState<ApiOrderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrderDTO | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchDeliveries = useCallback(async () => {
    if (!courierId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDeliveries(courierId);
      setDeliveries(data);
    } catch {
      setError('Failed to load deliveries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [courierId]);

  useFocusEffect(
    useCallback(() => {
      fetchDeliveries();
    }, [fetchDeliveries])
  );

  const handleAdvanceStatus = async (order: ApiOrderDTO) => {
    if (order.status === 'delivered') return;

    const previousDeliveries = deliveries;
    const nextStatusLabel =
      order.status === 'pending' ? 'in progress' : 'delivered';

    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === order.id ? { ...d, status: nextStatusLabel } : d
      )
    );
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...order, status: nextStatusLabel });
    }

    setUpdatingOrderId(order.id);
    try {
      const updated = await advanceOrderStatus(order);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === updated.id ? { ...d, status: updated.status } : d))
      );
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
      }
    } catch {
      setDeliveries(previousDeliveries);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(order);
      }
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  const formatCents = (cents: number): string =>
    (cents / 100).toFixed(2);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading && deliveries.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#DA583B" />
      </SafeAreaView>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error && deliveries.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDeliveries}>
          <Text style={styles.retryBtnText}>RETRY</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.heading}>MY DELIVERIES</Text>
      </View>

      {/* ─── Inline error banner ─────────────────────────────────────────── */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      {/* ─── Table ───────────────────────────────────────────────────────── */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colHeader, styles.colId]}>ORDER ID</Text>
          <Text style={[styles.colHeader, styles.colAddress]}>ADDRESS</Text>
          <Text style={[styles.colHeader, styles.colStatus]}>STATUS</Text>
          <Text style={[styles.colHeader, styles.colView]}>VIEW</Text>
        </View>

        {/* Empty state */}
        {deliveries.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No deliveries assigned.</Text>
          </View>
        ) : null}

        {/* Rows */}
        {deliveries.map((order) => (
          <View key={order.id} style={styles.tableRow}>
            {/* ORDER ID */}
            <Text style={[styles.cellText, styles.colId]}>{order.id}</Text>

            {/* ADDRESS */}
            <Text style={[styles.cellText, styles.colAddress]} numberOfLines={2}>
              {order.customer_address}
            </Text>

            {/* STATUS badge */}
            <View style={styles.colStatus}>
              <StatusBadge
                status={order.status}
                onPress={() => handleAdvanceStatus(order)}
                loading={updatingOrderId === order.id}
                disabled={updatingOrderId !== null}
              />
            </View>

            {/* VIEW icon */}
            <TouchableOpacity
              style={styles.colView}
              onPress={() => setSelectedOrder(order)}
              activeOpacity={0.7}
            >
              <FontAwesomeIcon icon={faSearch as any} size={18} color="#DA583B" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* ─── Delivery Details Modal ───────────────────────────────────────── */}
      <Modal
        visible={selectedOrder !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>DELIVERY DETAILS</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedOrder(null)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <FontAwesomeIcon icon={faTimes as any} size={20} color="#222126" />
                  </TouchableOpacity>
                </View>

                {/* Status sub-label */}
                <Text style={styles.modalStatusLabel}>
                  Status:{' '}
                  <Text style={styles.modalStatusValue}>
                    {selectedOrder.status.toUpperCase()}
                  </Text>
                </Text>

                {/* Advance status badge */}
                <View style={styles.modalBadgeRow}>
                  <StatusBadge
                    status={selectedOrder.status}
                    onPress={
                      selectedOrder.status !== 'delivered'
                        ? () => handleAdvanceStatus(selectedOrder)
                        : undefined
                    }
                    loading={updatingOrderId === selectedOrder.id}
                    disabled={updatingOrderId !== null}
                  />
                </View>

                <View style={styles.divider} />

                {/* Delivery details */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery Address:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.customer_address}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Restaurant:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.restaurant_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Order Date:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedOrder.created_on)}</Text>
                </View>

                <View style={styles.divider} />

                {/* Order items */}
                <Text style={styles.sectionTitle}>Order Details</Text>
                {selectedOrder.products.map((product, index) => (
                  <View key={index} style={styles.productRow}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productQty}>x{product.quantity}</Text>
                    <Text style={styles.productPrice}>
                      $ {formatCents(product.unit_cost * product.quantity)}
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL:</Text>
                  <Text style={styles.totalValue}>
                    $ {formatCents(selectedOrder.total_cost)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 24,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
  },
  errorText: {
    fontSize: 15,
    color: '#C1392B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#DA583B',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontFamily: OswaldFonts.bold,
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: '#FFF0EE',
    borderLeftWidth: 4,
    borderLeftColor: '#C1392B',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  errorBannerText: {
    color: '#C1392B',
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  colHeader: {
    fontFamily: OswaldFonts.bold,
    fontSize: 12,
    color: '#222126',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cellText: {
    fontSize: 13,
    color: '#222126',
  },
  colId: {
    width: 60,
  },
  colAddress: {
    flex: 1,
    paddingRight: 8,
  },
  colStatus: {
    width: 110,
    alignItems: 'center',
  },
  colView: {
    width: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999999',
    fontFamily: OswaldFonts.regular,
  },
  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: OswaldFonts.bold,
    color: '#DA583B',
  },
  modalStatusLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  modalStatusValue: {
    fontFamily: OswaldFonts.bold,
    color: '#222126',
  },
  modalBadgeRow: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    color: '#444444',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    flex: 1,
    fontSize: 13,
    color: '#444444',
  },
  productQty: {
    fontSize: 13,
    color: '#666666',
    width: 36,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 13,
    color: '#222126',
    width: 70,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
  },
});
