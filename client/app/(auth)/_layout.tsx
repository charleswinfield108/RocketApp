import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen 
        name="login"
        options={{
          headerShown: false,
          title: '',
        }}
      />
    </Stack>
  );
}
