import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signout: () => Promise<void>; // alias for signOut
  authToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Check if user is already signed in on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          setIsSignedIn(true);
        }
      } catch (error) {
        console.error('Failed to restore auth token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      // JWT token will be returned from API and stored here
      // This will be called from the login screen after successful API call
      const token = 'dummy-token'; // Placeholder
      await AsyncStorage.setItem('authToken', token);
      setAuthToken(token);
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setAuthToken(null);
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
    signout: signOut, // alias for convenience
    authToken,
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
