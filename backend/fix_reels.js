require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Reel = require('./src/models/Reel');
const Food = require('./src/models/Food');

const mappings = {
  'California Roll': '/uploads/california_roll.mp4',
  'Crispy Chicken Burger': '/uploads/crispy_chicken_burger.mp4',
  'Roasted Veggie Buddha': '/uploads/buddha_bowl.mp4',
  'Spicy Tuna': '/uploads/spicy_tuna.mp4',
  'Citrus Kale': '/uploads/kale_salad.mp4',
  'Truffle Mushroom': '/uploads/tagliatelle.mp4',
  'Chicken Tikka': '/uploads/tikka_masala.mp4',
  'Hyderabadi': '/uploads/biryani.mp4',
  'Margherita Pizza': '/uploads/margherita_pizza.mp4',
  'Classic Burger': '/uploads/classic_burger_reel.mp4'
};

async function fixReels() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  for (const [query, videoPath] of Object.entries(mappings)) {
    const food = await Food.findOne({ name: { $regex: new RegExp(query, 'i') } });
    if (!food) {
      console.log(`Could not find food for ${query}`);
      continue;
    }
    const reel = await Reel.findOne({ food: food._id });
    if (reel) {
      reel.video = videoPath;
      await reel.save();
      console.log(`Updated video for ${food.name}`);
    } else {
      console.log(`Could not find reel for ${food.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done!');
}

fixReels().catch(console.error);
