import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import { authGuard } from "./guards";

declare module "vue-router" {
  interface RouteMeta {
    public?: boolean;
    requiresAdmin?: boolean;
    title?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: { public: true, title: "Search" },
  },
  {
    path: "/locations/:id",
    name: "location",
    component: () => import("@/views/LocationView.vue"),
    meta: { public: true },
  },
  {
    path: "/locations/:id/stream",
    name: "location-stream",
    component: () => import("@/views/StreamView.vue"),
    meta: { public: true, title: "Live stream" },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { public: true, title: "Sign in" },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterView.vue"),
    meta: { public: true, title: "Create account" },
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      { path: "", redirect: { name: "admin-locations" } },
      {
        path: "locations",
        name: "admin-locations",
        component: () => import("@/views/admin/LocationsView.vue"),
        meta: { requiresAdmin: true, title: "Manage locations" },
      },
      {
        path: "forecast",
        name: "admin-forecast",
        component: () => import("@/views/admin/ForecastView.vue"),
        meta: { requiresAdmin: true, title: "Manage forecasts" },
      },
    ],
  },
  {
    path: "/403",
    name: "forbidden",
    component: () => import("@/views/ForbiddenView.vue"),
    meta: { public: true, title: "Forbidden" },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
    meta: { public: true, title: "Not found" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(authGuard);

router.afterEach((to) => {
  const title = to.meta.title;
  document.title = title ? `${title} · Weathervane` : "Weathervane";
});
