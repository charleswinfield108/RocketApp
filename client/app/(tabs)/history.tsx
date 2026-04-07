import { View, Text, StyleSheet } from 'react-native';

export default function OrderHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Order History</Text>
      <Text style={styles.subtitle}>To be implemented</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
