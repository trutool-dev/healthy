const { sendSuccess } = require('../utils/response.util');

/** GET /nutrition/meals */
const getMeals = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /nutrition/meals/:id/complete */
const completeMeal = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

module.exports = { getMeals, completeMeal };
