const { sendSuccess } = require('../utils/response.util');

/** POST /onboarding/start */
const start = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /onboarding/profile */
const saveProfile = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /onboarding/lifestyle */
const saveLifestyle = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /onboarding/training */
const saveTraining = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /onboarding/nutrition */
const saveNutrition = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /onboarding/health */
const saveHealth = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** PUT /onboarding/motivation */
const saveMotivation = async (req, res, next) => {
  try {
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

/** POST /onboarding/complete */
const complete = async (req, res, next) => {
  try {
    // TODO: invocar servicio de IA para generar plan personalizado
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) { next(err); }
};

module.exports = { start, saveProfile, saveLifestyle, saveTraining, saveNutrition, saveHealth, saveMotivation, complete };
