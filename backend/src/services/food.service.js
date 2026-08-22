const Food = require('../models/Food');
const Reel = require('../models/Reel');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');
const { uploadUrl } = require('../utils/media');

function pageValue(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

function parseTags(value) {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value.split(',').map((tag) => tag.trim()).filter(Boolean);
  } catch (error) {
    void error;
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
}

function buildFilter(query) {
  const filter = {};
  if (query.category) filter.category = query.category;
  if (query.partner) filter.partner = query.partner;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.minRating !== undefined) filter.ratingAvg = { $gte: Number(query.minRating) };
  return filter;
}

function sortFor(sort) {
  return {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { ratingAvg: -1, ratingCount: -1 },
    popular: { likeCount: -1, saveCount: -1, orderCount: -1 },
    trending: { likeCount: -1, saveCount: -1, orderCount: -1, createdAt: -1 }
  }[sort] || { createdAt: -1 };
}

async function listFoods(query) {
  const page = pageValue(query.page, 1);
  const limit = pageValue(query.limit, 20, 100);
  const skip = (page - 1) * limit;
  const baseFilter = buildFilter(query);
  let filter = { ...baseFilter };
  let foods;
  let total;

  if (query.q) {
    const textFilter = { ...baseFilter, $text: { $search: query.q } };
    [foods, total] = await Promise.all([
      Food.find(textFilter).populate('partner', 'name business photo').sort(sortFor(query.sort)).skip(skip).limit(limit),
      Food.countDocuments(textFilter)
    ]);
    if (!total) {
      const regex = new RegExp(query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter = { ...baseFilter, $or: [{ name: regex }, { description: regex }, { tags: regex }] };
      [foods, total] = await Promise.all([
        Food.find(filter).populate('partner', 'name business photo').sort(sortFor(query.sort)).skip(skip).limit(limit),
        Food.countDocuments(filter)
      ]);
    }
  } else {
    [foods, total] = await Promise.all([
      Food.find(filter).populate('partner', 'name business photo').sort(sortFor(query.sort)).skip(skip).limit(limit),
      Food.countDocuments(filter)
    ]);
  }
  return { foods, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getFood(id) {
  const food = await Food.findById(id).populate('partner', 'name email role photo business');
  if (!food) throw new ApiError(404, 'Food not found');
  const [reels, reviewSummary, latestReviews] = await Promise.all([
    Reel.find({ food: id }).sort({ createdAt: -1 }),
    Review.aggregate([
      { $match: { food: food._id } },
      { $group: { _id: '$food', ratingAvg: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
    ]),
    Review.find({ food: id }).sort({ createdAt: -1 }).limit(3).populate('customer', 'name photo')
  ]);
  return {
    food,
    partner: food.partner,
    reels,
    reviewSummary: {
      ratingAvg: reviewSummary[0]?.ratingAvg || 0,
      ratingCount: reviewSummary[0]?.ratingCount || 0,
      latest: latestReviews
    }
  };
}

async function assertOwner(id, userId) {
  const food = await Food.findById(id);
  if (!food) throw new ApiError(404, 'Food not found');
  if (food.partner.toString() !== userId.toString()) throw new ApiError(403, 'You do not own this food listing');
  return food;
}

async function createFood(userId, data, file) {
  const food = await Food.create({
    partner: userId,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    tags: parseTags(data.tags),
    isAvailable: data.isAvailable === undefined ? true : data.isAvailable,
    image: file ? uploadUrl(file.filename) : data.image
  });
  return food;
}

async function updateFood(id, userId, data, file) {
  await assertOwner(id, userId);
  const updates = {};
  for (const field of ['name', 'description', 'price', 'category', 'isAvailable']) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  const tags = parseTags(data.tags);
  if (tags !== undefined) updates.tags = tags;
  if (file) updates.image = uploadUrl(file.filename);
  return Food.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
}

async function deleteFood(id, userId) {
  await assertOwner(id, userId);
  await Food.deleteOne({ _id: id });
  return { deleted: true };
}

async function listReviews(foodId, query) {
  const food = await Food.exists({ _id: foodId });
  if (!food) throw new ApiError(404, 'Food not found');
  const page = pageValue(query.page, 1);
  const limit = pageValue(query.limit, 20, 100);
  const filter = { food: foodId };
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('customer', 'name photo'),
    Review.countDocuments(filter)
  ]);
  return { reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

module.exports = { listFoods, getFood, createFood, updateFood, deleteFood, listReviews };
