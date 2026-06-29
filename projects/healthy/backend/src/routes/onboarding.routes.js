const router = require('express').Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const ctrl = require('../controllers/onboarding.controller');

// Todos los endpoints de onboarding requieren autenticación
router.use(authenticate);

router.post('/start', ctrl.start);

// PUT /onboarding/profile
router.put('/profile',
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('birthdate').notEmpty().isISO8601().withMessage('Fecha de nacimiento inválida (ISO8601)