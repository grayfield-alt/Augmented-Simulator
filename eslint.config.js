import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // src/core 내에서는 DOM/브라우저 API 접근 금지 (한글)
    files: ['src/core/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js 환경(순수 JS)으로 한정 (한글)
        window: 'off',
        document: 'off',
        navigator: 'off',
      },
    },
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'Use of window is forbidden in src/core.' },
        { name: 'document', message: 'Use of document is forbidden in src/core.' },
        { name: 'navigator', message: 'Use of navigator is forbidden in src/core.' },
      ],
    },
  },
])
