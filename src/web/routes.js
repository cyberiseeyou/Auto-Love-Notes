const express = require('express');
const router = express.Router();
const {
  config,
  loadMessages, saveMessages,
  loadHistory,
  loadSettings, saveSettings,
  loadInsideJokes, saveInsideJokes,
  loadReasons, saveReasons,
  loadCompliments, saveCompliments,
  loadQuotes, saveQuotes,
  loadSpecialDates, saveSpecialDates,
} = require('../config');
const { isConfigured } = require('../senders');
const { listPhotos } = require('../features/photo-notes');

// Lazy-load scheduler to avoid circular deps
let scheduler = null;
function getScheduler() {
  if (!scheduler) scheduler = require('../scheduler');
  return scheduler;
}

// ── Status ───────────────────────────────────────────────────────────
router.get('/status', (req, res) => {
  const settings = loadSettings();
  const history = loadHistory();
  const messages = loadMessages();
  const photos = listPhotos();
  const s = getScheduler();

  let daysTogether = null;
  if (config.anniversaryDate) {
    daysTogether = Math.floor((Date.now() - new Date(config.anniversaryDate).getTime()) / 86400000);
  }

  res.json({
    messengerConfigured: isConfigured(),
    scheduledCount: s.getScheduledCount(),
    dnd: settings.dnd,
    features: settings.features,
    weights: settings.weights,
    schedule: config.schedule,
    totalMessages: messages.length,
    totalSent: history.length,
    totalPhotos: photos.length,
    daysTogether,
    partnerName: config.partnerName,
  });
});

// ── Thinking of You (quick send) ────────────────────────────────────
router.post('/thinking-of-you', async (req, res) => {
  try {
    const s = getScheduler();
    const result = await s.sendThinkingOfYou(req.body.message || null);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DND ──────────────────────────────────────────────────────────────
router.post('/dnd', (req, res) => {
  const settings = loadSettings();
  const { enabled, hours } = req.body;

  settings.dnd.enabled = !!enabled;
  if (enabled && hours) {
    settings.dnd.until = new Date(Date.now() + hours * 3600000).toISOString();
  } else if (!enabled) {
    settings.dnd.until = null;
  }

  saveSettings(settings);
  res.json({ success: true, dnd: settings.dnd });
});

// ── Features toggle ──────────────────────────────────────────────────
router.post('/features', (req, res) => {
  const settings = loadSettings();
  Object.assign(settings.features, req.body);
  saveSettings(settings);
  res.json({ success: true, features: settings.features });
});

// ── Weights ──────────────────────────────────────────────────────────
router.post('/weights', (req, res) => {
  const settings = loadSettings();
  Object.assign(settings.weights, req.body);
  saveSettings(settings);
  res.json({ success: true, weights: settings.weights });
});

// ── Messages CRUD ────────────────────────────────────────────────────
router.get('/messages', (req, res) => {
  res.json(loadMessages());
});

router.post('/messages', (req, res) => {
  const messages = loadMessages();
  const maxId = messages.reduce((max, m) => Math.max(max, m.id), 0);
  const msg = {
    id: maxId + 1,
    text: req.body.text,
    category: req.body.category || 'sweet',
    timeOfDay: req.body.timeOfDay || 'any',
  };
  messages.push(msg);
  saveMessages(messages);
  res.json({ success: true, message: msg });
});

router.delete('/messages/:id', (req, res) => {
  const messages = loadMessages();
  const id = parseInt(req.params.id, 10);
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  messages.splice(index, 1);
  saveMessages(messages);
  res.json({ success: true });
});

// ── Inside Jokes ─────────────────────────────────────────────────────
router.get('/inside-jokes', (req, res) => {
  res.json(loadInsideJokes());
});

router.post('/inside-jokes', (req, res) => {
  const jokes = loadInsideJokes();
  jokes.push({ text: req.body.text, context: req.body.context || '', addedAt: new Date().toISOString() });
  saveInsideJokes(jokes);
  res.json({ success: true });
});

router.delete('/inside-jokes/:index', (req, res) => {
  const jokes = loadInsideJokes();
  const idx = parseInt(req.params.index, 10);
  if (idx < 0 || idx >= jokes.length) return res.status(404).json({ error: 'Not found' });
  jokes.splice(idx, 1);
  saveInsideJokes(jokes);
  res.json({ success: true });
});

// ── Reasons ──────────────────────────────────────────────────────────
router.get('/reasons', (req, res) => {
  res.json(loadReasons());
});

router.post('/reasons', (req, res) => {
  const data = loadReasons();
  data.reasons.push(req.body.text);
  saveReasons(data);
  res.json({ success: true });
});

// ── Compliments ──────────────────────────────────────────────────────
router.get('/compliments', (req, res) => {
  res.json(loadCompliments());
});

router.post('/compliments', (req, res) => {
  const data = loadCompliments();
  data.push(req.body.text);
  saveCompliments(data);
  res.json({ success: true });
});

// ── Quotes ───────────────────────────────────────────────────────────
router.get('/quotes', (req, res) => {
  res.json(loadQuotes());
});

router.post('/quotes', (req, res) => {
  const data = loadQuotes();
  data.push({ text: req.body.text, author: req.body.author || 'Unknown' });
  saveQuotes(data);
  res.json({ success: true });
});

// ── Special Dates ────────────────────────────────────────────────────
router.get('/special-dates', (req, res) => {
  res.json(loadSpecialDates());
});

router.post('/special-dates', (req, res) => {
  const data = loadSpecialDates();
  data.push({
    month: parseInt(req.body.month, 10),
    day: parseInt(req.body.day, 10),
    message: req.body.message,
    name: req.body.name || 'Special Day',
  });
  saveSpecialDates(data);
  res.json({ success: true });
});

// ── History ──────────────────────────────────────────────────────────
router.get('/history', (req, res) => {
  const history = loadHistory();
  const count = parseInt(req.query.count, 10) || 50;
  res.json(history.slice(-count).reverse());
});

// ── Photos ───────────────────────────────────────────────────────────
router.get('/photos', (req, res) => {
  res.json(listPhotos());
});

router.post('/photos', (req, res) => {
  const upload = req.app.locals.upload;
  upload.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ success: true, filename: req.file.filename });
  });
});

// ── Push Token Registration (Expo) ───────────────────────────────────
router.post('/push-token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const settings = loadSettings();
  if (!settings.pushTokens) settings.pushTokens = [];
  if (!settings.pushTokens.includes(token)) {
    settings.pushTokens.push(token);
    saveSettings(settings);
  }
  res.json({ success: true });
});

module.exports = router;
