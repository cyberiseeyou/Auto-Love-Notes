const { config } = require('../config');

let twilioClient = null;

function getClient() {
  if (!twilioClient) {
    const twilio = require('twilio');
    twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
  }
  return twilioClient;
}

async function sendSMS(messageText) {
  const client = getClient();

  const result = await client.messages.create({
    body: messageText,
    from: config.twilio.phoneNumber,
    to: config.twilio.recipientNumber,
  });

  return {
    channel: 'sms',
    sid: result.sid,
    status: result.status,
    to: config.twilio.recipientNumber,
  };
}

function isConfigured() {
  return !!(
    config.twilio.accountSid &&
    config.twilio.authToken &&
    config.twilio.phoneNumber &&
    config.twilio.recipientNumber
  );
}

module.exports = { sendSMS, isConfigured };
