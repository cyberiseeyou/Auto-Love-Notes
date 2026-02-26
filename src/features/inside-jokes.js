const { loadInsideJokes, saveInsideJokes } = require('../config');

function getRandomJoke() {
  const jokes = loadInsideJokes();
  if (jokes.length === 0) return null;
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return joke.text;
}

function addJoke(text, context) {
  const jokes = loadInsideJokes();
  jokes.push({ text, context: context || '', addedAt: new Date().toISOString() });
  saveInsideJokes(jokes);
}

function removeJoke(index) {
  const jokes = loadInsideJokes();
  if (index < 0 || index >= jokes.length) return false;
  jokes.splice(index, 1);
  saveInsideJokes(jokes);
  return true;
}

function listJokes() {
  return loadInsideJokes();
}

module.exports = { getRandomJoke, addJoke, removeJoke, listJokes };
