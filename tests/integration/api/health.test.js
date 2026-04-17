/**
 * Test de integración: endpoint GET /health
 * Verifica que el servidor responde correctamente.
 */

const request = require('supertest');

// Silenciamos el logger de Morgan durante los tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:8081';

jest.mock('../../../backend/src/prisma/client', () => require('../../mocks/prisma.mock'));
jest.mock('../../../backend/src/services/redis.service', () => ({
  get: jest.fn(), set: jest.fn(), del: jest.fn(),
}));

const app = require('../../../backend/src/app');

describe('GET /health', () => {
  test('responde con 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  test('responde con success: true', async () => {
    const res = await request(app).get('/health');
    expect(res.body.success).toBe(true);
  });

  test('responde con message: OK', async () => {
    const res = await request(app).get('/health');
    expect(res.body.message).toBe('OK');
  });

  test('responde en JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});
