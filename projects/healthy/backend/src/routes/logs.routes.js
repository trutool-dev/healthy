const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/logs.controller');

router.use(authenticate);

router.get('/today', ctrl.getToday);
router.put('/today', ctrl.updateToday);
router.get('/history', ctrl.getHistory);

module.exports = router;
