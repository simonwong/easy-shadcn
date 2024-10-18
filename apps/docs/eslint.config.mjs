import eslintConfig from '@yueqing/eslint-config-ts';
import tailwindcssConfig from '@yueqing/eslint-config-ts/tailwindcss-config';

export default eslintConfig(
  {
    project: ['./tsconfig.eslint.json'],
    rootDir: import.meta.dirname,
  },
  [
    ...tailwindcssConfig,
    {
      ignores: ['.turbo/', '.next/', 'eslint.config.mjs'],
    },
  ]
);
