const { rules: baseStyleRules } = require('eslint-config-airbnb-base/rules/style');
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  env: {
    node: true,
  },
  rules: {
    "import/extensions": ["error", "always"],
  },
};
