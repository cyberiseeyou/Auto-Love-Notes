const { start } = require('./scheduler');
const { startServer } = require('./web/server');
const { ensureDataFiles } = require('./config');

// Initialize data files
ensureDataFiles();

// Start the message scheduler
start();

// Start the web dashboard
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  process.exit(0);
});
