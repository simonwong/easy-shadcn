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
      ignores: [
        '.turbo/',
        '.next/',
        'eslint.config.mjs',
        'packages/react/components/',
        'storybook-static/',
      ],
    },
    {
      // .stories.tsx 文件，关闭 react-hooks/rules-of-hooks 规则
      files: ['**/*.stories.tsx'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ]
);
