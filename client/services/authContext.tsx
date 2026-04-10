import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, token: string, customerId: number) => Promise<void>;
  signOut: () => Promise<void>;
  signout: () => Promise<void>;
  authToken: string | null;
  customerId: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedCustomerId = await AsyncStorage.getItem('customerId');
        if (token) {
          setAuthToken(token);
          setIsSignedIn(true);
        }
        if (storedCustomerId) {
          setCustomerId(parseInt(storedCustomerId, 10));
        }
      } catch (error) {
        console.error('Failed to restore auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (_email: string, token: string, cId: number) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('customerId', String(cId));
      setAuthToken(token);
      setCustomerId(cId);
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('customerId');
      setAuthToken(null);
      setCustomerId(null);
      setIsSignedIn(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isSignedIn,
    isLoading,
    signIn,
    signOut,
    signout: signOut,
    authToken,
    customerId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
