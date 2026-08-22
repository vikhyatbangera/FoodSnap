const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const partnerRoutes = require('./routes/partner.routes');
const foodRoutes = require('./routes/food.routes');
const reelRoutes = require('./routes/reel.routes');
const interactionRoutes = require('./routes/interaction.routes');
const searchRoutes = require('./routes/search.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const chatRoutes = require('./routes/chat.routes');
const ApiError = require('./utils/ApiError');

const app = express();

const allowedOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  const normalized = origin.replace(/\/$/, '');
  const allowed =
    env.clientOrigins.includes(normalized) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalized);
  return allowed ? callback(null, true) : callback(new ApiError(403, `Origin ${origin} is not allowed`));
};

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api', interactionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res, next) => next(new ApiError(404, 'Route not found')));

app.use((error, req, res, next) => {
  void next;
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with those values already exists';
  } else if (error instanceof multer.MulterError) {
    statusCode = 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large' : 'Invalid uploaded file';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier';
  }

  const payload = { error: { message } };
  if (details) payload.error.details = details;
  if (env.nodeEnv !== 'production' && statusCode === 500) payload.error.stack = error.stack;
  res.status(statusCode).json(payload);
});

module.exports = app;
