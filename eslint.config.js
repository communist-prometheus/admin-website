import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'

export default [
  {
    ignores: ['src/components.d.ts'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      jsdoc,
      '@typescript-eslint': tseslint,
    },
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: [
            'ExportNamedDeclaration > VariableDeclaration',
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
          ],
          publicOnly: true,
          enableFixer: false,
        },
      ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
    },
  },
  {
    files: [
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'eslint.config.js',
      '**/*.spec.ts',
      '**/*.d.ts',
      'src/router/**/*.ts',
    ],
    rules: {
      'jsdoc/require-jsdoc': 'off',
    },
  },
]
