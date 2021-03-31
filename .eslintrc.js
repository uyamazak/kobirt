module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'prettier',
    'plugin:prettier/recommended',
    'plugin:vue/vue3-recommended',
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {},
}
