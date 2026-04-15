const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const onboardingRoutes = require('./routes/onboarding.routes');
const plansRoutes = require('./routes/plans.routes');
const trainingRoutes = require('./routes/training.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const progressRoutes = require('./routes/progress.routes');
const logsRoutes = require('./routes/logs.routes');
const foodsRoutes = require('./routes/foods.routes');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// Seguridad y utilidades
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/auth', authRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/plans', plansRoutes);
app.use('/training', trainingRoutes);
app.use('/nutrition', nutritionRoutes);
app.use('/progress', progressRoutes);
app.use('/logs', logsRoutes);
app.use('/foods', foodsRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

// Manejo centralizado de errores
app.use(errorHandler);

module.exports = app;
