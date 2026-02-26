const { loadCompliments, saveCompliments, loadMessages } = require('../config');

/**
 * Get a random compliment paired with a random love note.
 */
function getComplimentCombo() {
  const compliments = loadCompliments();
  if (compliments.length === 0) return null;

  const messages = loadMessages();
  const compliment = compliments[Math.floor(Math.random() * compliments.length)];

  // Pair with a short love note
  const sweetMessages = messages.filter((m) => m.category === 'sweet' || m.category === 'romantic');
  if (sweetMessages.length > 0) {
    const note = sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
    return `${compliment}. ${note.text}`;
  }

  return compliment;
}

function addCompliment(text) {
  const compliments = loadCompliments();
  compliments.push(text);
  saveCompliments(compliments);
}

function listCompliments() {
  return loadCompliments();
}

module.exports = { getComplimentCombo, addCompliment, listCompliments };
