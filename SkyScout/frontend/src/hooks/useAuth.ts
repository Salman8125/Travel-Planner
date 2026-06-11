import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const bootstrapped = useAuthStore((s) => s.bootstrapped);

  return {
    token,
    user,
    bootstrapped,
    isAuthenticated: !!token,
    isAdmin: user?.role === "ADMIN",
  };
}
