/**
 * Mock del cliente Prisma para tests de integración.
 * Cada modelo expone los métodos típicos como jest.fn().
 */
const makeModel = () => ({
  findUnique:  jest.fn(),
  findFirst:   jest.fn(),
  findMany:    jest.fn(),
  create:      jest.fn(),
  update:      jest.fn(),
  upsert:      jest.fn(),
  delete:      jest.fn(),
  deleteMany:  jest.fn(),
  count:       jest.fn(),
});

const prisma = {
  user:                makeModel(),
  profile:             makeModel(),
  verificationCode:    makeModel(),
  passwordResetToken:  makeModel(),
  authSession:         makeModel(),
  plan:                makeModel(),
  trainingSession:     makeModel(),
  meal:                makeModel(),
  progressLog:         makeModel(),
  dailyLog:            makeModel(),
  food:                makeModel(),
  $disconnect:         jest.fn(),
  $connect:            jest.fn(),
};

module.exports = prisma;
