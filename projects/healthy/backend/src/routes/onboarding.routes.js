const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/onboarding.controller');

// Todos los endpoints de onboarding requieren autenticación
router.use(authenticate);

router.post('/start', ctrl.start);
router.put('/profile', ctrl.saveProfile);
router.put('/lifestyle', ctrl.saveLifestyle);
router.put('/training', ctrl.saveTraining);
router.put('/nutrition', ctrl.saveNutrition);
router.put('/health', ctrl.saveHealth);
router.put('/motivation', ctrl.saveMotivation);
router.post('/complete', ctrl.complete);

module.exports = router;
