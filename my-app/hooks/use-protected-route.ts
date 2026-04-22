import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)' || 
      segments[0] === 'dashboard' || 
      segments[0] === 'tasks' || 
      segments[0] === 'add-task' || 
      segments[0] === 'chat' || 
      segments[0] === 'chat-room' || 
      segments[0] === 'docs' || 
      segments[0] === 'analytics' || 
      segments[0] === 'profile' || 
      segments[0] === 'notepad' || 
      segments[0] === 'calendar' || 
      segments[0] === 'forms' || 
      segments[0] === 'inbox' || 
      segments[0] === 'planner' || 
      segments[0] === 'task-detail' || 
      segments[0] === 'edit-profile' || 
      segments[0] === 'privacy-security' || 
      segments[0] === 'help-support' || 
      segments[0] === 'terms-of-service';

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [isAuthenticated, loading, segments, router]);
}
