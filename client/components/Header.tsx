import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRocket, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
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
        <FontAwesomeIcon 
          icon={faRocket as any} 
          size={24} 
          color="#FF6B6B" 
        />
        <Text style={styles.logoText}>Rocket Food</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        onPress={handleLogout}
        style={styles.logoutButton}
        activeOpacity={0.7}
      >
        <FontAwesomeIcon 
          icon={faSignOutAlt as any} 
          size={20} 
          color="#FF6B6B"
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B6B',
  },
});
