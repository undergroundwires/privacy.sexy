const { rules: baseStyleRules } = require('eslint-config-airbnb-base/rules/style');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    // Vue specific rules, eslint-plugin-vue
    // Added by Vue CLI
    'plugin:vue/essential',

    // Extends eslint-config-airbnb
    // Added by Vue CLI
    // Here until https://github.com/vuejs/eslint-config-airbnb/issues/23 is done
    '@vue/airbnb',

    // Extends @typescript-eslint/recommended
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    // Added by Vue CLI
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    ...getOwnRules(),
    ...getTurnedOffBrokenRules(),
    ...getOpinionatedRuleOverrides(),
    ...getTodoRules(),
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        mocha: true,
      },
    },
    {
      files: ['**/tests/**/*.{j,t}s?(x)'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

function getOwnRules() {
  return {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'linebreak-style': ['error', 'unix'], // Also enforced in .editorconfig
    'import/order': [ // Enforce strict import order taking account into aliases
      'error',
      {
        groups: [ // Enforce more strict order than AirBnb
          'builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [ // Fix manually configured paths being incorrectly grouped as "external"
          '@/**', // @/..
          '@tests/**', // @tests/.. (not matching anything after @** because there can be third parties as well)
          'js-yaml-loader!@/**', // E.g. js-yaml-loader!@/..
        ].map((pattern) => ({ pattern, group: 'internal' })),
      },
    ],
  };
}

function getTodoRules() { // Should be worked on separate future commits
  return {
    'import/no-extraneous-dependencies': 'off',
    // Requires webpack configuration change with import '..yaml' files.
    'import/no-webpack-loader-syntax': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
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
