const cron = require('node-cron');
const { config, loadMessages, loadSpecialDates, loadSettings, saveSettings } = require('./config');
const { send, sendWithPhoto } = require('./senders');
const { getWeather, weatherMessage } = require('./features/weather');
const { generateMessage, isConfigured: aiConfigured } = require('./features/ai-generator');
const { getRandomQuote } = require('./features/quotes');
const { getNextReason } = require('./features/reasons');
const { getComplimentCombo } = require('./features/compliments');
const { getRandomJoke } = require('./features/inside-jokes');
const { getRandomPhoto } = require('./features/photo-notes');

let scheduledTimeouts = [];
let dailyCronJob = null;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get the current time-of-day category.
 */
function getTimeOfDay(hour) {
  if (hour === undefined) hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Check if DND mode is active.
 */
function isDND() {
  const settings = loadSettings();
  if (!settings.dnd.enabled) return false;
  if (settings.dnd.until) {
    const until = new Date(settings.dnd.until);
    if (Date.now() > until.getTime()) {
      // DND expired — auto-disable
      settings.dnd.enabled = false;
      settings.dnd.until = null;
      saveSettings(settings);
      return false;
    }
  }
  return true;
}

/**
 * Pick a message type based on configured weights.
 */
function pickMessageType(settings) {
  const { weights, features } = settings;
  const pool = [];

  pool.push(...Array(weights.custom).fill('custom'));
  if (features.aiGenerated && aiConfigured()) pool.push(...Array(weights.aiGenerated).fill('aiGenerated'));
  if (features.quotes) pool.push(...Array(weights.quote).fill('quote'));
  if (features.reasons) pool.push(...Array(weights.reason).fill('reason'));
  if (features.compliments) pool.push(...Array(weights.compliment).fill('compliment'));
  if (features.insideJokes) pool.push(...Array(weights.insideJoke).fill('insideJoke'));

  if (pool.length === 0) return 'custom';
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pick a custom message appropriate for the time of day.
 */
function pickCustomMessage(messages, timeOfDay, recentIds = []) {
  if (messages.length === 0) return null;

  const timeFiltered = messages.filter(
    (m) => m.timeOfDay === 'any' || m.timeOfDay === timeOfDay
  );
  const pool = timeFiltered.length > 0 ? timeFiltered : messages;
  const unsent = pool.filter((m) => !recentIds.includes(m.id));
  const finalPool = unsent.length > 0 ? unsent : pool;

  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

/**
 * Build a message to send, using the weighted type picker.
 */
async function buildMessage(timeOfDay, weather, recentIds) {
  const settings = loadSettings();
  const type = pickMessageType(settings);

  switch (type) {
    case 'aiGenerated': {
      const weatherDesc = weather ? `${weather.description}, ${weather.temp}°` : null;
      const msg = await generateMessage({ timeOfDay, weather: weatherDesc });
      if (msg) return { text: msg, type: 'ai' };
      break;
    }
    case 'quote': {
      const quote = getRandomQuote();
      if (quote) return { text: quote, type: 'quote' };
      break;
    }
    case 'reason': {
      const reason = getNextReason();
      if (reason) return { text: reason, type: 'reason' };
      break;
    }
    case 'compliment': {
      const combo = getComplimentCombo();
      if (combo) return { text: combo, type: 'compliment' };
      break;
    }
    case 'insideJoke': {
      const joke = getRandomJoke();
      if (joke) return { text: joke, type: 'insideJoke' };
      break;
    }
  }

  // Fallback to custom message
  const messages = loadMessages();
  const picked = pickCustomMessage(messages, timeOfDay, recentIds);
  if (picked) return { text: picked.text, type: 'custom', id: picked.id };

  return null;
}

/**
 * Get special date messages for today.
 */
function getSpecialDateMessages() {
  const specialDates = loadSpecialDates();
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  return specialDates.filter((sd) => sd.month === month && sd.day === day);
}

/**
 * Generate random send times within the configured window.
 */
function generateSendTimes(count) {
  const { earliestHour, latestHour } = config.schedule;
  const now = new Date();
  const times = [];

  for (let i = 0; i < count; i++) {
    const hour = randomInt(earliestHour, latestHour - 1);
    const minute = randomInt(0, 59);
    const sendTime = new Date(now);
    sendTime.setHours(hour, minute, 0, 0);
    if (sendTime > now) times.push(sendTime);
  }

  return times.sort((a, b) => a - b);
}

/**
 * Schedule all messages for today.
 */
async function scheduleDailyMessages() {
  clearScheduled();

  const { minPerDay, maxPerDay } = config.schedule;
  let count = randomInt(minPerDay, maxPerDay);

  const specialDateEntries = getSpecialDateMessages();
  if (specialDateEntries.length > 0) {
    console.log(`[Scheduler] Special date today! Adding ${specialDateEntries.length} bonus messages.`);
    count += specialDateEntries.length;
  }

  // Fetch weather for the day (cached)
  const weather = await getWeather();
  if (weather) {
    console.log(`[Scheduler] Weather: ${weather.description}, ${weather.temp}° in ${weather.city}`);
  }

  const settings = loadSettings();

  // Maybe add a weather message as one of the sends
  if (settings.features.weatherAware && weather && Math.random() < 0.4) {
    count += 1;
  }

  const times = generateSendTimes(count);
  const recentIds = [];
  let weatherSent = false;

  console.log(`[Scheduler] Scheduling ${times.length} messages for today:`);

  times.forEach((time, index) => {
    const delay = time.getTime() - Date.now();
    if (delay <= 0) return;

    const timeout = setTimeout(async () => {
      // Check DND before sending
      if (isDND()) {
        console.log(`[${new Date().toLocaleTimeString()}] DND active — skipping`);
        return;
      }

      let messageText;
      let messageType = 'custom';
      const timeOfDay = getTimeOfDay(time.getHours());

      // Special date message
      if (specialDateEntries.length > 0 && index < specialDateEntries.length) {
        messageText = specialDateEntries[index].message;
        messageType = 'special';
      }
      // Weather message (at most once per day)
      else if (settings.features.weatherAware && weather && !weatherSent && Math.random() < 0.5) {
        messageText = weatherMessage(weather);
        messageType = 'weather';
        weatherSent = true;
      }
      // Regular weighted message
      else {
        const result = await buildMessage(timeOfDay, weather, recentIds);
        if (!result) return;
        messageText = result.text;
        messageType = result.type;
        if (result.id) recentIds.push(result.id);
      }

      const timeStr = new Date().toLocaleTimeString();
      console.log(`[${timeStr}] [${messageType}] Sending: "${messageText}"`);

      try {
        // Occasionally attach a photo (20% chance if photos available)
        const currentSettings = loadSettings();
        if (currentSettings.features.photoNotes && Math.random() < 0.2) {
          const photo = getRandomPhoto();
          if (photo) {
            await sendWithPhoto(photo, messageText);
            console.log(`[${timeStr}] Sent with photo!`);
            return;
          }
        }

        await send(messageText);
        console.log(`[${timeStr}] Sent!`);
      } catch (err) {
        console.error(`[${timeStr}] Failed: ${err.message}`);
      }
    }, delay);

    scheduledTimeouts.push(timeout);
    console.log(`  ${index + 1}. ${time.toLocaleTimeString()}`);
  });

  if (times.length === 0) {
    console.log('  (No future time slots today — will start fresh tomorrow)');
  }
}

function clearScheduled() {
  scheduledTimeouts.forEach((t) => clearTimeout(t));
  scheduledTimeouts = [];
}

/**
 * Send a "thinking of you" message immediately.
 */
async function sendThinkingOfYou(customText) {
  const timeOfDay = getTimeOfDay();
  const weather = await getWeather();
  let messageText = customText;

  if (!messageText) {
    const result = await buildMessage(timeOfDay, weather, []);
    messageText = result ? result.text : "Just wanted you to know I'm thinking about you right now 💕";
  }

  console.log(`[Thinking of you] Sending: "${messageText}"`);
  return send(messageText);
}

function start() {
  console.log('=== Auto Love Notes v2.0 ===');
  console.log(`Messages per day: ${config.schedule.minPerDay}–${config.schedule.maxPerDay}`);
  console.log(`Send window: ${config.schedule.earliestHour}:00 – ${config.schedule.latestHour}:00`);

  const settings = loadSettings();
  const enabled = Object.entries(settings.features)
    .filter(([, v]) => v)
    .map(([k]) => k);
  console.log(`Features: ${enabled.join(', ')}`);
  console.log('');

  scheduleDailyMessages();

  dailyCronJob = cron.schedule('0 0 * * *', () => {
    console.log('\n[Scheduler] New day — rescheduling...');
    scheduleDailyMessages();
  });

  console.log('\n[Scheduler] Running. Press Ctrl+C to stop.\n');
}

function stop() {
  clearScheduled();
  if (dailyCronJob) {
    dailyCronJob.stop();
    dailyCronJob = null;
  }
  console.log('[Scheduler] Stopped.');
}

function getScheduledCount() {
  return scheduledTimeouts.length;
}

module.exports = {
  start, stop, scheduleDailyMessages,
  sendThinkingOfYou, getScheduledCount,
  isDND, getTimeOfDay,
};
