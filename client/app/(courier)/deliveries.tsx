import { View, Text, StyleSheet } from 'react-native';
import { OswaldFonts } from '@/constants/theme';

export default function CourierDeliveriesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MY DELIVERIES</Text>
      <Text style={styles.subtitle}>Courier deliveries — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontFamily: OswaldFonts.bold,
    color: '#222126',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
});
