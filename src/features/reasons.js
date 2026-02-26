const { loadReasons, saveReasons, config } = require('../config');

/**
 * Get the next "Reason I love you #N" message.
 * Advances the counter each time.
 */
function getNextReason() {
  const data = loadReasons();
  if (data.reasons.length === 0) return null;

  const index = (data.nextNumber - 1) % data.reasons.length;
  const reason = data.reasons[index];
  const number = data.nextNumber;

  data.nextNumber += 1;
  saveReasons(data);

  const name = config.partnerName ? `, ${config.partnerName}` : '';
  return `Reason #${number} I love you${name}: ${reason}`;
}

function addReason(reason) {
  const data = loadReasons();
  data.reasons.push(reason);
  saveReasons(data);
}

function listReasons() {
  return loadReasons();
}

module.exports = { getNextReason, addReason, listReasons };
