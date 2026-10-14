// allow: SIZE_OK - Declarative migration table for the removed legacy ESLint configuration.
// Each enabled legacy rule is either restored below, supplied by an imported native preset,
// or accounted for by `legacyRuleGapRationale`.

const legacyCoreRules = {
  'block-scoped-var': 'error',
  'default-case': ['error', { commentPattern: '^no default$' }],
  'default-case-last': 'error',
  'grouped-accessor-pairs': 'error',
  'guard-for-in': 'error',
  'max-classes-per-file': ['error', 1],
  'no-bitwise': 'error',
  'no-caller': 'error',
  'no-case-declarations': 'error',
  'no-constructor-return': 'error',
  'no-continue': 'error',
  'no-extend-native': 'error',
  'no-extra-bind': 'error',
  'no-extra-label': 'error',
  'no-iterator': 'error',
  'no-lonely-if': 'error',
  'no-multi-assign': 'error',
  'no-multi-str': 'error',
  'no-nested-ternary': 'error',
  'no-new-object': 'error',
  'no-octal': 'error',
  'no-octal-escape': 'error',
  'no-proto': 'error',
  'no-script-url': 'error',
  'no-self-compare': 'error',
  'no-sequences': 'error',
  'no-unused-labels': 'error',
  'no-useless-catch': 'error',
  'no-useless-concat': 'error',
  'no-useless-return': 'error',
  'no-with': 'error',
  'prefer-exponentiation-operator': 'error',
  'prefer-object-spread': 'error',
  'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
  'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
  'prefer-rest-params': 'error',
  'prefer-spread': 'error',
  radix: 'error',
  'symbol-description': 'error',
  'no-var': 'error',
  yoda: 'error',
};

const legacyImportRules = {
  'import/no-cycle': [
    'error',
    {
      allowUnsafeDynamicCyclicDependency: false,
      ignoreExternal: false,
      maxDepth: '∞',
    },
  ],
  'import/no-duplicates': 'error',
  'import/no-import-module-exports': ['error', { exceptions: [] }],
  'import/no-mutable-exports': 'error',
  'import/no-named-default': 'error',
};

const legacyTypeScriptRules = {
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/dot-notation': [
    'error',
    {
      allowIndexSignaturePropertyAccess: false,
      allowKeywords: true,
      allowPattern: '',
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
    },
  ],
  '@typescript-eslint/naming-convention': [
    'error',
    { format: ['camelCase', 'PascalCase', 'UPPER_CASE'], selector: 'variable' },
    { format: ['camelCase', 'PascalCase'], selector: 'function' },
    { format: ['PascalCase'], selector: 'typeLike' },
  ],
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions', 'functions', 'methods'] }],
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-loop-func': 'error',
  '@typescript-eslint/no-redeclare': 'error',
  '@typescript-eslint/no-require-imports': 'error',
  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTaggedTemplates: false,
      allowTernary: false,
      enforceForJSX: false,
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'after-used', caughtErrors: 'none', ignoreRestSiblings: true, vars: 'all',
    },
  ],
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/only-throw-error': 'error',
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
};

const legacyTypeScriptStylisticRules = {
  '@stylistic/function-call-spacing': ['error', 'never'],
  '@stylistic/indent': [
    'error',
    2,
    {
      ArrayExpression: 1,
      CallExpression: { arguments: 1 },
      FunctionDeclaration: { body: 1, parameters: 1 },
      FunctionExpression: { body: 1, parameters: 1 },
      ImportDeclaration: 1,
      ObjectExpression: 1,
      SwitchCase: 1,
      VariableDeclarator: 1,
      flatTernaryExpressions: false,
      ignoreComments: false,
      ignoredNodes: [
        'JSXElement',
        'JSXElement > *',
        'JSXAttribute',
        'JSXIdentifier',
        'JSXNamespacedName',
        'JSXMemberExpression',
        'JSXSpreadAttribute',
        'JSXExpressionContainer',
        'JSXOpeningElement',
        'JSXClosingElement',
        'JSXFragment',
        'JSXOpeningFragment',
        'JSXClosingFragment',
        'JSXText',
        'JSXEmptyExpression',
        'JSXSpreadChild',
      ],
      offsetTernaryExpressions: false,
      outerIIFEBody: 1,
    },
  ],
};

const legacyRuleGapRationale = {
  nativePresets: [
    'eslint.configs.recommended supplies current core correctness rules.',
    'vueTsConfigs.recommended supplies supported TypeScript extension and parser rules.',
    "vue.configs['flat/recommended'] supplies Vue 3 correctness and deprecation rules.",
    "vueAccessibility.configs['flat/recommended'] supplies the maintained Vue accessibility rules.",
  ],
  stylisticMigration: [
    '@typescript-eslint formatting rules map to @stylistic rules in eslint.config.js.',
    'The comma-dangle mapping includes legacy TypeScript enums, generics, and tuples.',
    'Removed core formatting rules map to the same-named @stylistic rule where installed.',
  ],
  audit: [
    'The captured legacy effective configuration was compared with the active flat configuration.',
    'Available inherited Vue/template and remaining core rules are restored by eslint.legacy-additional-rules.json.',
    'Deprecated rule IDs are mapped to supported TypeScript, core, or stylistic replacements.',
    'Diagnostic wording can differ; enforcement is preserved rather than frozen to old messages.',
  ],
  unsupportedOrSuperseded: [
    '@typescript-eslint/ban-types is replaced by no-wrapper-object-types, no-unsafe-function-type, and no-empty-object-type.',
    'vue/component-tags-order is replaced by vue/block-order with the same template/script/style order.',
    '@typescript-eslint/no-var-requires was deprecated for no-require-imports; the existing CJS compatibility exception remains scoped to .cjs files.',
    'Removed core rules no-catch-shadow, no-native-reassign, no-negated-in-lhs, no-spaced-func, and no-return-await have no supported legacy ID.',
  ],
  irrelevant: [
    'react/* and jsx-a11y/* rules are omitted: the installed dependencies provide no React or JSX plugins, and repository source has no React import or JSX file.',
    'JSX-only stylistic rules are omitted for the same no-JSX source surface.',
  ],
};

module.exports = {
  legacyCoreRules,
  legacyImportRules,
  legacyRuleGapRationale,
  legacyTypeScriptRules,
  legacyTypeScriptStylisticRules,
};
