const { rules: baseBestPracticesRules } = require('eslint-config-airbnb-base/rules/best-practices');
const { rules: baseErrorsRules } = require('eslint-config-airbnb-base/rules/errors');
const { rules: baseES6Rules } = require('eslint-config-airbnb-base/rules/es6');
const { rules: baseImportsRules } = require('eslint-config-airbnb-base/rules/imports');
const { rules: baseStyleRules } = require('eslint-config-airbnb-base/rules/style');
const { rules: baseVariablesRules } = require('eslint-config-airbnb-base/rules/variables');

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
      files: ['**/*.ts?(x)', '**/*.d.ts'],
      parserOptions: {
        // Setting project is required for some rules such as @typescript-eslint/dot-notation,
        // @typescript-eslint/return-await and @typescript-eslint/no-throw-literal.
        // If this property is missing they fail due to missing parser.
        project: ['./tsconfig.json'],
      },
      rules: {
        ...getTypeScriptOverrides(),
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
    'linebreak-style': ['error', 'unix'], // This is also enforced in .editorconfig and .gitattributes files
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

function getTypeScriptOverrides() {
  /*
    Here until Vue supports AirBnb Typescript overrides (vuejs/eslint-config-airbnb#23).
    Based on `eslint-config-airbnb-typescript`.
      Source: https://github.com/iamturns/eslint-config-airbnb-typescript/blob/v16.1.0/lib/shared.js
      It cannot be used directly due to compilation errors.
  */
  return {
    'brace-style': 'off',
    '@typescript-eslint/brace-style': baseStyleRules['brace-style'],

    camelcase: 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
      { selector: 'function', format: ['camelCase', 'PascalCase'] },
      { selector: 'typeLike', format: ['PascalCase'] },
    ],

    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': [
      baseStyleRules['comma-dangle'][0],
      {
        ...baseStyleRules['comma-dangle'][1],
        enums: baseStyleRules['comma-dangle'][1].arrays,
        generics: baseStyleRules['comma-dangle'][1].arrays,
        tuples: baseStyleRules['comma-dangle'][1].arrays,
      },
    ],

    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': baseStyleRules['comma-spacing'],

    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': baseBestPracticesRules['default-param-last'],

    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': baseBestPracticesRules['dot-notation'],

    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': baseStyleRules['func-call-spacing'],

    // ❌ Broken for some cases, but still useful.
    // Here until Prettifier is used.
    indent: 'off',
    '@typescript-eslint/indent': baseStyleRules.indent,

    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': baseStyleRules['keyword-spacing'],

    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': baseStyleRules['lines-between-class-members'],

    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': baseStyleRules['no-array-constructor'],

    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': baseES6Rules['no-dupe-class-members'],

    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': baseBestPracticesRules['no-empty-function'],

    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': baseErrorsRules['no-extra-parens'],

    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': baseErrorsRules['no-extra-semi'],

    // ❌ Fails due to missing parser
    // 'no-implied-eval': 'off',
    // 'no-new-func': 'off',
    // '@typescript-eslint/no-implied-eval': baseBestPracticesRules['no-implied-eval'],

    'no-loss-of-precision': 'off',
    '@typescript-eslint/no-loss-of-precision': baseErrorsRules['no-loss-of-precision'],

    'no-loop-func': 'off',
    '@typescript-eslint/no-loop-func': baseBestPracticesRules['no-loop-func'],

    'no-magic-numbers': 'off',
    '@typescript-eslint/no-magic-numbers': baseBestPracticesRules['no-magic-numbers'],

    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': baseBestPracticesRules['no-redeclare'],

    // ESLint variant does not work with TypeScript enums.
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': baseVariablesRules['no-shadow'],

    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': baseBestPracticesRules['no-throw-literal'],

    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': baseBestPracticesRules['no-unused-expressions'],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': baseVariablesRules['no-unused-vars'],

    // https://erkinekici.com/articles/linting-trap#no-use-before-define
    // 'no-use-before-define': 'off',
    // '@typescript-eslint/no-use-before-define': baseVariablesRules['no-use-before-define'],

    // ESLint variant does not understand TypeScript constructors.
    // eslint/eslint/#14118, typescript-eslint/typescript-eslint#873
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': baseES6Rules['no-useless-constructor'],

    quotes: 'off',
    '@typescript-eslint/quotes': baseStyleRules.quotes,

    semi: 'off',
    '@typescript-eslint/semi': baseStyleRules.semi,

    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': baseStyleRules['space-before-function-paren'],

    'require-await': 'off',
    '@typescript-eslint/require-await': baseBestPracticesRules['require-await'],

    'no-return-await': 'off',
    '@typescript-eslint/return-await': baseBestPracticesRules['no-return-await'],

    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': baseStyleRules['space-infix-ops'],

    'object-curly-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': baseStyleRules['object-curly-spacing'],

    'import/extensions': [
      baseImportsRules['import/extensions'][0],
      baseImportsRules['import/extensions'][1],
      {
        ...baseImportsRules['import/extensions'][2],
        ts: 'never',
        tsx: 'never',
      },
    ],

    // Changes required is not yet implemented:
    // 'import/no-extraneous-dependencies': [
    //   baseImportsRules['import/no-extraneous-dependencies'][0],
    //   {
    //     ...baseImportsRules['import/no-extraneous-dependencies'][1],
    //     devDependencies: baseImportsRules[
    //       'import/no-extraneous-dependencies'
    //     ][1].devDependencies.reduce((result, devDep) => {
    //       const toAppend = [devDep];
    //       const devDepWithTs = devDep.replace(/\bjs(x?)\b/g, 'ts$1');
    //       if (devDepWithTs !== devDep) {
    //         toAppend.push(devDepWithTs);
    //       }
    //       return [...result, ...toAppend];
    //     }, []),
    //   },
    // ],
  };
}
