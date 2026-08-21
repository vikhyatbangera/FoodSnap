const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}

function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || req.user.role !== role) {
      return next(new ApiError(403, 'You do not have permission for this action'));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
