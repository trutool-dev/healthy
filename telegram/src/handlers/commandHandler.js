const { listProjects, setActiveProject, getActiveProject, getProjectStatus, readProjectFile } = require('../services/studioService');
const { clearHistory } = require('../services/historyService');
const { truncate, sendMarkdown } = require('../utils/telegram');

const AGENTS = [
  'orchestrator', 'frontend', 'backend', 'database',
  'ai', 'design', 'tests', 'devops', 'security', 'docs',
];

async function handleCommand(bot, msg, command, arg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Verificar usuario autorizado si está configurado
  const allowedId = process.env.ALLOWED_USER_ID;
  if (allowedId && String(userId) !== String(allowedId)) {
    return bot.sendMessage(chatId, '⛔ No tienes permiso para usar este bot.');
  }

  switch (command) {
    case 'start':
      clearHistory(userId);
      return sendMarkdown(bot, chatId, `*🤖 AI Studio Bot*

Soy tu interfaz con el estudio de desarrollo de software.

*Comandos disponibles:*
/proyectos — ver proyectos disponibles
/proyecto \`<nombre>\` — seleccionar proyecto activo
/status — estado del proyecto activo
/tareas — ver tareas del proyecto activo
/agentes — ver agentes disponibles
/help — esta ayuda

O simplemente escríbeme cualquier mensaje y te responderé con ayuda de Claude.`);

    case 'help':
      return sendMarkdown(bot, chatId, `*📖 Ayuda — AI Studio Bot*

*Comandos:*
• /start — reiniciar conversación
• /proyectos — listar proyectos
• /proyecto \`<nombre>\` — activar un proyecto
• /status — estado del proyecto activo
• /tareas — ver tasks.md del proyecto activo
• /agentes — agentes disponibles en el estudio

*Mensajes libres:*
Puedes escribir cualquier pregunta o instrucción y la procesaré con Claude API.
Si tienes un proyecto activo, el contexto del proyecto se incluye automáticamente.`);

    case 'proyectos': {
      const projects = listProjects();
      if (projects.length === 0) {
        return bot.sendMessage(chatId, '📂 No hay proyectos en el estudio todavía.');
      }
      const active = getActiveProject(userId);
      const list = projects.map(p => (p === active ? `✅ \`${p}\`` : `• \`${p}\``)).join('\n');
      return sendMarkdown(bot, chatId, `*📂 Proyectos disponibles:*\n\n${list}\n\nUsa /proyecto \`<nombre>\` para seleccionar uno.`);
    }

    case 'proyecto': {
      if (!arg) return bot.sendMessage(chatId, 'Uso: /proyecto <nombre>');
      const ok = setActiveProject(userId, arg.trim());
      if (!ok) {
        return bot.sendMessage(chatId, `❌ Proyecto "${arg}" no encontrado. Usa /proyectos para ver la lista.`);
      }
      return sendMarkdown(bot, chatId, `✅ Proyecto activo: *${arg.trim()}*\nUsa /status o /tareas para ver su estado.`);
    }

    case 'status': {
      const active = getActiveProject(userId);
      if (!active) {
        return bot.sendMessage(chatId, '⚠️ No tienes un proyecto activo. Usa /proyectos y /proyecto <nombre>.');
      }
      const { tasks, requirements } = getProjectStatus(active);
      if (!tasks && !requirements) {
        return bot.sendMessage(chatId, `📁 Proyecto: ${active}\n\nNo se encontraron archivos tasks.md ni requirements.md.`);
      }
      let text = `*📊 Estado: ${active}*\n\n`;
      if (requirements) {
        const firstLines = requirements.split('\n').slice(0, 8).join('\n');
        text += `*Requirements:*\n${firstLines}\n\n`;
      }
      if (tasks) {
        const firstLines = tasks.split('\n').slice(0, 15).join('\n');
        text += `*Tareas:*\n${firstLines}`;
      }
      return sendMarkdown(bot, chatId, truncate(text));
    }

    case 'tareas': {
      const active = getActiveProject(userId);
      if (!active) {
        return bot.sendMessage(chatId, '⚠️ No tienes un proyecto activo. Usa /proyectos y /proyecto <nombre>.');
      }
      const tasks = readProjectFile(active, 'tasks.md');
      if (!tasks) {
        return bot.sendMessage(chatId, `📋 No se encontró tasks.md en el proyecto "${active}".`);
      }
      return sendMarkdown(bot, chatId, truncate(`*📋 Tareas — ${active}*\n\n${tasks}`));
    }

    case 'agentes': {
      const list = AGENTS.map(a => `• \`${a}\``).join('\n');
      return sendMarkdown(bot, chatId, `*🤖 Agentes disponibles:*\n\n${list}`);
    }

    default:
      return bot.sendMessage(chatId, 'Comando no reconocido. Usa /help para ver los comandos disponibles.');
  }
}

module.exports = { handleCommand };
