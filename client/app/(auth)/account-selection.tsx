import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faCar } from '@fortawesome/free-solid-svg-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/services/authContext';
import { OswaldFonts } from '@/constants/theme';

export default function AccountSelectionScreen() {
  const { setActiveRole } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelect = (role: 'customer' | 'courier') => {
    setActiveRole(role);
    router.replace(
      role === 'customer' ? '/(tabs)/(restaurant)' : '/(courier)/deliveries'
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
      <Image
        source={require('@/assets/images/AppLogoV2.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Select Account Type</Text>

      <View style={styles.cardsRow}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect('customer')}
          activeOpacity={0.8}
        >
          <FontAwesomeIcon icon={faUser as any} size={40} color="#DA583B" />
          <Text style={styles.cardLabel}>Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect('courier')}
          activeOpacity={0.8}
        >
          <FontAwesomeIcon icon={faCar as any} size={40} color="#DA583B" />
          <Text style={styles.cardLabel}>Courier</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 220,
    height: 100,
    marginBottom: 48,
  },
  title: {
    fontSize: 22,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 48,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  card: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: OswaldFonts.semiBold,
    color: '#222126',
  },
});
