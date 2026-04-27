// Gestión del historial de conversación por usuario (sin dependencia de Claude API)
const conversationHistory = new Map();

const MAX_TURNS = 20; // 20 turnos = 40 entradas (user + assistant)

function getHistory(userId) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
}

function appendHistory(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content });
  if (history.length > MAX_TURNS * 2) {
    history.splice(0, 2);
  }
}

function clearHistory(userId) {
  conversationHistory.delete(userId);
}

module.exports = { getHistory, appendHistory, clearHistory };
