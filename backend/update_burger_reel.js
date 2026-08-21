require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Reel = require('./src/models/Reel');
const Food = require('./src/models/Food');

async function updateReel() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Let's find the classic burger food item first
  const burger = await Food.findOne({ name: { $regex: /Classic Burger/i } });
  
  if (burger) {
    const reel = await Reel.findOne({ food: burger._id });
    if (reel) {
      reel.videoUrl = '/uploads/classic_burger_reel.mp4';
      await reel.save();
      console.log('Successfully updated the Classic Burger reel with the new Pinterest video!');
    } else {
      console.log('Could not find a reel attached to Classic Burger. Let us create one!');
      await Reel.create({
        partner: burger.partner,
        food: burger._id,
        videoUrl: '/uploads/classic_burger_reel.mp4',
        caption: 'The ultimate classic burger!',
        views: 100,
        likes: 50
      });
      console.log('Created a new reel for the Classic Burger!');
    }
  } else {
    // If not found by Food, maybe search by caption
    const fallbackReel = await Reel.findOne({ caption: { $regex: /burger/i } });
    if (fallbackReel) {
      fallbackReel.videoUrl = '/uploads/classic_burger_reel.mp4';
      await fallbackReel.save();
      console.log('Updated a fallback burger reel!');
    } else {
      console.log('Could not find any burger reel or food to update.');
    }
  }
  
  await mongoose.disconnect();
}

updateReel().catch(console.error);
