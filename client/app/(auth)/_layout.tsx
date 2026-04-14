import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="login"             options={{ headerShown: false, title: '' }} />
      <Stack.Screen name="account-selection" options={{ headerShown: false, title: '' }} />
    </Stack>
  );
}
