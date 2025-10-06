import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'src/pages/**/*backup*.jsx', 'debug-*.js'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // Esta regla genera falsos positivos en textos con comillas
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'no-case-declarations': 'off',
      // Desactivar prop-types: el proyecto no usa PropTypes
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Ignorar el import de React cuando no se usa con el runtime JSX moderno
      // Reducir severidad de variables no usadas mientras estamos limpiando
      'no-unused-vars': ['warn', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_' }],
    },
  },
  // Overrides para archivos de configuración basados en Node
  {
    files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js', '*.cjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      // Estos archivos suelen usar variables globales de Node como __dirname y process
      'no-undef': 'off',
      // No exigir uso de argumentos en funciones de configuración de herramientas
      'no-unused-vars': 'off',
    },
  },
  // Reducir ruido en utilidades, donde hay funciones helpers con params no utilizados
  {
    files: ['src/utils/**/*.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
]
