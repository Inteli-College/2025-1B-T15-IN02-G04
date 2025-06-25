module.exports = {
  testMatch: ['**/__tests__/**/*.test.js', '**/tests/**/*.test.js'],
  testEnvironment: 'node',
  clearMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/routes/**/*.js',
    'src/middlewares/**/*.js',
    'src/models/**/*.js',
    'src/config/**/*.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
      branches: 80,
      functions: 90
    }
  },
  verbose: true,
  setupFiles: ['dotenv/config']
};