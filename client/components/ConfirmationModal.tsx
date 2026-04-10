import React, { useState } from 'react';
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

  // Handle confirm button press
  const handleConfirmPress = async () => {
    setState('processing');
    setErrorMessage('');
    try {
      await onConfirm();
      setState('success');
      // Auto-close after 2 seconds on success
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

          {/* Restaurant Name */}
          <View style={styles.restaurantSection}>
            <Text style={styles.restaurantLabel}>Restaurant</Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </View>

          {/* Success State */}
          {state === 'success' && (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successMessage}>Order placed successfully!</Text>
            </View>
          )}

          {/* Error State */}
          {state === 'error' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>✕</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
          )}

          {/* Order Items (hidden in success state) */}
          {state !== 'success' && (
            <>
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
            </>
          )}

          {/* Action Buttons */}
          {state !== 'success' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  state === 'processing' && styles.buttonDisabled,
                ]}
                onPress={handleClose}
                disabled={state === 'processing'}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.buttonText,
                    styles.cancelButtonText,
                    state === 'processing' && styles.buttonTextDisabled,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  state === 'processing' && styles.buttonDisabled,
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
    backgroundColor: '#222126',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  closeButtonDisabled: {
    color: '#999999',
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
    paddingVertical: 40,
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 60,
    color: '#609475',
    fontWeight: '700',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#609475',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginBottom: 16,
    backgroundColor: '#FEE8E8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#851919',
  },
  errorIcon: {
    fontSize: 50,
    color: '#851919',
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
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
