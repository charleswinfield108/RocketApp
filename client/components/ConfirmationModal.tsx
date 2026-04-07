import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ConfirmationModalProps {
  visible: boolean;
  items: OrderItem[];
  totalPrice: number;
  restaurantName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  items,
  totalPrice,
  restaurantName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Order Confirmation</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Restaurant Name */}
          <View style={styles.restaurantSection}>
            <Text style={styles.restaurantLabel}>Restaurant</Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </View>

          {/* Order Items */}
          <ScrollView style={styles.itemsContainer}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                Confirm Order
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222126',
  },
  closeButton: {
    fontSize: 20,
    color: '#666666',
  },
  restaurantSection: {
    marginBottom: 12,
  },
  restaurantLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222126',
  },
  itemsContainer: {
    maxHeight: 250,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 12,
    color: '#999999',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DA583B',
    marginLeft: 8,
    minWidth: 60,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222126',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DA583B',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#DA583B',
    borderColor: '#DA583B',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666666',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});
