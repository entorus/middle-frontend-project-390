import js from '@eslint/js'
import globals from 'globals'
import html from '@html-eslint/eslint-plugin'
import htmlParser from '@html-eslint/parser'
import stylistic from '@stylistic/eslint-plugin'
import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import eslintReact from '@eslint-react/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**']
  },

  prettier,

  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {
      js,
      eslintReact,
      '@stylistic': stylistic,
    },
    extends: [
      'js/recommended',
      eslintReact.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/indent': ['error', 2],
      'quotes': ['error', 'single']
    }
  },

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      js,
      eslintReact,
      '@stylistic': stylistic,
      '@typescript-eslint': tseslint.plugin,
    },
    extends: [
      'js/recommended',
      tseslint.configs.recommended,
      eslintReact.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      parser: tseslint.parser,
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/indent': ['error', 2],
      'quotes': ['error', 'single']
    }
  },

  {
    files: ['**/*.html'],
    plugins: {
      html
    },
    languageOptions: {
      parser: htmlParser
    },
    rules: {
      'html/require-lang': 'error',
      'html/require-title': 'error',
      'html/no-duplicate-id': 'error',
      'html/indent': ['error', 'tab']
    }
  },
])
