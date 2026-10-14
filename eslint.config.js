import { createRequire } from 'node:module';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import { vueTsConfigs, withVueTs } from '@vue/eslint-config-typescript';
import cypress from 'eslint-plugin-cypress';
import { importX } from 'eslint-plugin-import-x';
import vue from 'eslint-plugin-vue';
import vueAccessibility from 'eslint-plugin-vuejs-accessibility';
import globals from 'globals';

const require = createRequire(import.meta.url);
const legacyAdditionalRules = require('./eslint.legacy-additional-rules.json');
const {
  legacyCoreRules,
  legacyImportRules,
  legacyTypeScriptRules,
  legacyTypeScriptStylisticRules,
} = require('./eslint.legacy-rules.cjs');

const sourceFiles = ['**/*.{js,cjs,mjs,ts,tsx,vue}'];

export default withVueTs(
  {
    ignores: [
      'dist-*/**',
      'node_modules/**',
      '.vscode/**/*',
      '!.vscode/extensions.json',
      '**/*.bkp',
      '**/*.dtmp',
      '**/.DS_Store',
      '**/__pycache__/**',
      '**/.venv/**',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  eslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  ...vueAccessibility.configs['flat/recommended'],
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      sourceType: 'module',
    },
    plugins: {
      '@stylistic': stylistic,
      import: importX, // Preserve the rule IDs used by existing config and inline directives.
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...legacyCoreRules,
      ...legacyImportRules,
      ...legacyAdditionalRules,
      'array-callback-return': ['error', { allowImplicit: true }],
      'class-methods-use-this': 'off',
      'consistent-return': 'error',
      curly: ['error', 'multi-line'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-alert': 'warn',
      'no-else-return': ['error', { allowElseIf: false }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message: 'Use Object.{keys,values,entries} instead of for..in loops.',
        },
        {
          selector: 'LabeledStatement',
          message: 'Labels make code difficult to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message: '`with` makes code impossible to predict and optimize.',
        },
      ],
      'no-return-assign': ['error', 'always'],
      'no-shadow': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'no-void': 'error',
      'object-shorthand': ['error', 'always', { avoidQuotes: true }],
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: true }],
      'prefer-template': 'error',
      'require-yield': 'error',
      'import/export': 'error',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never', jsx: 'never', mjs: 'never', mts: 'never', ts: 'never', tsx: 'never', vue: 'always',
        },
      ],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-absolute-path': 'error',
      'import/no-amd': 'error',
      'import/no-anonymous-default-export': 'off',
      'import/no-dynamic-require': 'error',
      'import/no-extraneous-dependencies': 'off',
      'import/no-named-as-default': 'error',
      'import/no-named-as-default-member': 'error',
      'import/no-relative-packages': 'error',
      'import/no-self-import': 'error',
      'import/no-unresolved': [
        'error',
        { caseSensitive: true, commonjs: true, ignore: ['^electron/(common|main|renderer)$'] },
      ],
      'import/no-useless-path-segments': ['error', { commonjs: true }],
      'import/no-webpack-loader-syntax': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '@tests/**', group: 'internal' },
            { pattern: 'js-yaml-loader!@/**', group: 'internal' },
          ],
        },
      ],
      'import/prefer-default-export': 'off',
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/arrow-spacing': ['error', { after: true, before: true }],
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          enums: 'always-multiline',
          exports: 'always-multiline',
          functions: 'always-multiline',
          generics: 'always-multiline',
          imports: 'always-multiline',
          objects: 'always-multiline',
          tuples: 'always-multiline',
        },
      ],
      '@stylistic/comma-spacing': ['error', { after: true, before: false }],
      '@stylistic/comma-style': ['error', 'last'],
      '@stylistic/computed-property-spacing': ['error', 'never'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      '@stylistic/generator-star-spacing': ['error', { after: true, before: false }],
      ...legacyTypeScriptStylisticRules,
      '@stylistic/key-spacing': ['error', { afterColon: true, beforeColon: false }],
      '@stylistic/keyword-spacing': ['error', { after: true, before: true }],
      '@stylistic/linebreak-style': ['error', 'unix'],
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: false }],
      '@stylistic/max-len': 'off',
      '@stylistic/new-parens': 'error',
      '@stylistic/no-extra-semi': 'error',
      '@stylistic/no-floating-decimal': 'error',
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
      '@stylistic/no-tabs': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'none' } }],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-spacing': ['error', { after: true, before: false }],
      '@stylistic/space-before-blocks': 'error',
      '@stylistic/space-before-function-paren': [
        'error',
        { anonymous: 'always', asyncArrow: 'always', named: 'never' },
      ],
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-unary-ops': ['error', { nonwords: false, words: true }],
      '@stylistic/spaced-comment': ['error', 'always'],
      '@stylistic/template-curly-spacing': 'error',
      '@stylistic/template-tag-spacing': ['error', 'never'],
      '@stylistic/wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],
      '@stylistic/yield-star-spacing': ['error', 'after'],
      'vue/max-attributes-per-line': [
        'error',
        {
          multiline: { max: 1 },
          singleline: { max: 9999 },
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
      'vuejs-accessibility/accessible-emoji': 'off',
      'vuejs-accessibility/anchor-has-content': 'off',
      'vuejs-accessibility/click-events-have-key-events': 'off',
      'vuejs-accessibility/form-control-has-label': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx,vue}'],
    rules: {
      ...legacyTypeScriptRules,
      '@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
      'vue/block-order': ['warn', { order: ['template', 'script', 'style'] }],
      'vuejs-accessibility/no-static-element-interactions': 'off',
      'vue/html-self-closing': ['error', { html: { void: 'any' } }],
    },
  },
  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['tests/**/*.{js,cjs,mjs,ts,tsx,vue}'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ...cypress.configs.recommended,
    files: ['tests/e2e/**/*.{js,cjs,mjs,ts,tsx}'],
    rules: {
      ...cypress.configs.recommended.rules,
      strict: 'off',
    },
  },
);
