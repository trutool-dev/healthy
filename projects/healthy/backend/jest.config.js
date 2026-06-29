/**
 * Configuración de Jest para el backend de Healthy.
 * Ejecutado desde la raíz del proyecto (healthy/) para que los tests
 * en tests/integration/ puedan importar desde backend/src/.
 */

module.exports = {
  testEnvironment: 'node',

  // Buscar tests en la carpeta tests/ del proyecto (no solo en backend/)
  testMatch: [
    '<rootDir>/../tests/**/*.test.js',
    '<rootDir>/../tests/*.test.js',
  ],

  // Cobertura: solo del código de backend
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
    '!<rootDir>/src/generated/**',
  ],

  // Umbral mínimo de cobertura (TS-07)
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },

  // Reporte de cobertura en múltiples formatos
  coverageReporters: ['text', 'lcov', 'html'],

  // Variables de entorno para tests
  testEnvironmentOptions: {},

  // Timeout extendido para tests de integración (BD real)
  testTimeout: 30000,

  // Ejecutar tests de forma secuencial para evitar conflictos en BD
  runInBand: true,
};
