// Lint config for the Node workspaces (shared/, server/). The Expo app has its own config in app/.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/dist/**', 'app/**', 'brand/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['shared/**/*.ts', 'server/**/*.ts'],
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      eqeqeq: 'error',
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    },
  },
  prettier,
);
