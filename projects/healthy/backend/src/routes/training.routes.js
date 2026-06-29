/**
 * Rutas de entrenamiento (BE-03).
 */

const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/training.controller');

router.use(authenticate);

// GET /training/today — Sesión programada para hoy
router.get('/today', (req, res, next) => {
  // Delegar a getSessions con la fecha de hoy
  req.query.date = new Date().toISOString().split('T')[0];
  return ctrl.getSessions(req, res, next);
});

router.get('/sessions', ctrl.getSessions);
router.get('/sessions/:id', ctrl.getSessionById);
router.put('/sessions/:id/complete', ctrl.completeSession);

// BE-03: Registrar serie de ejercicio
const exerciseSetsValidation = [
  body('reps').isInt({ gt: 0 }).withMessage('reps debe ser un entero positivo'),
  body('weight_kg').opt