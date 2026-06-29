const MAX_LENGTH = 4000;

function truncate(text) {
  if (text.length <= MAX_LENGTH) return text;
  return text.slice(0, MAX_LENGTH - 20) + '\n\n_...respuesta truncada_';
}

// Intenta enviar con Markdown; si falla (por caracteres especiales), envía texto plano
async function sendMarkdown(bot, chatId, text) {
  try {
    return await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch {
    return await bot.sendMessage(chatId, text);
  }
}

module.exports = { truncate, sendMarkdown };
