const User = require('../models/User');
const Food = require('../models/Food');
const Reel = require('../models/Reel');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { publicUser } = require('./auth.service');

async function updateProfile(userId, data, file) {
  const business = {};
  for (const field of ['name', 'description', 'address', 'phone', 'cuisines']) {
    if (data[field] !== undefined) {
      business[field] = field === 'cuisines' && typeof data[field] === 'string'
        ? data[field].split(',').map((cuisine) => cuisine.trim()).filter(Boolean)
        : data[field];
    }
  }
  if (file) business.logo = `${env.publicBaseUrl}/uploads/${file.filename}`;
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'partner' },
    { $set: Object.fromEntries(Object.entries(business).map(([key, value]) => [`business.${key}`, value])) },
    { new: true, runValidators: true }
  );
  if (!user) throw new ApiError(404, 'Partner not found');
  return publicUser(user);
}

async function listPartners(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [partners, total] = await Promise.all([
    User.aggregate([
      { $match: { role: 'partner' } },
      {
        $lookup: {
          from: 'foods',
          localField: '_id',
          foreignField: 'partner',
          as: 'foods'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          photo: 1,
          settings: 1,
          business: 1,
          foodCount: { $size: '$foods' }
        }
      },
      { $sort: { 'business.name': 1, name: 1 } },
      { $skip: skip },
      { $limit: limit }
    ]),
    User.countDocuments({ role: 'partner' })
  ]);
  return { partners, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getPartner(id) {
  const partner = await User.findOne({ _id: id, role: 'partner' });
  if (!partner) throw new ApiError(404, 'Partner not found');
  const [foods, reels] = await Promise.all([
    Food.find({ partner: id }).sort({ createdAt: -1 }),
    Reel.find({ partner: id }).populate('food', 'name price image').sort({ createdAt: -1 })
  ]);
  return { partner: publicUser(partner), foods, reels };
}

module.exports = { updateProfile, listPartners, getPartner };
