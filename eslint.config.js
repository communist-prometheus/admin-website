import tseslint from '@typescript-eslint/eslint-plugin'
import parser from '@typescript-eslint/parser'
import jsdoc from 'eslint-plugin-jsdoc'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: ['src/components.d.ts'],
  },
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'vue/max-len': [
        'error',
        {
          code: 78,
          template: 78,
          ignorePattern: '',
          ignoreComments: false,
          ignoreTrailingComments: false,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: false,
          ignoreRegExpLiterals: false,
          ignoreHTMLAttributeValues: false,
          ignoreHTMLTextContents: false,
        },
      ],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/no-v-html': 'error',
      'vue/require-default-prop': 'error',
      'vue/require-prop-types': 'error',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: 1,
          multiline: 1,
        },
      ],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
      'max-depth': ['error', { max: 2 }],
      'max-lines': [
        'error',
        {
          max: 200,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['error', { max: 10 }],
    },
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
  {
    files: ['src/components/icons/**/*.vue'],
    rules: {
      'vue/max-len': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
]
