const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const SPECIAL_DATES_FILE = path.join(DATA_DIR, 'special-dates.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(getDefaultMessages(), null, 2));
  }

  if (!fs.existsSync(SPECIAL_DATES_FILE)) {
    fs.writeFileSync(SPECIAL_DATES_FILE, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
  }
}

function getDefaultMessages() {
  return [
    { id: 1, text: "Just thinking about you and smiling 💕", category: "sweet" },
    { id: 2, text: "You make every day better just by being in it", category: "sweet" },
    { id: 3, text: "I'm so lucky to have you", category: "sweet" },
    { id: 4, text: "Can't wait to see you later ❤️", category: "flirty" },
    { id: 5, text: "You looked amazing today", category: "flirty" },
    { id: 6, text: "I love the way you laugh", category: "sweet" },
    { id: 7, text: "Sending you a virtual hug right now 🤗", category: "cute" },
    { id: 8, text: "You're my favorite person in the whole world", category: "sweet" },
    { id: 9, text: "Hope your day is as wonderful as you are", category: "sweet" },
    { id: 10, text: "I fall for you a little more every single day", category: "romantic" },
    { id: 11, text: "You're the best thing that ever happened to me", category: "romantic" },
    { id: 12, text: "Just wanted you to know I love you", category: "sweet" },
    { id: 13, text: "Missing you right now 💭", category: "sweet" },
    { id: 14, text: "You make my heart so happy", category: "cute" },
    { id: 15, text: "Thank you for being you 💗", category: "sweet" },
    { id: 16, text: "I love our life together", category: "romantic" },
    { id: 17, text: "You're on my mind... as always", category: "flirty" },
    { id: 18, text: "No one else could ever compare to you", category: "romantic" },
    { id: 19, text: "Every moment with you is my favorite moment", category: "romantic" },
    { id: 20, text: "Good morning beautiful ☀️", category: "morning" }
  ];
}

function loadMessages() {
  ensureDataFiles();
  const raw = fs.readFileSync(MESSAGES_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveMessages(messages) {
  ensureDataFiles();
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

function loadSpecialDates() {
  ensureDataFiles();
  const raw = fs.readFileSync(SPECIAL_DATES_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveSpecialDates(dates) {
  ensureDataFiles();
  fs.writeFileSync(SPECIAL_DATES_FILE, JSON.stringify(dates, null, 2));
}

function loadHistory() {
  ensureDataFiles();
  const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
  return JSON.parse(raw);
}

function appendHistory(entry) {
  const history = loadHistory();
  history.push({ ...entry, sentAt: new Date().toISOString() });
  // Keep last 500 entries
  const trimmed = history.slice(-500);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
}

const config = {
  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    recipientNumber: process.env.RECIPIENT_PHONE_NUMBER,
  },

  // Facebook Messenger
  facebook: {
    pageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN,
    recipientId: process.env.FB_RECIPIENT_ID,
  },

  // Scheduling
  schedule: {
    minPerDay: parseInt(process.env.MIN_MESSAGES_PER_DAY, 10) || 1,
    maxPerDay: parseInt(process.env.MAX_MESSAGES_PER_DAY, 10) || 5,
    earliestHour: parseInt(process.env.EARLIEST_HOUR, 10) || 8,
    latestHour: parseInt(process.env.LATEST_HOUR, 10) || 22,
  },

  // Channel: "sms", "messenger", or "both"
  channel: (process.env.CHANNEL || 'sms').toLowerCase(),

  // File paths
  paths: {
    messages: MESSAGES_FILE,
    specialDates: SPECIAL_DATES_FILE,
    history: HISTORY_FILE,
  },
};

module.exports = {
  config,
  loadMessages,
  saveMessages,
  loadSpecialDates,
  saveSpecialDates,
  loadHistory,
  appendHistory,
  ensureDataFiles,
};
