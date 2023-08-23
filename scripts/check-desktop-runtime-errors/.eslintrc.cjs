require('@rushstack/eslint-patch/modern-module-resolution.js');

module.exports = {
  env: {
    node: true,
  },
  rules: {
    'import/extensions': ['error', 'always'],
  },
};
