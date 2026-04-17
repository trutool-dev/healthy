/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/unit/**/*.test.js',
    '<rootDir>/integration/**/*.test.js',
    '<rootDir>/components/**/*.test.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '../ai/src/**/*.js',
    '../backend/src/**/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
  clearMocks: true,
};
