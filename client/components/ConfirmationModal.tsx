import React, { useState } from 'react';
import { OswaldFonts } from '@/constants/theme';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

type ModalState = 'idle' | 'processing' | 'success' | 'error';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  items,
  totalPrice,
  restaurantName,
  onConfirm,
  onCancel,
}) => {
  const [state, setState] = useState<ModalState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [snapshot, setSnapshot] = useState<{ items: OrderItem[]; total: number } | null>(null);

  // Displayed values — use snapshot once processing starts so cart reset doesn't blank them
  const displayItems = snapshot ? snapshot.items : items;
  const displayTotal = snapshot ? snapshot.total : totalPrice;

  // Handle confirm button press
  const handleConfirmPress = async () => {
    setSnapshot({ items, total: totalPrice });
    setState('processing');
    setErrorMessage('');
    const start = Date.now();
    try {
      await onConfirm();
      // Ensure processing state is visible for at least 1.5s
      const elapsed = Date.now() - start;
      if (elapsed < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
      }
      setState('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      setErrorMessage(message);
      setState('error');
    }
  };

  // Handle closing modal and resetting state
  const handleClose = () => {
    setState('idle');
    setErrorMessage('');
    setSnapshot(null);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Order Confirmation</Text>
            <TouchableOpacity onPress={handleClose} disabled={state === 'processing'}>
              <Text style={[styles.closeButton, state === 'processing' && styles.closeButtonDisabled]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
          {/* Restaurant Name */}
          <View style={styles.restaurantSection}>
            <Text style={styles.restaurantLabel}>Restaurant</Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </View>

          {/* Order Items — always visible */}
          <ScrollView style={styles.itemsContainer}>
            {displayItems.map((item) => (
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
            <Text style={styles.totalPrice}>${displayTotal.toFixed(2)}</Text>
          </View>

          {/* Action Buttons */}
          {state !== 'success' && (
            <View style={styles.buttonContainer}>
              {state === 'idle' && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  (state === 'processing' || state === 'error') && styles.buttonFullWidth,
                ]}
                onPress={handleConfirmPress}
                disabled={state === 'processing'}
                activeOpacity={0.8}
              >
                {state === 'processing' ? (
                  <View style={styles.processingContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
                    <Text style={[styles.buttonText, styles.confirmButtonText]}>
                      Processing Order…
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.buttonText, styles.confirmButtonText]}>
                    Confirm Order
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Success State */}
          {state === 'success' && (
            <View style={styles.successContainer}>
              <View style={styles.successCircle}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <Text style={styles.successMessage}>Thank you! Your order has been received.</Text>
            </View>
          )}

          {/* Error State */}
          {state === 'error' && (
            <View style={styles.errorContainer}>
              <View style={styles.errorCircle}>
                <Text style={styles.errorIcon}>✕</Text>
              </View>
              <Text style={styles.errorMessage}>
                Your order was not processed successfully. Please try again.
              </Text>
            </View>
          )}
          </View>{/* end content */}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222126',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: OswaldFonts.bold,
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  closeButtonDisabled: {
    color: '#999999',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#609475',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#609475',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  errorCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#851919',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 15,
    fontWeight: '600',
    color: '#851919',
    textAlign: 'center',
    paddingHorizontal: 12,
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
    color: '#222126',
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
    fontWeight: '900',
    color: '#222126',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#222126',
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
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#DA583B',
    borderColor: '#DA583B',
  },
  buttonFullWidth: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#666666',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
  processingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    marginRight: 4,
  },
});
