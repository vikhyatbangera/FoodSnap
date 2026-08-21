const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Reel = require('./src/models/Reel');
const Food = require('./src/models/Food');

const tasks = [
  { name: 'California Roll', query: 'California Roll', url: 'https://pin.it/xL23fbhrU', file: 'california_roll.mp4' },
  { name: 'Crispy Chicken Burger', query: 'Crispy Chicken Burger', url: 'https://pin.it/WXsXAtady', file: 'crispy_chicken_burger.mp4' },
  { name: 'Roasted Veggie Buddha Bowl', query: 'Roasted Veggie Buddha', url: 'https://pin.it/18Vd1gVNL', file: 'buddha_bowl.mp4' },
  { name: 'Spicy Tuna Roll', query: 'Spicy Tuna', url: 'https://pin.it/6jqU9x1jm', file: 'spicy_tuna.mp4' },
  { name: 'Citrus Kale Quinoa Salad', query: 'Citrus Kale', url: 'https://pin.it/2NY2lNpGh', file: 'kale_salad.mp4' },
  { name: 'Truffle Mushroom Tagliatelle', query: 'Truffle Mushroom', url: 'https://pin.it/4PWBf2OwI', file: 'tagliatelle.mp4' },
  { name: 'Chicken Tikka Masala', query: 'Chicken Tikka', url: 'https://pin.it/7udJwxOW7', file: 'tikka_masala.mp4' },
  { name: 'Chicken Hyderabadi Biryani', query: 'Hyderabadi', url: 'https://pin.it/3a4HScecj', file: 'biryani.mp4' }
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  for (const task of tasks) {
    console.log(`\n--- Processing ${task.name} ---`);
    
    // 1. Download video
    const outputPath = `uploads/${task.file}`;
    console.log(`Downloading ${task.url} to ${outputPath}...`);
    try {
      execSync(`python -m yt_dlp "${task.url}" -o "${outputPath}"`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to download ${task.name}`);
      continue;
    }

    // 2. Update DB
    const food = await Food.findOne({ name: { $regex: new RegExp(task.query, 'i') } });
    if (!food) {
      console.log(`Could not find food item for ${task.name} (query: ${task.query})`);
      continue;
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
        caption: `Delicious ${food.name}!`,
        views: Math.floor(Math.random() * 500) + 100,
        likes: Math.floor(Math.random() * 100) + 20
      });
      console.log(`Created new reel for ${food.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

run().catch(console.error);
