import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHamburger, faHistory } from '@fortawesome/free-solid-svg-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Restaurants Tab - with nested stack navigator */}
      <Tabs.Screen
        name="(restaurant)"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faHamburger as any} size={24} color={color} />
          ),
        }}
      />

      {/* Order History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faHistory as any} size={24} color={color} />
          ),
        }}
      />

      {/* Hide unused tabs */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
