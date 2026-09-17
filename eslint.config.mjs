import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['**/node_modules/**', 'example/**', 'source/**', 'coverage/**']
  },
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' }
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'all' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always']
    }
  },
  {
    files: ['scripts/**/*.js', 'lib/**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' }
  },
  {
    files: ['scripts/**/*.js'],
    languageOptions: { globals: { hexo: 'readonly' } }
  },
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // TypeScript checks undefined names, including types and DOM interfaces.
      'no-undef': 'off',
      eqeqeq: ['error', 'always']
    }
  },
  {
    files: ['src/client/**/*.ts'],
    languageOptions: { globals: globals.browser }
  }
);
