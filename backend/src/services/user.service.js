const { uploadUrl } = require('../utils/media');
const Save = require('../models/Save');
const Food = require('../models/Food');
const Reel = require('../models/Reel');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { publicUser } = require('./auth.service');

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return publicUser(user);
}

async function updateMe(userId, data, file) {
  const updates = {};
  if (data.name !== undefined) updates.name = data.name;
  if (file) updates.photo = uploadUrl(file.filename);
  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return publicUser(user);
}

async function updateSettings(userId, data) {
  const updates = {};
  if (data.theme !== undefined) updates['settings.theme'] = data.theme;
  if (data.notifications !== undefined) updates['settings.notifications'] = data.notifications;
  const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  return publicUser(user);
}

async function getSaved(userId) {
  const [savedFoodRecords, savedReelRecords] = await Promise.all([
    Save.find({ user: userId, targetType: 'food' }).sort({ createdAt: -1 }).select('target'),
    Save.find({ user: userId, targetType: 'reel' }).sort({ createdAt: -1 }).select('target')
  ]);
  const savedFoods = savedFoodRecords.map((record) => record.target);
  const savedReels = savedReelRecords.map((record) => record.target);
  const [foods, reels] = await Promise.all([
    Food.find({ _id: { $in: savedFoods } }).populate('partner', 'name business photo'),
    Reel.find({ _id: { $in: savedReels } }).populate('partner', 'name business photo').populate('food', 'name price image')
  ]);
  const foodById = new Map(foods.map((food) => [food._id.toString(), food]));
  const reelById = new Map(reels.map((reel) => [reel._id.toString(), reel]));
  return {
    foods: savedFoods.map((id) => foodById.get(id.toString())).filter(Boolean),
    reels: savedReels.map((id) => reelById.get(id.toString())).filter(Boolean)
  };
}

module.exports = { getMe, updateMe, updateSettings, getSaved };
