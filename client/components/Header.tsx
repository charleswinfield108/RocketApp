import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/authContext';
import { Colors } from '@/constants/theme';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const router = useRouter();
  const { signout } = useAuth();

  const handleLogout = async () => {
    try {
      // Clear token from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      
      // Clear auth state through context
      signout();
      
      // Trigger optional callback
      if (onLogout) {
        onLogout();
      }

      // Navigate to login screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.header}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/AppLogoV2.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>Rocket Food</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        onPress={handleLogout}
        style={styles.logoutButton}
        activeOpacity={0.85}
      >
        <FontAwesomeIcon 
          icon={faSignOutAlt as any} 
          size={16} 
          color="#FFFFFF"
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222126',
    letterSpacing: 0.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#DA583B',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
