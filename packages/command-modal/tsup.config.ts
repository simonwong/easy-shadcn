import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      incremental: false,
    },
  },
  minify: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  banner: {
    js: '"use client";',
  },
  splitting: true,
  treeshake: true,
  shims: true,
})
