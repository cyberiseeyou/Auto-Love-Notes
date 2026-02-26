const { sendSMS, isConfigured: smsConfigured } = require('./sms');
const { sendMessenger, isConfigured: messengerConfigured } = require('./messenger');
const { config, appendHistory } = require('../config');

async function send(messageText) {
  const channel = config.channel;
  const results = [];

  if ((channel === 'sms' || channel === 'both') && smsConfigured()) {
    try {
      const result = await sendSMS(messageText);
      appendHistory({ message: messageText, ...result });
      results.push(result);
    } catch (err) {
      console.error(`[SMS] Failed to send: ${err.message}`);
      appendHistory({ message: messageText, channel: 'sms', error: err.message });
    }
  }

  if ((channel === 'messenger' || channel === 'both') && messengerConfigured()) {
    try {
      const result = await sendMessenger(messageText);
      appendHistory({ message: messageText, ...result });
      results.push(result);
    } catch (err) {
      console.error(`[Messenger] Failed to send: ${err.message}`);
      appendHistory({ message: messageText, channel: 'messenger', error: err.message });
    }
  }

  if (results.length === 0) {
    const msg = `No channels available. Channel="${channel}", SMS configured=${smsConfigured()}, Messenger configured=${messengerConfigured()}`;
    console.error(msg);
    throw new Error(msg);
  }

  return results;
}

module.exports = { send, smsConfigured, messengerConfigured };
