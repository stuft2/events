module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.eslint.json'
  },
  ignorePatterns: [
    'coverage',
    'dist',
    'node_modules'
  ]
}
