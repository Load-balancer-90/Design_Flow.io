'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth(user) {
        set({
          user,
          accessToken: `dummy-token-${user.id}`,
        });
      },

      logout() {
        set({ user: null, accessToken: null });
      },
    }),
    { name: 'design-flow-auth' }
  )
);
