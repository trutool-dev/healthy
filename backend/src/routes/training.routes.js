const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/training.controller');

router.use(authenticate);

router.get('/sessions', ctrl.getSessions);
router.get('/sessions/:id', ctrl.getSessionById);
router.put('/sessions/:id/complete', ctrl.completeSession);
router.post('/sessions/:id/exercises/:exerciseId/complete', ctrl.completeExercise);

module.exports = router;
