import { useEffect } from 'react';
import { useRouter, useSegments, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

// All routes that require authentication
const PROTECTED_ROUTES = [
  '(tabs)',
  'dashboard',
  'tasks',
  'add-task',
  'chat',
  'chat-room',
  'chat-edit',
  'docs',
  'doc-detail',
  'share-doc',
  'analytics',
  'profile',
  'notepad',
  'note-detail',
  'calendar',
  'forms',
  'form-detail',
  'form-share',
  'form-view',
  'inbox',
  'planner',
  'task-detail',
  'edit-profile',
  'privacy-security',
  'help-support',
  'terms-of-service',
  'photos',
  'videos',
  'voice-call',
  'video-call',
];

// Routes that don't require auth
const PUBLIC_ROUTES = ['splash', 'login', ''];

export function useProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentSegment = segments[0] || '';
    const isPublicRoute = PUBLIC_ROUTES.includes(currentSegment);
    const isProtectedRoute = PROTECTED_ROUTES.includes(currentSegment);

    // If not authenticated and on a protected route → redirect to login
    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/login');
      return;
    }

    // If not authenticated and on root path → redirect to splash
    if (!isAuthenticated && (pathname === '/' || pathname === '')) {
      router.replace('/splash');
      return;
    }

    // If authenticated and on splash/login → redirect to home
    if (isAuthenticated && (currentSegment === 'splash' || currentSegment === 'login')) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments, pathname, router]);
}
