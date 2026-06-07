import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'
import { legacyIfFiles } from './eslint.legacy-if.js'

export default [
  {
    ignores: ['src/components.d.ts'],
  },
  {
    files: [
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'eslint.config.js',
    ],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.node.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
    },
  },
  {
    files: [
      'src/**/*.ts',
      'e2e/**/*.ts',
      'e2e-realmode/**/*.ts',
      'scripts/**/*.ts',
    ],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      // Project dogma: application code must be declarative. No
      // imperative control-flow branching with if/switch; use
      // Match from effect (Match.value(x).pipe(Match.when(...),
      // Match.orElse(...))). Early-return guards that the reader
      // would otherwise write as `if (x) return …` can be modelled
      // as Match with a default branch, or as a lookup table /
      // ternary for the trivial binary case.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement',
          message:
            'No `if` in application code — use Match from effect (Match.value / Match.when / Match.orElse). A ternary is acceptable for trivial two-branch expressions.',
        },
        {
          selector: 'SwitchStatement',
          message:
            'No `switch` in application code — use Match from effect (Match.value / Match.when / Match.orElse).',
        },
      ],
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
      'scripts/**/*.ts',
      'e2e/**/*.ts',
      'e2e-realmode/**/*.ts',
      'src/types/github-content.ts',
    ],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param': 'off',
      'jsdoc/require-returns': 'off',
    },
  },
  // Unit tests may use if/switch freely — they describe behaviour,
  // not application flow. Same exemption applies to bootstrap
  // scripts and E2E support code: they wire up CI plumbing rather
  // than encoding application invariants, so the Match-only dogma
  // does not buy clarity there.
  {
    files: [
      '**/*.test.ts',
      '**/*.spec.ts',
      'scripts/**/*.ts',
      'e2e/helpers/**/*.ts',
      'e2e/comms-walkthrough/**/*.ts',
      'e2e-realmode/helpers/**/*.ts',
      'e2e-realmode/global-setup.ts',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Grandfathered files that still contain if/switch. When a file
  // on this list is touched, the commit must also migrate its
  // branching to Match and remove the entry.
  {
    files: legacyIfFiles,
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]
