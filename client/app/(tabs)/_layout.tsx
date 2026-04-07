import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUtensils, faHistory, faUser } from '@fortawesome/free-solid-svg-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Header } from '@/components/Header';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      {/* Header visible on all authenticated screens */}
      <Header />
      
      {/* Tab navigator */}
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
              <FontAwesomeIcon icon={faUtensils as any} size={24} color={color} />
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

        {/* Profile Tab */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faUser as any} size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
