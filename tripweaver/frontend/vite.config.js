import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// The backend URL is read from import.meta.env.VITE_API_URL, inlined at BUILD time
// (see Dockerfile build ARG), defaulting to http://localhost:4005.
export default defineConfig({
  plugins: [solid()],
  server: { port: 3005 },
});
