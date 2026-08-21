const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Reel = require('./src/models/Reel');
const Food = require('./src/models/Food');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const url = 'https://pin.it/6VrhsJh58';
  const file = 'margherita_pizza.mp4';
  const query = 'Margherita Pizza';
  
  const outputPath = `uploads/${file}`;
  console.log(`Downloading ${url} to ${outputPath}...`);
  try {
    execSync(`python -m yt_dlp "${url}" -o "${outputPath}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to download`);
    return process.exit(1);
  }

  // 2. Update DB
  const food = await Food.findOne({ name: { $regex: new RegExp(query, 'i') } });
  if (!food) {
    console.log(`Could not find food item for ${query}`);
    return process.exit(1);
  }

  let reel = await Reel.findOne({ food: food._id });
  if (reel) {
    reel.videoUrl = `/${outputPath}`;
    await reel.save();
    console.log(`Updated existing reel for ${food.name}`);
  } else {
    await Reel.create({
      partner: food.partner,
      food: food._id,
      videoUrl: `/${outputPath}`,
      caption: `Wood fired to perfection!`,
      views: Math.floor(Math.random() * 500) + 100,
      likes: Math.floor(Math.random() * 100) + 20
    });
    console.log(`Created new reel for ${food.name}`);
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(console.error);
