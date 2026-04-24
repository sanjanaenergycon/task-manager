import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export const unstable_settings = {
  anchor: 'splash',
  initialRouteName: 'splash',
};

function InitialRouteGuard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    
    // Only run on initial app launch when segments is empty or just the app root
    const currentSegment = segments[0] || '';
    
    // If app opens without a specific route or at root, redirect based on auth
    const seg = currentSegment as string;
    if (!isAuthenticated && (seg === '' || seg === '(tabs)' || seg === 'index')) {
      router.replace('/splash');
    }
  }, [isAuthenticated, loading, segments, router]);

  return null;
}

function RootLayoutNav() {
  useProtectedRoute();
  const { loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="add-task" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="chat-room" options={{ headerShown: false }} />
        <Stack.Screen name="docs" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notepad" />
        <Stack.Screen name="note-detail" options={{ headerShown: false }} />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="forms" />
        <Stack.Screen name="form-detail" options={{ headerShown: false }} />
        <Stack.Screen name="form-share" options={{ headerShown: false }} />
        <Stack.Screen name="form-view" options={{ headerShown: false }} />
        <Stack.Screen name="inbox" />
        <Stack.Screen name="planner" />
        <Stack.Screen name="task-detail" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-security" options={{ headerShown: false }} />
        <Stack.Screen name="help-support" options={{ headerShown: false }} />
        <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
        <Stack.Screen name="photos" options={{ headerShown: false }} />
        <Stack.Screen name="videos" options={{ headerShown: false }} />
        <Stack.Screen name="voice-call" options={{ headerShown: false }} />
        <Stack.Screen name="video-call" options={{ headerShown: false }} />
        <Stack.Screen name="chat-edit" options={{ headerShown: false }} />
        <Stack.Screen name="doc-detail" options={{ headerShown: false }} />
        <Stack.Screen name="share-doc" options={{ headerShown: false }} />
      </Stack>
      <InitialRouteGuard />
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
