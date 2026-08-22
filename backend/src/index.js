const app = require('./app');
const env = require('./config/env');
const connectDb = require('./db');
const { restoreSeedAssets } = require('./utils/media');

async function start() {
  await connectDb();
  restoreSeedAssets();
  app.listen(env.port, () => {
    console.log(`FoodSnap API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start FoodSnap API', error);
  process.exitCode = 1;
});
