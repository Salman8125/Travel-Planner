import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createApp } from "vue";

import "vue-sonner/style.css";
import "./index.css";

import App from "./App.vue";
import { createQueryClient } from "./app/query-client";
import { router } from "./app/router";
import { useUiStore } from "./stores/ui";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

useUiStore().applyTheme();

app.use(VueQueryPlugin, { queryClient: createQueryClient() });
app.use(router);

app.mount("#app");
