const OpenAI = require('openai');

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey: key });
}

/**
 * Simple OpenAI chat completion call returning text content
 * @param {string} model
 * @param {string} prompt
 * @param {Array} [messages]
 */
async function openaiCall(model, prompt, messages) {
  const client = getClient();
  const msgs = messages || [
    { role: 'user', content: prompt }
  ];
  const resp = await client.chat.completions.create({
    model: model || 'gpt-4o',
    messages: msgs,
    temperature: 0.2,
    max_tokens: 800
  });
  return resp.choices?.[0]?.message?.content || '';
}

module.exports = { openaiCall };

