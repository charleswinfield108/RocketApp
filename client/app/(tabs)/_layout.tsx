import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHamburger, faHistory, faUser } from '@fortawesome/free-solid-svg-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'ios' ? 28 : insets.bottom + 8;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: Platform.OS === 'ios' ? 84 : 56 + insets.bottom,
          paddingBottom: bottomPad,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
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
          title: 'Order History',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faHistory as any} size={24} color={color} />
          ),
        }}
      />

      {/* Account Tab */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={faUser as any} size={24} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
