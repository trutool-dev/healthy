const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/plans.controller');

router.use(authenticate);

router.get('/', ctrl.getActivePlan);
router.get('/:id', ctrl.getPlanById);
router.post('/regenerate', ctrl.regeneratePlan);
router.put('/:id/pause', ctrl.pausePlan);

module.exports = router;
