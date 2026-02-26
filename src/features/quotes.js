const { loadQuotes, saveQuotes } = require('../config');

function getRandomQuote() {
  const quotes = loadQuotes();
  if (quotes.length === 0) return null;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  return `"${quote.text}" — ${quote.author}`;
}

function addQuote(text, author) {
  const quotes = loadQuotes();
  quotes.push({ text, author });
  saveQuotes(quotes);
}

function listQuotes() {
  return loadQuotes();
}

module.exports = { getRandomQuote, addQuote, listQuotes };
