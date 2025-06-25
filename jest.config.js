module.exports = {
  testMatch: ['**/__tests__/**/*.test.js', '**/tests/**/*.test.js'],
  testEnvironment: 'node',
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'models/**/*.js',
    'repositories/**/*.js',
    '!**/node_modules/**'
  ],
  verbose: true,
  setupFiles: ['dotenv/config']
};