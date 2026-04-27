const Anthropic = require('@anthropic-ai/sdk');
const { getHistory, appendHistory } = require('./historyService');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres el asistente de AI Studio, un estudio de desarrollo de software impulsado por agentes de IA.
Tu rol es ayudar al usuario a gestionar sus proyectos de software respondiendo preguntas,
dando recomendaciones técnicas y coordinando el flujo de trabajo del estudio.

El estudio tiene esta estructura:
- /agents: agentes reutilizables (orchestrator, frontend, backend, database, ai, design, tests, devops, security, docs)
- /projects: proyectos en desarrollo

Responde siempre en español, de forma clara y concisa.
Usa formato Markdown cuando sea útil.
Máximo 4000 caracteres por respuesta.`;

async function askClaude(userId, userMessage, projectContext = null) {
  const history = getHistory(userId);

  let messageContent = userMessage;
  if (projectContext) {
    messageContent = `[Contexto del proyecto activo]\n${projectContext}\n\n[Mensaje del usuario]\n${userMessage}`;
  }

  appendHistory(userId, 'user', messageContent);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: history,
  });

  const assistantMessage = response.content[0].text;
  appendHistory(userId, 'assistant', assistantMessage);

  return assistantMessage;
}

module.exports = { askClaude };
