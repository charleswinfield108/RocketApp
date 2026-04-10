import { Stack } from 'expo-router';

export default function RestaurantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      {/* Restaurant List Screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      {/* Restaurant Detail/Menu Screen */}
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />

      {/* Order Confirmation Modal */}
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Order Confirmation',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
