const app = require('./app');
const env = require('./config/env');
const connectDb = require('./db');

async function start() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`FoodSnap API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start FoodSnap API', error);
  process.exitCode = 1;
});
