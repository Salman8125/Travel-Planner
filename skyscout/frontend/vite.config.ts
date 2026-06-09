import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. The backend URL is read from import.meta.env.VITE_API_URL, which Vite inlines
// at BUILD time (see Dockerfile build ARG), defaulting to http://localhost:4001.
export default defineConfig({
  plugins: [react()],
  server: { port: 3001 },
});
