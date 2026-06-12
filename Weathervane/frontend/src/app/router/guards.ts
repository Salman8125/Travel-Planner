import type { NavigationGuard } from "vue-router";

import { getMe } from "@/features/auth/api";
import { useAuthStore } from "@/stores/auth";

let bootstrapPromise: Promise<void> | null = null;

async function ensureSession(): Promise<void> {
  const auth = useAuthStore();
  if (auth.bootstrapped) return;
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      if (!auth.token) {
        auth.setBootstrapped(true);
        return;
      }
      try {
        auth.setUser(await getMe());
      } catch {
        auth.clearSession();
      } finally {
        auth.setBootstrapped(true);
      }
    })();
  }
  await bootstrapPromise;
}

export const authGuard: NavigationGuard = async (to) => {
  await ensureSession();
  const auth = useAuthStore();

  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) {
      return { name: "login", query: { returnTo: to.fullPath } };
    }
    if (!auth.isAdmin) {
      return { name: "forbidden" };
    }
  }
  return true;
};
