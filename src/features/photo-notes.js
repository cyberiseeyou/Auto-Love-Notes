const fs = require('fs');
const path = require('path');
const { config } = require('../config');

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Get a random photo path from the photos directory.
 */
function getRandomPhoto() {
  const photosDir = config.paths.photos;

  if (!fs.existsSync(photosDir)) return null;

  const files = fs.readdirSync(photosDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  });

  if (files.length === 0) return null;

  const file = files[Math.floor(Math.random() * files.length)];
  return path.join(photosDir, file);
}

/**
 * List all available photos.
 */
function listPhotos() {
  const photosDir = config.paths.photos;
  if (!fs.existsSync(photosDir)) return [];

  return fs.readdirSync(photosDir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(ext);
  });
}

module.exports = { getRandomPhoto, listPhotos };
