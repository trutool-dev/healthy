/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',

  // Transforma JS y TS con babel-jest (incluye TypeScript de los stores)
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },

  testMatch: [
    '<rootDir>/unit/**/*.test.(js|ts)',
    '<rootDir>/integration/**/*.test.(js|ts)',
  ],

  // Mapea módulos nativos que no corren en Node.js
  moduleNameMapper: {
    '^expo-secure-store$': '<rootDir>/mocks/secureStore.mock.js',
    '^react-native$': '<rootDir>/mocks/reactNative.mock.js',
  },

  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '../ai/src/**/*.js',
    '../backend/src/**/*.js',
    '../frontend/src/stores/**/*.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 80, statements: 80 },
  },

  clearMocks: true,
  // Necesario para que zustand funcione en Node sin entorno DOM
  testEnvironmentOptions: {},
};
