import { defineConfig } from 'tsup';
import { glob } from 'glob';

export default defineConfig([
  {
    entry: ['src/index.ts', ...glob.sync('src/*/index.{ts,tsx}')],
    format: ['cjs', 'esm'],
    external: ['react', 'react-dom'],
    banner: {
      js: "'use client'",
    },
    outDir: 'dist',
    dts: true,
    clean: true,
    treeshake: true,
    splitting: true,
    sourcemap: false,
    tsconfig: 'tsconfig.build.json',
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.js' : '.mjs',
      };
    },
  },
]);
