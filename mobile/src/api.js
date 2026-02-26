import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SERVER_URL: 'love-notes-server-url',
  PIN: 'love-notes-pin',
};

let serverUrl = '';
let pin = '';

export async function loadConfig() {
  serverUrl = (await AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL)) || '';
  pin = (await AsyncStorage.getItem(STORAGE_KEYS.PIN)) || '';
}

export async function setServerUrl(url) {
  // Normalize: remove trailing slash
  serverUrl = url.replace(/\/+$/, '');
  await AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, serverUrl);
}

export async function setPin(newPin) {
  pin = newPin;
  await AsyncStorage.setItem(STORAGE_KEYS.PIN, pin);
}

export function getServerUrl() {
  return serverUrl;
}

export function isConfigured() {
  return !!serverUrl;
}

async function request(path, options = {}) {
  if (!serverUrl) throw new Error('Server URL not configured');

  const url = `${serverUrl}/api${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(pin ? { 'X-Pin': pin } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    throw new Error('Invalid PIN');
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Status ───────────────────────────────────────────────────────────
export function getStatus() {
  return request('/status');
}

// ── Thinking of You ──────────────────────────────────────────────────
export function sendThinkingOfYou(message = null) {
  return request('/thinking-of-you', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ── DND ──────────────────────────────────────────────────────────────
export function setDND(enabled, hours = null) {
  return request('/dnd', {
    method: 'POST',
    body: JSON.stringify({ enabled, hours }),
  });
}

// ── Features ─────────────────────────────────────────────────────────
export function updateFeatures(features) {
  return request('/features', {
    method: 'POST',
    body: JSON.stringify(features),
  });
}

// ── Messages ─────────────────────────────────────────────────────────
export function getMessages() {
  return request('/messages');
}

export function addMessage(text, category = 'sweet', timeOfDay = 'any') {
  return request('/messages', {
    method: 'POST',
    body: JSON.stringify({ text, category, timeOfDay }),
  });
}

export function deleteMessage(id) {
  return request(`/messages/${id}`, { method: 'DELETE' });
}

// ── Inside Jokes ─────────────────────────────────────────────────────
export function getInsideJokes() {
  return request('/inside-jokes');
}

export function addInsideJoke(text, context = '') {
  return request('/inside-jokes', {
    method: 'POST',
    body: JSON.stringify({ text, context }),
  });
}

export function deleteInsideJoke(index) {
  return request(`/inside-jokes/${index}`, { method: 'DELETE' });
}

// ── Reasons ──────────────────────────────────────────────────────────
export function getReasons() {
  return request('/reasons');
}

export function addReason(text) {
  return request('/reasons', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// ── Compliments ──────────────────────────────────────────────────────
export function getCompliments() {
  return request('/compliments');
}

export function addCompliment(text) {
  return request('/compliments', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// ── Quotes ───────────────────────────────────────────────────────────
export function getQuotes() {
  return request('/quotes');
}

export function addQuote(text, author = 'Unknown') {
  return request('/quotes', {
    method: 'POST',
    body: JSON.stringify({ text, author }),
  });
}

// ── History ──────────────────────────────────────────────────────────
export function getHistory(count = 50) {
  return request(`/history?count=${count}`);
}

// ── Weights ──────────────────────────────────────────────────────────
export function updateWeights(weights) {
  return request('/weights', {
    method: 'POST',
    body: JSON.stringify(weights),
  });
}
