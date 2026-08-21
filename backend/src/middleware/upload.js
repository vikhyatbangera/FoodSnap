const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');

fs.mkdirSync(env.uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: env.uploadsDir,
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, safeName);
  }
});

function mediaFilter(req, file, callback) {
  const isImage = file.mimetype.startsWith('image/');
  const isVideo = file.mimetype.startsWith('video/');
  if (!isImage && !isVideo) {
    return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  }
  return callback(null, true);
}

const mediaUpload = multer({
  storage,
  fileFilter: mediaFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

const imageUpload = multer({
  storage,
  fileFilter(req, file, callback) {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
    return callback(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = { imageUpload, mediaUpload };
