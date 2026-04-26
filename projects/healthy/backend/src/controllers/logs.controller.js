const { sendSuccess } = require('../utils/response.util');

/** GET /logs/today */
const getToday = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /logs/today */
const updateToday = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** GET /logs/history */
const getHistory = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

module.exports = { getToday, updateToday, getHistory };
