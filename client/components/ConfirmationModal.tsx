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
  onConfirm: (sendEmail: boolean, sendSms: boolean) => Promise<void>;
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
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);

  // Displayed values — use snapshot once processing starts so cart reset doesn't blank them
  const displayItems = snapshot ? snapshot.items : items;
  const displayTotal = snapshot ? snapshot.total : totalPrice;

  const isDisabled = state === 'processing' || state === 'success';

  const handleConfirmPress = async () => {
    setSnapshot({ items, total: totalPrice });
    setState('processing');
    setErrorMessage('');
    const start = Date.now();
    try {
      await onConfirm(sendEmail, sendSms);
      // Ensure processing state is visible for at least 1.5s
      const elapsed = Date.now() - start;
      if (elapsed < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
      }
      setState('success');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (error instanceof Error ? error.message : null) ||
        'Order creation failed. Please try again.';
      setErrorMessage(message);
      setState('error');
    }
  };

  const handleClose = () => {
    setState('idle');
    setErrorMessage('');
    setSnapshot(null);
    setSendEmail(false);
    setSendSms(false);
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
          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Restaurant Name */}
            <View style={styles.restaurantSection}>
              <Text style={styles.restaurantLabel}>Restaurant</Text>
              <Text style={styles.restaurantName}>{restaurantName}</Text>
            </View>

            {/* Order Summary label */}
            <Text style={styles.sectionLabel}>Order Summary</Text>

            {/* Order Items */}
            {displayItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  $ {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalPrice}>$ {displayTotal.toFixed(2)}</Text>
            </View>

            {/* Notification opt-in — only shown before success */}
            {state !== 'success' && (
              <>
                <View style={styles.divider} />
                <Text style={styles.notifyPrompt}>
                  Would you like to receive your order confirmation by email and/or text?
                </Text>
                <View style={styles.checkboxRow}>
                  {/* By Email */}
                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => setSendEmail(prev => !prev)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, sendEmail && styles.checkboxChecked]}>
                      {sendEmail && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, isDisabled && styles.labelDisabled]}>
                      By Email
                    </Text>
                  </TouchableOpacity>

                  {/* By Phone */}
                  <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => setSendSms(prev => !prev)}
                    disabled={isDisabled}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, sendSms && styles.checkboxChecked]}>
                      {sendSms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, isDisabled && styles.labelDisabled]}>
                      By Phone
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Action Buttons */}
            {state !== 'success' && (
              <View style={styles.buttonContainer}>
                {state === 'idle' && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleClose}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmButton,
                    state !== 'idle' && styles.buttonFullWidth,
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
                      CONFIRM ORDER
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
                <Text style={styles.successMessage}>Order created successfully!</Text>
              </View>
            )}

            {/* Error State */}
            {state === 'error' && (
              <View style={styles.errorContainer}>
                <View style={styles.errorCircle}>
                  <Text style={styles.errorIcon}>✕</Text>
                </View>
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              </View>
            )}
          </ScrollView>
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
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222126',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  restaurantSection: {
    marginBottom: 14,
  },
  restaurantLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222126',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
  },
  itemQty: {
    fontSize: 13,
    color: '#666666',
    marginHorizontal: 12,
    minWidth: 28,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222126',
    minWidth: 64,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
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
  totalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#222126',
  },
  // ── Notification opt-in ────────────────────────────────────────────────────
  notifyPrompt: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 12,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#DA583B',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#DA583B',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#222126',
  },
  labelDisabled: {
    color: '#AAAAAA',
  },
  // ── Buttons ────────────────────────────────────────────────────────────────
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  buttonFullWidth: {
    flex: 1,
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
  processingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    marginRight: 4,
  },
  // ── Success / Error ────────────────────────────────────────────────────────
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
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
    paddingVertical: 16,
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
});
