const { config } = require('../config');

let anthropicClient = null;

function getClient() {
  if (!anthropicClient) {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: config.anthropic.apiKey });
  }
  return anthropicClient;
}

function isConfigured() {
  return !!config.anthropic.apiKey;
}

/**
 * Generate a fresh love note using Claude.
 * @param {object} options
 * @param {string} options.timeOfDay - "morning", "afternoon", or "evening"
 * @param {string|null} options.weather - weather description or null
 * @param {string} options.mood - optional mood hint
 */
async function generateMessage({ timeOfDay = 'any', weather = null, mood = null } = {}) {
  if (!isConfigured()) return null;

  const client = getClient();
  const partnerName = config.partnerName;

  let contextParts = [`Time of day: ${timeOfDay}`];
  if (weather) contextParts.push(`Weather: ${weather}`);
  if (mood) contextParts.push(`Mood/vibe: ${mood}`);
  if (config.anniversaryDate) {
    const days = Math.floor((Date.now() - new Date(config.anniversaryDate).getTime()) / 86400000);
    contextParts.push(`Days together: ${days}`);
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are a loving boyfriend writing a short, sweet text message to your girlfriend${partnerName ? ` (${partnerName})` : ''}.

Context: ${contextParts.join('. ')}

Write ONE short love note text message (1-2 sentences max). Make it feel natural, personal, and genuine — like a real text, not a greeting card. Don't be cheesy or over the top. Use an emoji only if it feels natural. Don't use quotation marks. Just output the message text, nothing else.`,
        },
      ],
    });

    const text = response.content[0].text.trim();
    return text;
  } catch (err) {
    console.error(`[AI] Failed to generate: ${err.message}`);
    return null;
  }
}

module.exports = { generateMessage, isConfigured };
