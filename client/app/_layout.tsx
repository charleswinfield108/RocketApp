import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useFonts, Oswald_400Regular, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/services/authContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading, customerId, courierId, activeRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isSignedIn) {
      router.replace('/(auth)/login');
      return;
    }

    const isCustomer = customerId != null;
    const isCourier = courierId != null;

    if (isCustomer && !isCourier) {
      // Single-role customer
      router.replace('/(tabs)/(restaurant)');
    } else if (isCourier && !isCustomer) {
      // Single-role courier
      router.replace('/(courier)/deliveries');
    } else if (isCustomer && isCourier) {
      // Dual-role: route by activeRole or prompt selection
      if (activeRole === 'customer') {
        router.replace('/(tabs)/(restaurant)');
      } else if (activeRole === 'courier') {
        router.replace('/(courier)/deliveries');
      } else {
        router.replace('/(auth)/account-selection');
      }
    } else {
      // No role — fallback to login
      router.replace('/(auth)/login');
    }
  }, [isSignedIn, isLoading, customerId, courierId, activeRole, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"    options={{ headerShown: false }} />
        <Stack.Screen name="(courier)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"    options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
