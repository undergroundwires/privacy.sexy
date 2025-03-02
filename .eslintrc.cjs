const { rules: baseStyleRules } = require('eslint-config-airbnb-base/rules/style');
const tsconfigJson = require('./tsconfig.json');
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true, // add globals and sets parserOptions.ecmaVersion to 2022
    serviceworker: true, // Add this line to enable serviceworker support
  },
  extends: [
    // Vue specific base rules, `eslint-plugin-vue`
    'plugin:vue/vue3-recommended',

    // Extends `eslint-config-airbnb`
    '@vue/eslint-config-airbnb-with-typescript',

    // - Sets base parser and plugin options.
    // - Includes `plugin:@typescript-eslint/recommended`. But incompatible with
    //   `strict-type-checked` and `stylistic-type-checked`, see https://github.com/vuejs/eslint-config-typescript/issues/67.
    '@vue/typescript/recommended',
  ],
  rules: {
    ...getOwnRules(),
    ...getTurnedOffBrokenRules(),
    ...getOpinionatedRuleOverrides(),
    ...getTodoRules(),
  },
};

function getOwnRules() {
  return {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linebreak-style': ['error', 'unix'], // This is also enforced in .editorconfig and .gitattributes files
    'import/order': [ // Enforce strict import order taking account into aliases
      'error',
      {
        groups: [ // Enforce more strict order than AirBnb
          'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [ // Fix manually configured paths being incorrectly grouped as "external"
          ...getAliasesFromTsConfig(),
          'js-yaml-loader!@/**',
        ].map((pattern) => ({ pattern, group: 'internal' })),
      },
    ],
  };
}

function getTodoRules() { // Should be worked on separate future commits
  return {
    'import/no-extraneous-dependencies': 'off',
    // Accessibility improvements:
    'vuejs-accessibility/form-control-has-label': 'off',
    'vuejs-accessibility/click-events-have-key-events': 'off',
    'vuejs-accessibility/anchor-has-content': 'off',
    'vuejs-accessibility/accessible-emoji': 'off',
  };
}

function getTurnedOffBrokenRules() {
  return {
    // Broken in TypeScript
    'no-useless-constructor': 'off', // Cannot interpret TypeScript constructors
    'no-shadow': 'off', // Fails with TypeScript enums
  };
}

function getOpinionatedRuleOverrides() {
  return {
    // https://erkinekici.com/articles/linting-trap#no-use-before-define
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    // https://erkinekici.com/articles/linting-trap#arrow-body-style
    'arrow-body-style': 'off',
    // https://erkinekici.com/articles/linting-trap#no-plusplus
    'no-plusplus': 'off',
    // https://erkinekici.com/articles/linting-trap#no-param-reassign
    'no-param-reassign': 'off',
    // https://erkinekici.com/articles/linting-trap#class-methods-use-this
    'class-methods-use-this': 'off',
    // https://erkinekici.com/articles/linting-trap#importprefer-default-export
    'import/prefer-default-export': 'off',
    // https://erkinekici.com/articles/linting-trap#disallowing-for-of
    // Original: https://github.com/airbnb/javascript/blob/d8cb404da74c302506f91e5928f30cc75109e74d/packages/eslint-config-airbnb-base/rules/style.js#L333-L351
    'no-restricted-syntax': [
      baseStyleRules['no-restricted-syntax'][0],
      ...baseStyleRules['no-restricted-syntax'].slice(1).filter((rule) => rule.selector !== 'ForOfStatement'),
    ],
  };
}

function getAliasesFromTsConfig() {
  return Object.keys(tsconfigJson.compilerOptions.paths)
    .map((path) => `${path}*`);
}
