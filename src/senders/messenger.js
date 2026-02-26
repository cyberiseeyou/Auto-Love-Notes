const axios = require('axios');
const fs = require('fs');
const path = require('path');
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

/**
 * Send a photo via Messenger using the attachment upload API.
 */
async function sendPhoto(photoPath, captionText) {
  // Send the caption text first if provided
  if (captionText) {
    await sendMessenger(captionText);
  }

  const photoBuffer = fs.readFileSync(photoPath);
  const filename = path.basename(photoPath);
  const ext = path.extname(photoPath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  };
  const mimeType = mimeTypes[ext] || 'image/jpeg';

  const formBoundary = '----LoveNotes' + Date.now();
  const recipientPart = JSON.stringify({ id: config.facebook.recipientId });
  const messagePart = JSON.stringify({ attachment: { type: 'image', payload: { is_reusable: false } } });

  let body = '';
  body += `--${formBoundary}\r\n`;
  body += `Content-Disposition: form-data; name="recipient"\r\n\r\n`;
  body += `${recipientPart}\r\n`;
  body += `--${formBoundary}\r\n`;
  body += `Content-Disposition: form-data; name="message"\r\n\r\n`;
  body += `${messagePart}\r\n`;
  body += `--${formBoundary}\r\n`;
  body += `Content-Disposition: form-data; name="filedata"; filename="${filename}"\r\n`;
  body += `Content-Type: ${mimeType}\r\n\r\n`;

  const bodyStart = Buffer.from(body, 'utf-8');
  const bodyEnd = Buffer.from(`\r\n--${formBoundary}--\r\n`, 'utf-8');
  const fullBody = Buffer.concat([bodyStart, photoBuffer, bodyEnd]);

  const response = await axios.post(GRAPH_API_URL, fullBody, {
    params: { access_token: config.facebook.pageAccessToken },
    headers: { 'Content-Type': `multipart/form-data; boundary=${formBoundary}` },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return {
    channel: 'messenger',
    type: 'photo',
    recipientId: response.data.recipient_id,
    messageId: response.data.message_id,
  };
}

function isConfigured() {
  return !!(config.facebook.pageAccessToken && config.facebook.recipientId);
}

module.exports = { sendMessenger, sendPhoto, isConfigured };
