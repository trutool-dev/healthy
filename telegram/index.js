require('dotenv').config();
const { createBot } = require('./src/bot');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Error: TELEGRAM_BOT_TOKEN no está definido en las variables de entorno');
  process.exit(1);
}

const bot = createBot(token);

process.once('SIGINT', () => bot.stopPolling());
process.once('SIGTERM', () => bot.stopPolling());

console.log('AI Studio Bot iniciado. Esperando mensajes...');
