const { sendSuccess } = require('../utils/response.util');

/** GET /training/sessions */
const getSessions = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** GET /training/sessions/:id */
const getSessionById = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /training/sessions/:id/complete */
const completeSession = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** POST /training/sessions/:id/exercises/:exerciseId/complete */
const completeExercise = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

module.exports = { getSessions, getSessionById, completeSession, completeExercise };
