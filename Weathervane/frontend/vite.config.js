import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// The backend URL is read from import.meta.env.VITE_API_URL, inlined at BUILD time
// (see Dockerfile build ARG), defaulting to http://localhost:4004.
export default defineConfig({
  plugins: [vue()],
  server: { port: 3004 },
});
