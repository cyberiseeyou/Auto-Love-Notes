const axios = require('axios');
const { config } = require('../config');

const GRAPH_API_URL = 'https://graph.facebook.com/v19.0/me/messages';

async function sendMessenger(messageText) {
  const response = await axios.post(
    GRAPH_API_URL,
    {
      recipient: { id: config.facebook.recipientId },
      message: { text: messageText },
      messaging_type: 'UPDATE',
    },
    {
      params: { access_token: config.facebook.pageAccessToken },
    }
  );

  return {
    channel: 'messenger',
    recipientId: response.data.recipient_id,
    messageId: response.data.message_id,
  };
}

function isConfigured() {
  return !!(config.facebook.pageAccessToken && config.facebook.recipientId);
}

module.exports = { sendMessenger, isConfigured };
