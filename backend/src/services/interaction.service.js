const Food = require('../models/Food');
const Reel = require('../models/Reel');
const Like = require('../models/Like');
const Save = require('../models/Save');
const ApiError = require('../utils/ApiError');

const targetModels = { food: Food, reel: Reel };

async function toggle(model, activeKey, counter, userId, targetType, targetId) {
  const Target = targetModels[targetType];
  if (!Target) throw new ApiError(400, 'targetType must be food or reel');
  const target = await Target.findById(targetId);
  if (!target) throw new ApiError(404, `${targetType} not found`);
  const existing = await model.findOne({ user: userId, targetType, target: targetId });
  let active;
  if (existing) {
    await model.deleteOne({ _id: existing._id });
    active = false;
    await Target.updateOne({ _id: targetId, [counter]: { $gt: 0 } }, { $inc: { [counter]: -1 } });
  } else {
    let created = false;
    try {
      await model.create({ user: userId, targetType, target: targetId });
      created = true;
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    active = true;
    if (created) await Target.updateOne({ _id: targetId }, { $inc: { [counter]: 1 } });
  }
  const updated = await Target.findById(targetId).select(counter);
  return { [activeKey]: active, [counter]: updated[counter] };
}

async function toggleLike(userId, targetType, targetId) {
  const result = await toggle(Like, 'liked', 'likeCount', userId, targetType, targetId);
  return { liked: result.liked, likeCount: result.likeCount };
}

async function toggleSave(userId, targetType, targetId) {
  const result = await toggle(Save, 'saved', 'saveCount', userId, targetType, targetId);
  return { saved: result.saved, saveCount: result.saveCount };
}

module.exports = { toggleLike, toggleSave };
