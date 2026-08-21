const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

function publicUser(user) {
  const result = user.toObject ? user.toObject() : { ...user };
  delete result.passwordHash;
  return result;
}

async function register(data) {
  const role = data.role || 'customer';
  const user = new User({
    name: data.name,
    email: data.email,
    passwordHash: await bcrypt.hash(data.password, 10),
    role,
    business: role === 'partner' ? data.business : undefined
  });
  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, 'An account with that email already exists');
    }
    throw error;
  }
  return publicUser(user);
}

async function login(email, password) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
  return { token, user: publicUser(user) };
}

module.exports = { register, login, publicUser };
