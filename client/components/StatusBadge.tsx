import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { OswaldFonts } from '@/constants/theme';
import { getStatusColor, getStatusDisplay } from '@/constants/orderStatus';

interface StatusBadgeProps {
  status: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function StatusBadge({ status, onPress, loading = false, disabled = false }: StatusBadgeProps) {
  const color = getStatusColor(status);
  const display = getStatusDisplay(status);
  const isLocked = status === 'delivered';
  const interactive = !isLocked && !!onPress;

  if (interactive) {
    return (
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: color }, disabled && styles.badgeDisabled]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.badgeText}>{display}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    minHeight: 28,
  },
  badgeDisabled: {
    opacity: 0.6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: OswaldFonts.bold,
    textAlign: 'center',
  },
});
