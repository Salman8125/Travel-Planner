import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type { User } from "@/lib/api/models";

export const useAuthStore = defineStore(
  "weathervane.auth",
  () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);
    const bootstrapped = ref(false);

    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.role === "ADMIN");

    function setSession(nextToken: string, nextUser: User) {
      token.value = nextToken;
      user.value = nextUser;
    }
    function setUser(nextUser: User | null) {
      user.value = nextUser;
    }
    function setBootstrapped(value: boolean) {
      bootstrapped.value = value;
    }
    function clearSession() {
      token.value = null;
      user.value = null;
    }

    return {
      token,
      user,
      bootstrapped,
      isAuthenticated,
      isAdmin,
      setSession,
      setUser,
      setBootstrapped,
      clearSession,
    };
  },
  { persist: { pick: ["token"] } },
);
