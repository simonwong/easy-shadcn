import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["registry/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["registry/**/*.{ts,tsx}"],
      exclude: ["registry/**/*.test.{ts,tsx}", "registry/**/*.test-d.tsx"],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
    setupFiles: ["./vitest.setup.ts"],
  },
});
