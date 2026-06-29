const { askClaude } = require('../services/claudeService');
const { getActiveProject, getProjectStatus } = require('../services/studioService');
const { sendMarkdown, truncate } = require('../utils/telegram');

async function handleMessage(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  // Verificar usuario autorizado si está configurado
  const allowedId = process.env.ALLOWED_USER_ID;
  if (allowedId && String(userId) !== String(allowedId)) return;

  // Mostrar indicador de escritura
  bot.sendChatAction(chatId, 'typing');

  // Construir contexto del proyecto activo si existe
  let projectContext = null;
  const activeProject = getActiveProject(userId);
  if (activeProject) {
    const { tasks, requirements } = getProjectStatus(activeProject);
    const parts = [`Proyecto activo: ${activeProject}`];
    if (requirements) parts.push(`requirements.md:\n${requirements.slice(0, 1000)}`);
    if (tasks) parts.push(`tasks.md:\n${tasks.slice(0, 1500)}`);
    projectContext = parts.join('\n\n');
  }

  try {
    const reply = await askClaude(userId, text, projectContext);
    await sendMarkdown(bot, chatId, truncate(reply));
  } catch (err) {
    console.error('Error al llamar a Claude:', err.message);
    await bot.sendMessage(chatId, '❌ Error al procesar tu mensaje. Inténtalo de nuevo.');
  }
}

module.exports = { handleMessage };
