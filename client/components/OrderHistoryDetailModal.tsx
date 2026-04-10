import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Order } from '../services/orderHistoryService';
import { OswaldFonts } from '@/constants/theme';

interface OrderHistoryDetailModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

export const OrderHistoryDetailModal: React.FC<OrderHistoryDetailModalProps> = ({
  visible,
  order,
  onClose,
}) => {
  if (!order) return null;

  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Dark Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.restaurantName}>{order.restaurantName}</Text>
              <Text style={styles.headerDetail}>Order Date: {formatDate(order.createdAt)}</Text>
              <Text style={styles.headerDetail}>Status: {order.status.toUpperCase()}</Text>
              <Text style={styles.headerDetail}>
                Courier: {order.courier?.name ?? 'Not yet assigned'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Items */}
          <ScrollView style={styles.content}>
            {order.items.map((item) => (
              <View key={item.itemId} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>$ {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}

            {/* Divider + Total */}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalAmount}>$ {total.toFixed(2)}</Text>
            </View>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#222126',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: OswaldFonts.bold,
    color: '#DA583B',
    marginBottom: 6,
  },
  headerDetail: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#222126',
  },
  itemQty: {
    fontSize: 14,
    color: '#666666',
    minWidth: 28,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    minWidth: 70,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#222126',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '400',
    color: '#222126',
  },
});
