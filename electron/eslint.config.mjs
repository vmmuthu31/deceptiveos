export default {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-var': 'error',
    'prefer-const': 'error',
    'no-console': 'off',
  },
};
