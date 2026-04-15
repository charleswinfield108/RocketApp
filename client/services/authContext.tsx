import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActiveRole = 'customer' | 'courier' | null;

interface AuthContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  authToken: string | null;
  userId: number | null;
  customerId: number | null;
  courierId: number | null;
  activeRole: ActiveRole;
  signIn: (
    email: string,
    token: string,
    userId: number | null,
    customerId: number | null,
    courierId: number | null
  ) => Promise<void>;
  setActiveRole: (role: 'customer' | 'courier') => void;
  signOut: () => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [courierId, setCourierId] = useState<number | null>(null);
  const [activeRole, setActiveRoleState] = useState<ActiveRole>(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedCustomerId = await AsyncStorage.getItem('customerId');
        const storedCourierId = await AsyncStorage.getItem('courierId');

        if (token) {
          setAuthToken(token);
          setIsSignedIn(true);
        }
        if (storedUserId) setUserId(parseInt(storedUserId, 10));
        if (storedCustomerId) setCustomerId(parseInt(storedCustomerId, 10));
        if (storedCourierId) setCourierId(parseInt(storedCourierId, 10));
      } catch (error) {
        console.error('Failed to restore auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (
    _email: string,
    token: string,
    uId: number | null,
    cId: number | null,
    dId: number | null
  ) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      if (uId !== null) await AsyncStorage.setItem('userId', String(uId));
      if (cId !== null) await AsyncStorage.setItem('customerId', String(cId));
      if (dId !== null) await AsyncStorage.setItem('courierId', String(dId));

      setAuthToken(token);
      setUserId(uId);
      setCustomerId(cId);
      setCourierId(dId);
      setIsSignedIn(true);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const setActiveRole = (role: 'customer' | 'courier') => {
    setActiveRoleState(role);
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AsyncStorage.multiRemove(['authToken', 'userId', 'customerId', 'courierId']);
      setAuthToken(null);
      setUserId(null);
      setCustomerId(null);
      setCourierId(null);
      setActiveRoleState(null);
      setIsSignedIn(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isSignedIn,
    isLoading,
    authToken,
    userId,
    customerId,
    courierId,
    activeRole,
    signIn,
    setActiveRole,
    signOut,
    signout: signOut,
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
