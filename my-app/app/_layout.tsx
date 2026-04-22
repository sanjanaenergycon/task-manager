import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useProtectedRoute } from '@/hooks/use-protected-route';

export const unstable_settings = {
  anchor: 'splash',
};

function RootLayoutNav() {
  useProtectedRoute();
  const colorScheme = useColorScheme();

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
