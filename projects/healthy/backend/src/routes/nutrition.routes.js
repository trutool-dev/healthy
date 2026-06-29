const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/nutrition.controller');

router.use(authenticate);

router.get('/meals', ctrl.getMeals);
router.put('/meals/:id/complete', ctrl.completeMeal);

module.exports = router;
