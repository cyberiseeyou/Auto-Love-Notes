const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DATA_DIR = path.resolve(__dirname, '..', 'data');
const PHOTOS_DIR = path.resolve(__dirname, '..', 'photos');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const SPECIAL_DATES_FILE = path.join(DATA_DIR, 'special-dates.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const INSIDE_JOKES_FILE = path.join(DATA_DIR, 'inside-jokes.json');
const REASONS_FILE = path.join(DATA_DIR, 'reasons.json');
const COMPLIMENTS_FILE = path.join(DATA_DIR, 'compliments.json');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });

  const defaults = {
    [MESSAGES_FILE]: getDefaultMessages,
    [SPECIAL_DATES_FILE]: () => [],
    [HISTORY_FILE]: () => [],
    [SETTINGS_FILE]: getDefaultSettings,
    [INSIDE_JOKES_FILE]: () => [],
    [REASONS_FILE]: getDefaultReasons,
    [COMPLIMENTS_FILE]: getDefaultCompliments,
    [QUOTES_FILE]: getDefaultQuotes,
  };

  for (const [file, defaultFn] of Object.entries(defaults)) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultFn(), null, 2));
    }
  }
}

function getDefaultMessages() {
  return [
    { id: 1, text: "Just thinking about you and smiling 💕", category: "sweet", timeOfDay: "any" },
    { id: 2, text: "You make every day better just by being in it", category: "sweet", timeOfDay: "any" },
    { id: 3, text: "I'm so lucky to have you", category: "sweet", timeOfDay: "any" },
    { id: 4, text: "Can't wait to see you later ❤️", category: "flirty", timeOfDay: "afternoon" },
    { id: 5, text: "You looked amazing today", category: "flirty", timeOfDay: "evening" },
    { id: 6, text: "I love the way you laugh", category: "sweet", timeOfDay: "any" },
    { id: 7, text: "Sending you a virtual hug right now 🤗", category: "cute", timeOfDay: "any" },
    { id: 8, text: "You're my favorite person in the whole world", category: "sweet", timeOfDay: "any" },
    { id: 9, text: "Hope your day is as wonderful as you are", category: "sweet", timeOfDay: "morning" },
    { id: 10, text: "I fall for you a little more every single day", category: "romantic", timeOfDay: "evening" },
    { id: 11, text: "You're the best thing that ever happened to me", category: "romantic", timeOfDay: "any" },
    { id: 12, text: "Just wanted you to know I love you", category: "sweet", timeOfDay: "any" },
    { id: 13, text: "Missing you right now 💭", category: "sweet", timeOfDay: "afternoon" },
    { id: 14, text: "You make my heart so happy", category: "cute", timeOfDay: "any" },
    { id: 15, text: "Thank you for being you 💗", category: "sweet", timeOfDay: "any" },
    { id: 16, text: "I love our life together", category: "romantic", timeOfDay: "evening" },
    { id: 17, text: "You're on my mind... as always", category: "flirty", timeOfDay: "afternoon" },
    { id: 18, text: "No one else could ever compare to you", category: "romantic", timeOfDay: "any" },
    { id: 19, text: "Every moment with you is my favorite moment", category: "romantic", timeOfDay: "any" },
    { id: 20, text: "Good morning beautiful ☀️", category: "morning", timeOfDay: "morning" },
    { id: 21, text: "Rise and shine gorgeous! Hope you slept well 😊", category: "morning", timeOfDay: "morning" },
    { id: 22, text: "Goodnight my love, sweet dreams 🌙", category: "sweet", timeOfDay: "evening" },
    { id: 23, text: "Thinking about you while I eat lunch. Wish you were here", category: "sweet", timeOfDay: "afternoon" },
    { id: 24, text: "You are literally the highlight of every single day", category: "romantic", timeOfDay: "evening" },
  ];
}

function getDefaultReasons() {
  return {
    nextNumber: 1,
    reasons: [
      "the way you scrunch your nose when you laugh",
      "how you always know exactly what to say",
      "the way you light up when you talk about things you love",
      "your kindness to everyone around you",
      "the way you make even boring days feel special",
      "how safe I feel when I'm with you",
      "your smile — it honestly makes everything better",
      "the little things you do to take care of me",
      "how passionate you are about the things you care about",
      "the way you look at me like I'm your whole world",
    ],
  };
}

function getDefaultCompliments() {
  return [
    "You have the most beautiful smile I've ever seen",
    "Your laugh is my favorite sound in the world",
    "You are so incredibly smart",
    "You have the biggest heart of anyone I know",
    "You are the most beautiful person inside and out",
    "Your eyes are absolutely stunning",
    "You have the best sense of humor",
    "You inspire me to be a better person every day",
    "You are so strong and I admire that so much",
    "Everything about you is magnetic",
  ];
}

function getDefaultQuotes() {
  return [
    { text: "In all the world, there is no heart for me like yours.", author: "Maya Angelou" },
    { text: "Whatever our souls are made of, his and mine are the same.", author: "Emily Brontë" },
    { text: "I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love.", author: "Gabriel García Márquez" },
    { text: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.", author: "Dr. Seuss" },
    { text: "I love you not because of who you are, but because of who I am when I am with you.", author: "Roy Croft" },
    { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn" },
    { text: "If I had a flower for every time I thought of you, I could walk through my garden forever.", author: "Alfred Tennyson" },
    { text: "You are my today and all of my tomorrows.", author: "Leo Christopher" },
    { text: "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more.", author: "Angelita Lim" },
    { text: "To love and be loved is to feel the sun from both sides.", author: "David Viscott" },
    { text: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle" },
    { text: "I never want to stop making memories with you.", author: "Pierre Jeanty" },
    { text: "Grow old along with me! The best is yet to be.", author: "Robert Browning" },
    { text: "My heart is and always will be yours.", author: "Jane Austen" },
    { text: "You are the finest, loveliest, tenderest, and most beautiful person I have ever known—and even that is an understatement.", author: "F. Scott Fitzgerald" },
  ];
}

function getDefaultSettings() {
  return {
    dnd: {
      enabled: false,
      until: null,
    },
    features: {
      aiGenerated: true,
      weatherAware: true,
      photoNotes: true,
      quotes: true,
      reasons: true,
      compliments: true,
      insideJokes: true,
    },
    // Weight how often each message type is selected (higher = more frequent)
    weights: {
      custom: 40,
      aiGenerated: 20,
      quote: 10,
      reason: 10,
      compliment: 10,
      insideJoke: 10,
    },
  };
}

// Generic JSON file helpers
function loadJSON(file) {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveJSON(file, data) {
  ensureDataFiles();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Specific loaders/savers
const loadMessages = () => loadJSON(MESSAGES_FILE);
const saveMessages = (d) => saveJSON(MESSAGES_FILE, d);
const loadSpecialDates = () => loadJSON(SPECIAL_DATES_FILE);
const saveSpecialDates = (d) => saveJSON(SPECIAL_DATES_FILE, d);
const loadHistory = () => loadJSON(HISTORY_FILE);
const loadSettings = () => loadJSON(SETTINGS_FILE);
const saveSettings = (d) => saveJSON(SETTINGS_FILE, d);
const loadInsideJokes = () => loadJSON(INSIDE_JOKES_FILE);
const saveInsideJokes = (d) => saveJSON(INSIDE_JOKES_FILE, d);
const loadReasons = () => loadJSON(REASONS_FILE);
const saveReasons = (d) => saveJSON(REASONS_FILE, d);
const loadCompliments = () => loadJSON(COMPLIMENTS_FILE);
const saveCompliments = (d) => saveJSON(COMPLIMENTS_FILE, d);
const loadQuotes = () => loadJSON(QUOTES_FILE);
const saveQuotes = (d) => saveJSON(QUOTES_FILE, d);

function appendHistory(entry) {
  const history = loadHistory();
  history.push({ ...entry, sentAt: new Date().toISOString() });
  const trimmed = history.slice(-1000);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2));
}

const config = {
  facebook: {
    pageAccessToken: process.env.FB_PAGE_ACCESS_TOKEN,
    recipientId: process.env.FB_RECIPIENT_ID,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
    city: process.env.WEATHER_CITY || 'New York',
    units: process.env.WEATHER_UNITS || 'imperial',
  },
  schedule: {
    minPerDay: parseInt(process.env.MIN_MESSAGES_PER_DAY, 10) || 2,
    maxPerDay: parseInt(process.env.MAX_MESSAGES_PER_DAY, 10) || 5,
    earliestHour: parseInt(process.env.EARLIEST_HOUR, 10) || 8,
    latestHour: parseInt(process.env.LATEST_HOUR, 10) || 22,
  },
  dashboard: {
    port: parseInt(process.env.DASHBOARD_PORT, 10) || 3000,
    pin: process.env.DASHBOARD_PIN || '',
  },
  partnerName: process.env.PARTNER_NAME || 'babe',
  yourName: process.env.YOUR_NAME || '',
  anniversaryDate: process.env.ANNIVERSARY_DATE || null,
  paths: {
    messages: MESSAGES_FILE,
    specialDates: SPECIAL_DATES_FILE,
    history: HISTORY_FILE,
    settings: SETTINGS_FILE,
    insideJokes: INSIDE_JOKES_FILE,
    reasons: REASONS_FILE,
    compliments: COMPLIMENTS_FILE,
    quotes: QUOTES_FILE,
    photos: PHOTOS_DIR,
    data: DATA_DIR,
  },
};

module.exports = {
  config,
  ensureDataFiles,
  loadMessages, saveMessages,
  loadSpecialDates, saveSpecialDates,
  loadHistory, appendHistory,
  loadSettings, saveSettings,
  loadInsideJokes, saveInsideJokes,
  loadReasons, saveReasons,
  loadCompliments, saveCompliments,
  loadQuotes, saveQuotes,
};
