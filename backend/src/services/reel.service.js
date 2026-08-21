const Reel = require('../models/Reel');
const Food = require('../models/Food');
const Like = require('../models/Like');
const Save = require('../models/Save');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

function pageValue(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

async function listReels(query, userId) {
  const page = pageValue(query.page, 1);
  const limit = pageValue(query.limit, 10, 50);
  const filter = {};
  if (query.partner) filter.partner = query.partner;
  const sort = query.sort === 'trending'
    ? { views: -1, likeCount: -1, saveCount: -1, createdAt: -1 }
    : { createdAt: -1 };
  const [records, total] = await Promise.all([
    Reel.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('partner', 'name photo business')
      .populate('food', 'name price image category ratingAvg'),
    Reel.countDocuments(filter)
  ]);
  const ids = records.map((reel) => reel._id);
  const [likes, saves] = userId
    ? await Promise.all([
      Like.find({ user: userId, targetType: 'reel', target: { $in: ids } }).select('target'),
      Save.find({ user: userId, targetType: 'reel', target: { $in: ids } }).select('target')
    ])
    : [[], []];
  const liked = new Set(likes.map((item) => item.target.toString()));
  const saved = new Set(saves.map((item) => item.target.toString()));
  const reels = records.map((reel) => ({
    ...reel.toObject(),
    liked: liked.has(reel._id.toString()),
    saved: saved.has(reel._id.toString())
  }));
  return { reels, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function assertPartnerFood(foodId, partnerId) {
  if (!foodId) return;
  const food = await Food.findOne({ _id: foodId, partner: partnerId });
  if (!food) throw new ApiError(400, 'The linked food must belong to your partner account');
}

async function createReel(partnerId, data, files) {
  const video = files?.video?.[0];
  const thumbnail = files?.thumbnail?.[0];
  if (!video || !video.mimetype.startsWith('video/')) throw new ApiError(400, 'A video file is required');
  if (thumbnail && !thumbnail.mimetype.startsWith('image/')) throw new ApiError(400, 'Thumbnail must be an image');
  await assertPartnerFood(data.foodId, partnerId);
  return Reel.create({
    partner: partnerId,
    food: data.foodId || undefined,
    video: `${env.publicBaseUrl}/uploads/${video.filename}`,
    thumbnail: thumbnail ? `${env.publicBaseUrl}/uploads/${thumbnail.filename}` : undefined,
    caption: data.caption
  });
}

async function updateReel(id, partnerId, data, files) {
  const reel = await Reel.findById(id);
  if (!reel) throw new ApiError(404, 'Reel not found');
  if (reel.partner.toString() !== partnerId.toString()) throw new ApiError(403, 'You do not own this reel');
  const video = files?.video?.[0];
  const thumbnail = files?.thumbnail?.[0];
  if (data.foodId !== undefined) await assertPartnerFood(data.foodId, partnerId);
  const updates = {};
  if (data.caption !== undefined) updates.caption = data.caption;
  if (data.foodId !== undefined) updates.food = data.foodId || null;
  if (video) {
    if (!video.mimetype.startsWith('video/')) throw new ApiError(400, 'Video file is required');
    updates.video = `${env.publicBaseUrl}/uploads/${video.filename}`;
  }
  if (thumbnail) {
    if (!thumbnail.mimetype.startsWith('image/')) throw new ApiError(400, 'Thumbnail must be an image');
    updates.thumbnail = `${env.publicBaseUrl}/uploads/${thumbnail.filename}`;
  }
  return Reel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

async function deleteReel(id, partnerId) {
  const reel = await Reel.findById(id);
  if (!reel) throw new ApiError(404, 'Reel not found');
  if (reel.partner.toString() !== partnerId.toString()) throw new ApiError(403, 'You do not own this reel');
  await Reel.deleteOne({ _id: id });
  return { deleted: true };
}

async function incrementView(id) {
  const reel = await Reel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
  if (!reel) throw new ApiError(404, 'Reel not found');
  return { views: reel.views };
}

module.exports = { listReels, createReel, updateReel, deleteReel, incrementView };
