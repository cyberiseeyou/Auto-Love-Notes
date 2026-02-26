const { sendMessenger, sendPhoto, isConfigured } = require('./messenger');
const { appendHistory } = require('../config');

async function send(messageText) {
  if (!isConfigured()) {
    const msg = 'Messenger not configured. Set FB_PAGE_ACCESS_TOKEN and FB_RECIPIENT_ID in .env';
    console.error(msg);
    throw new Error(msg);
  }

  try {
    const result = await sendMessenger(messageText);
    appendHistory({ message: messageText, ...result });
    return result;
  } catch (err) {
    console.error(`[Messenger] Failed to send: ${err.message}`);
    appendHistory({ message: messageText, channel: 'messenger', error: err.message });
    throw err;
  }
}

async function sendWithPhoto(photoPath, captionText) {
  if (!isConfigured()) {
    throw new Error('Messenger not configured.');
  }

  try {
    const result = await sendPhoto(photoPath, captionText);
    appendHistory({ message: captionText || '(photo)', type: 'photo', ...result });
    return result;
  } catch (err) {
    console.error(`[Messenger] Failed to send photo: ${err.message}`);
    appendHistory({ message: captionText || '(photo)', type: 'photo', channel: 'messenger', error: err.message });
    throw err;
  }
}

module.exports = { send, sendWithPhoto, isConfigured };
