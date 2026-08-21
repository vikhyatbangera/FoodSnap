const mongoose = require('mongoose');
const env = require('./config/env');

async function connectDb() {
  await mongoose.connect(env.mongodbUri);
  return mongoose.connection;
}

module.exports = connectDb;
