<script setup lang="ts">
import { useQueryClient } from "@tanstack/vue-query";
import { CloudSun, LogOut, Shield } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

import { Button, buttonVariants } from "@/components/ui";
import { useAuthStore } from "@/stores/auth";

import ThemeToggle from "./ThemeToggle.vue";
import UnitToggle from "./UnitToggle.vue";

const auth = useAuthStore();
const { isAuthenticated, isAdmin, user } = storeToRefs(auth);
const router = useRouter();
const queryClient = useQueryClient();

function logout() {
  auth.clearSession();
  queryClient.clear();
  void router.push({ name: "home" });
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
    <div class="container flex h-16 items-center justify-between gap-4">
      <RouterLink :to="{ name: 'home' }" class="flex items-center gap-2 font-bold">
        <CloudSun class="h-6 w-6 text-primary" aria-hidden="true" />
        <span>Weathervane</span>
      </RouterLink>

      <nav class="flex items-center gap-1 sm:gap-2">
        <RouterLink
          v-if="isAdmin"
          :to="{ name: 'admin-locations' }"
          class="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          <Shield class="h-4 w-4" />
          Admin
        </RouterLink>

        <UnitToggle />
        <ThemeToggle />

        <template v-if="isAuthenticated">
          <span class="hidden text-sm text-muted-foreground md:inline">{{ user?.email }}</span>
          <Button variant="ghost" size="sm" aria-label="Sign out" @click="logout">
            <LogOut class="h-4 w-4" />
            <span class="hidden sm:inline">Sign out</span>
          </Button>
        </template>
        <RouterLink
          v-else
          :to="{ name: 'login' }"
          :class="buttonVariants({ variant: 'outline', size: 'sm' })"
        >
          Sign in
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
