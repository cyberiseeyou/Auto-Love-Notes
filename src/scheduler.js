const cron = require('node-cron');
const { config, loadMessages, loadSpecialDates } = require('./config');
const { send } = require('./senders');

let scheduledTimeouts = [];
let dailyCronJob = null;

/**
 * Pick a random integer between min and max (inclusive).
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random message, avoiding recent repeats when possible.
 */
function pickMessage(messages, recentIds = []) {
  if (messages.length === 0) return null;

  // Try to pick one we haven't sent recently
  const unsent = messages.filter((m) => !recentIds.includes(m.id));
  const pool = unsent.length > 0 ? unsent : messages;

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Check if today is a special date and return bonus messages if so.
 */
function getSpecialDateMessages() {
  const specialDates = loadSpecialDates();
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  return specialDates.filter((sd) => sd.month === month && sd.day === day);
}

/**
 * Generate random send times for the day within the configured window.
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

    // Only schedule future times
    if (sendTime > now) {
      times.push(sendTime);
    }
  }

  // Sort chronologically
  times.sort((a, b) => a - b);
  return times;
}

/**
 * Schedule all messages for today.
 */
function scheduleDailyMessages() {
  // Clear any existing scheduled sends
  clearScheduled();

  const messages = loadMessages();
  if (messages.length === 0) {
    console.log('[Scheduler] No messages configured. Add some first!');
    return;
  }

  const { minPerDay, maxPerDay } = config.schedule;
  let count = randomInt(minPerDay, maxPerDay);

  // Check for special dates — send extra messages
  const specialDateEntries = getSpecialDateMessages();
  if (specialDateEntries.length > 0) {
    console.log(`[Scheduler] Special date today! Adding bonus messages.`);
    count += specialDateEntries.length;
  }

  const times = generateSendTimes(count);
  const recentIds = [];

  console.log(`[Scheduler] Scheduling ${times.length} messages for today:`);

  times.forEach((time, index) => {
    const delay = time.getTime() - Date.now();
    if (delay <= 0) return;

    const timeout = setTimeout(async () => {
      let messageText;

      // Use special date message if available
      if (specialDateEntries.length > 0 && index < specialDateEntries.length) {
        messageText = specialDateEntries[index].message;
      } else {
        const picked = pickMessage(messages, recentIds);
        if (!picked) return;
        recentIds.push(picked.id);
        messageText = picked.text;
      }

      const timeStr = new Date().toLocaleTimeString();
      console.log(`[${timeStr}] Sending: "${messageText}"`);

      try {
        await send(messageText);
        console.log(`[${timeStr}] Sent successfully!`);
      } catch (err) {
        console.error(`[${timeStr}] Failed: ${err.message}`);
      }
    }, delay);

    scheduledTimeouts.push(timeout);

    const timeStr = time.toLocaleTimeString();
    console.log(`  ${index + 1}. ${timeStr}`);
  });

  if (times.length === 0) {
    console.log('  (No future time slots available today — will start fresh tomorrow)');
  }
}

/**
 * Clear all scheduled timeouts.
 */
function clearScheduled() {
  scheduledTimeouts.forEach((t) => clearTimeout(t));
  scheduledTimeouts = [];
}

/**
 * Start the scheduler — schedules today's messages and sets up
 * a daily cron job to reschedule each morning.
 */
function start() {
  console.log('=== Auto Love Notes — Scheduler Started ===');
  console.log(`Channel: ${config.channel}`);
  console.log(`Messages per day: ${config.schedule.minPerDay}–${config.schedule.maxPerDay}`);
  console.log(`Send window: ${config.schedule.earliestHour}:00 – ${config.schedule.latestHour}:00`);
  console.log('');

  // Schedule today's messages right away
  scheduleDailyMessages();

  // Reschedule every day at midnight
  dailyCronJob = cron.schedule('0 0 * * *', () => {
    console.log('\n[Scheduler] New day — rescheduling messages...');
    scheduleDailyMessages();
  });

  console.log('\n[Scheduler] Running. Press Ctrl+C to stop.\n');
}

/**
 * Stop the scheduler.
 */
function stop() {
  clearScheduled();
  if (dailyCronJob) {
    dailyCronJob.stop();
    dailyCronJob = null;
  }
  console.log('[Scheduler] Stopped.');
}

module.exports = { start, stop, scheduleDailyMessages, pickMessage, generateSendTimes };
