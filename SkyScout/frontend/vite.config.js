/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    server: { port: 3001, host: true },
    preview: { port: 3001, host: true },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom", "react-router-dom"],
                    "query-vendor": ["@tanstack/react-query", "@tanstack/react-table"],
                    "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
                },
            },
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: false,
        exclude: ["e2e/**", "node_modules/**", "dist/**"],
    },
});
