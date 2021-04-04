module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {},
}
