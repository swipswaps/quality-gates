// ESLint configuration for TypeScript/React projects
// Copy to your project root as eslint.config.js

import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // =======================================================================
      // TypeScript Strict Rules
      // =======================================================================

      // CRITICAL: Disallow `any` type - use `unknown` instead
      '@typescript-eslint/no-explicit-any': 'error',

      // Require explicit return types on functions
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],

      // Require proper error handling in catch blocks
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // =======================================================================
      // React Hooks Rules
      // =======================================================================

      // Enforce rules of hooks (deps array, etc.)
      ...reactHooks.configs.recommended.rules,

      // Warn on missing dependencies in useEffect/useCallback/useMemo
      'react-hooks/exhaustive-deps': 'warn',

      // =======================================================================
      // Import Rules - Prevent Heavy Top-Level Imports
      // =======================================================================

      // Block direct imports of heavy libraries - use dynamic import()
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['tesseract.js'],
            message: 'Use dynamic import() for tesseract.js to reduce bundle size. Example: const Tesseract = await import("tesseract.js")',
          },
          {
            group: ['pdfjs-dist'],
            message: 'Use dynamic import() for pdfjs-dist to reduce bundle size.',
          },
        ],
      }],

      // =======================================================================
      // React Refresh (for Vite HMR)
      // =======================================================================
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
      }],
    },
  }
);
