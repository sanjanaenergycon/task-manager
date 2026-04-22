import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

const AUTH_KEY = 'worknest_auth';
const USER_KEY = 'worknest_user';

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(key, value);
      } catch {
        // Silent fail
      }
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(key);
      } catch {
        // Silent fail
      }
    }
  },
};

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authData = await storage.getItem(AUTH_KEY);
        const userData = await storage.getItem(USER_KEY);
        if (authData === 'true' && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        }
      } catch {
        console.error('Error checking auth');
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Validate email and password
    if (!email || !password) {
      if (Platform.OS === 'web') {
        alert('Please enter both email and password');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Please enter both email and password');
      }
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (Platform.OS === 'web') {
        alert('Please enter a valid email address');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Please enter a valid email address');
      }
      return false;
    }

    // Password length validation
    if (password.length < 6) {
      if (Platform.OS === 'web') {
        alert('Password must be at least 6 characters');
      } else {
        const { Alert } = require('react-native');
        Alert.alert('Error', 'Password must be at least 6 characters');
      }
      return false;
    }

    // Demo credentials check (you can change this to any valid credentials)
    // For demo purposes, accepting any valid format email/password
    try {
      await storage.setItem(AUTH_KEY, 'true');
      const userObj: User = {
        email,
        name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      };
      await storage.setItem(USER_KEY, JSON.stringify(userObj));
      setIsAuthenticated(true);
      setUser(userObj);
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem(AUTH_KEY);
      await storage.removeItem(USER_KEY);
      setIsAuthenticated(false);
      setUser(null);
    } catch {
      console.error('Error during logout');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
