const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authRateLimiter } = require('../middleware/rateLimiter.middleware');
const ctrl = require('../controllers/auth.controller');

router.post(
  '/register',
  authRateLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('phone_number').optional().isMobilePhone().withMessage('Teléfono inválido'),
  ],
  validate,
  ctrl.register
);

router.post(
  '/verify-email',
  authRateLimiter,
  [
    body('email').isEmail(),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Código de 6 dígitos requerido'),
  ],
  validate,
  ctrl.verifyEmail
);

router.post(
  '/set-password',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres'),
  ],
  validate,
  ctrl.setPassword
);

router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  ctrl.login
);

router.post(
  '/forgot-password',
  authRateLimiter,
  [body('email').isEmail()],
  validate,
  ctrl.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ],
  validate,
  ctrl.resetPassword
);

router.post(
  '/resend-code',
  authRateLimiter,
  [body('email').isEmail()],
  validate,
  ctrl.resendCode
);

router.post('/logout', authenticate, ctrl.logout);

router.get('/me', authenticate, ctrl.me);

module.exports = router;
