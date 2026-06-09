import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// The backend URL is read from import.meta.env.VITE_API_URL, inlined at BUILD time
// (see Dockerfile build ARG), defaulting to http://localhost:4003.
export default defineConfig({
  plugins: [svelte()],
  server: { port: 3003 },
});
