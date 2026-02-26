const express = require('express');
const path = require('path');
const multer = require('multer');
const { config, ensureDataFiles } = require('../config');
const routes = require('./routes');

function createServer() {
  ensureDataFiles();

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files (dashboard frontend)
  app.use(express.static(path.join(__dirname, 'public')));

  // Optional PIN protection
  if (config.dashboard.pin) {
    app.use('/api', (req, res, next) => {
      const pin = req.headers['x-pin'] || req.query.pin;
      if (pin !== config.dashboard.pin) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
      next();
    });
  }

  // Photo upload handling
  const storage = multer.diskStorage({
    destination: config.paths.photos,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `photo-${Date.now()}${ext}`);
    },
  });
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, allowed.includes(ext));
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });
  app.locals.upload = upload;

  // API routes
  app.use('/api', routes);

  // Fallback to dashboard
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  return app;
}

function startServer() {
  const app = createServer();
  const port = config.dashboard.port;

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Dashboard] Running at http://localhost:${port}`);
  });

  return app;
}

module.exports = { createServer, startServer };
