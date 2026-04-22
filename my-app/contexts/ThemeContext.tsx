import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

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
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#f8f9fa',
  card: '#fff',
  text: '#333',
  textSecondary: '#666',
  textMuted: '#999',
  primary: '#1e3a5f',
  border: '#e0e0e0',
  input: '#fff',
  header: '#fff',
};

const darkColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#fff',
  textSecondary: '#ccc',
  textMuted: '#999',
  primary: '#4a90d9',
  border: '#333',
  input: '#2a2a2a',
  header: '#1e1e1e',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await storage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeState(savedTheme);
        }
      } catch {
        console.error('Error loading theme');
      }
      setLoaded(true);
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await storage.setItem('theme', newTheme);
    } catch {
      console.error('Error saving theme');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default light theme if not in provider
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      colors: lightColors,
    };
  }
  return context;
}
