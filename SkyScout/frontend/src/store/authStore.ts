import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "@/types/app";

interface AuthState {
  token: string | null;
  user: User | null;
  bootstrapped: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User | null) => void;
  setBootstrapped: (value: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      bootstrapped: false,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      setBootstrapped: (bootstrapped) => set({ bootstrapped }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: "skyscout.auth",
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
