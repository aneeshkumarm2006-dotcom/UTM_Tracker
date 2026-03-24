import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      apiKey: null,
      isAuthenticated: false,

      login: (token, apiKey) =>
        set({
          token,
          apiKey,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          apiKey: null,
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
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
