const { sendSuccess } = require('../utils/response.util');

/** GET /foods/search?q= */
const searchFoods = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** GET /foods/barcode/:code */
const getFoodByBarcode = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

module.exports = { searchFoods, getFoodByBarcode };
