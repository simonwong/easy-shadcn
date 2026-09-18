import { defineConfig, type UserConfig } from "tsdown";

const baseConfig: Partial<UserConfig> = {
  entry: [
    "./src/**/*.ts",
    "./src/**/*.tsx",
    "!./src/**/*.test.ts",
    "!./src/**/*.test.tsx",
  ],
  target: "es2020",
  dts: true,
  unbundle: true,
  sourcemap: false,
  clean: true,
  platform: "neutral",
};

export default defineConfig([
  {
    ...baseConfig,
    format: "cjs",
    outDir: "lib",
    fixedExtension: true,
    outExtensions: () => ({
      js: ".cjs",
      dts: ".d.cts",
    }),
  },
  {
    ...baseConfig,
    format: "esm",
    outDir: "es",
    fixedExtension: true,
    outExtensions: () => ({
      js: ".js",
      dts: ".d.ts",
    }),
  },
]);
