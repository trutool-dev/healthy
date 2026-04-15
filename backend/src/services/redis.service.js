const Redis = require('ioredis');
const logger = require('../utils/logger.util');

const redis = new Redis(process.env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info('[redis] Conexión establecida'));
redis.on('error', (err) => logger.error(`[redis] Error: ${err.message}`));

module.exports = redis;
