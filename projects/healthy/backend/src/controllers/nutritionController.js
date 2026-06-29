/**
 * Controlador de nutrición (BE-04).
 * GET /nutrition/today
 * PUT /nutrition/meals/:id/complete
 * GET /foods/search?q=
 * GET /foods/barcode/:code
 */

const prisma = require('../utils/prismaClient');
const { getCachedFoodSearch, cacheFoodSearch } = require('../services/cacheService');
const {
  sendSuccess,
  sendNotFound,
  sendError,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

// GET /nutrition/today — Comidas del día con macros
async function getTodayMeals(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const meals = await prisma.meal.findMany({
      where: {
        user_id: userId,
        scheduled_date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        meal_foods: { include: { food: true } },
      },
      orderBy: { scheduled_date: 'asc' },
    });

    // Calcular totales del día
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein_g: acc.protein_g + parseFloat(meal.protein_g || 0),
      carbs_g: acc.carbs_g + parseFloat(meal.carbs_g || 0),
      fat_g: acc.fat_g + parseFloat(meal.fat_g || 0),
      completed: acc.completed + (meal.status === 'completed' ? 1 : 0),
    }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, completed: 0 });

    return sendSuccess(res, { meals, totals, total_meals: meals.length }, 'Comidas de hoy');

  } catch (err) {
    logger.error('[nutrition] getTodayMeals error:', err);
    return sendServerError(res);
  }
}

// PUT /nutrition/meals/:id/complete — Marcar comida completada
async function completeMeal(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const meal = await prisma.meal.findFirst({
      where: { id, user_id: userId },
    });

    if (!meal) {
      return sendNotFound(res, 'Comida no encontrada');
    }

    if (meal.status === 'completed') {
      return sendError(res, 'MEAL_ALREADY_COMPLETED', 'Esta comida ya fue marcada como completada', 400);
    }

    const updated = await prisma.meal.update({
      where: { id },
      data: { status: 'completed' },
    });

    return sendSuccess(res, { meal: updated }, 'Comida marcada como completada');

  } catch (err) {
    logger.error('[nutrition] completeMeal error:', err);
    return sendServerError(res);
  }
}

// GET /foods/search?q= — Buscar alimentos por nombre
async function searchFoods(req, res) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return sendError(res, 'QUERY_TOO_SHORT', 'La búsqueda debe tener al menos 2 caracteres', 400);
    }

    const query = q.trim();

    // Verificar caché (BE-09)
    const cached = await getCachedFoodSearch(query);
    if (cached) {
      return sendSuccess(res, { foods: cached, total: cached.length, from_cache: true }, 'Alimentos encontrados');
    }

    const foods = await prisma.food.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 20,
      orderBy: [
        { verified: 'desc' },
        { name: 'asc' },
      ],
    });

    // Cachear resultados por 6 horas
    await cacheFoodSearch(query, foods);

    return sendSuccess(res, { foods, total: foods.length, from_cache: false }, 'Alimentos encontrados');

  } catch (err) {
    logger.error('[nutrition] searchFoods error:', err);
    return sendServerError(res);
  }
}

// GET /foods/barcode/:code — Buscar alimento por código de barras
async function getFoodByBarcode(req, res) {
  try {
    const { code } = req.params;

    const food = await prisma.food.findUnique({
      where: { barcode: code },
    });

    if (!food) {
      return sendNotFound(res, `No se encontró ningún alimento con el código de barras: ${code}`);
    }

    return sendSuccess(res, { food }, 'Alimento encontrado');

  } catch (err) {
    logger.error('[nutrition] getFoodByBarcode error:', err);
    return sendServerError(res);
  }
}

module.exports = {
  getTodayMeals,
  completeMeal,
  searchFoods,
  getFoodByBarcode,
};
