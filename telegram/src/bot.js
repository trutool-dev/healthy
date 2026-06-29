const TelegramBot = require('node-telegram-bot-api');
const { handleCommand } = require('./handlers/commandHandler');
const { handleMessage } = require('./handlers/messageHandler');

function createBot(token) {
  const bot = new TelegramBot(token, { polling: true });

  // Registrar manejadores de comandos
  bot.onText(/\/start/, (msg) => handleCommand(bot, msg, 'start'));
  bot.onText(/\/status/, (msg) => handleCommand(bot, msg, 'status'));
  bot.onText(/\/proyectos/, (msg) => handleCommand(bot, msg, 'proyectos'));
  bot.onText(/\/proyecto (.+)/, (msg, match) => handleCommand(bot, msg, 'proyecto', match[1]));
  bot.onText(/\/tareas/, (msg) => handleCommand(bot, msg, 'tareas'));
  bot.onText(/\/agentes/, (msg) => handleCommand(bot, msg, 'agentes'));
  bot.onText(/\/help/, (msg) => handleCommand(bot, msg, 'help'));

  // Mensajes de texto libres (excluir comandos)
  bot.on('message', (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    handleMessage(bot, msg);
  });

  bot.on('polling_error', (err) => {
    console.error('Error de polling:', err.message);
  });

  return bot;
}

module.exports = { createBot };
