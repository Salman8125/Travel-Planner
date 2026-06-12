import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { render } from "@testing-library/vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { defineComponent, h, type Component } from "vue";
import { createMemoryHistory, createRouter, type Router } from "vue-router";

const Blank = defineComponent({ render: () => h("div") });

export function createTestRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "home", component: Blank },
      { path: "/login", name: "login", component: Blank },
      { path: "/register", name: "register", component: Blank },
      { path: "/locations/:id", name: "location", component: Blank },
      { path: "/locations/:id/stream", name: "location-stream", component: Blank },
      { path: "/admin/locations", name: "admin-locations", component: Blank },
      { path: "/admin/forecast", name: "admin-forecast", component: Blank },
      { path: "/403", name: "forbidden", component: Blank },
      { path: "/:pathMatch(.*)*", name: "not-found", component: Blank },
    ],
  });
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderArgs {
  router?: Router;
  props?: Record<string, unknown>;
}

export function renderWithProviders(component: Component, args: RenderArgs = {}) {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  const router = args.router ?? createTestRouter();
  const queryClient = createTestQueryClient();

  const utils = render(component, {
    props: args.props,
    global: {
      plugins: [pinia, [VueQueryPlugin, { queryClient }], router],
    },
  });

  return { ...utils, router, queryClient, pinia };
}
