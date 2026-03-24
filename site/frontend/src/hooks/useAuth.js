import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

/**
 * Custom hook that exposes auth store state and actions,
 * plus an `isLoading` flag for initial hydration from localStorage.
 */
export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);

  const token = useAuthStore((s) => s.token);
  const apiKey = useAuthStore((s) => s.apiKey);
  const email = useAuthStore((s) => s.email);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const setApiKey = useAuthStore((s) => s.setApiKey);

  useEffect(() => {
    // Zustand persist rehydrates synchronously on store creation,
    // but we add a tick delay to ensure the component tree sees the final state.
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsLoading(false);
    });

    // If hydration already finished before this effect runs
    if (useAuthStore.persist.hasHydrated()) {
      setIsLoading(false);
    }

    return unsub;
  }, []);

  return {
    token,
    apiKey,
    email,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setApiKey,
  };
}
