import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/services/authContext';
import AccountForm from '@/components/AccountForm';
import { Header } from '@/components/Header';

export default function CourierAccountScreen() {
  const { userId } = useAuth();

  return (
    <View style={styles.container}>
      <Header />
      <AccountForm role="courier" userId={userId!} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
