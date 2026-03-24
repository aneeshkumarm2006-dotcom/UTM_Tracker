import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      email: null,
      isAuthenticated: false,

      login: (token, apiKey, email) =>
        set({
          token,
          apiKey,
          email,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          apiKey: null,
          email: null,
          isAuthenticated: false,
        }),

      setApiKey: (apiKey) =>
        set({ apiKey }),
    }),
    {
      name: 'utm-tracker-auth', // localStorage key
      partialize: (state) => ({
        token: state.token,
        apiKey: state.apiKey,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
