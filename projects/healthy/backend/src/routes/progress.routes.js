const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/progress.controller');

router.use(authenticate);

router.get('/', ctrl.getProgress);
router.post('/', ctrl.createProgress);
router.get('/stats', ctrl.getStats);

module.exports = router;
