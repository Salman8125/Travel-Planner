import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
});
