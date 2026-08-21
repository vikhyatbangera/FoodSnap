const Food = require('../models/Food');
const Reel = require('../models/Reel');
const User = require('../models/User');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function queryWithFallback(Model, searchTerm, textFilter, regexFilter, populate) {
  let records = await Model.find({ ...textFilter, $text: { $search: searchTerm } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .populate(populate || []);
  if (!records.length) {
    records = await Model.find(regexFilter).sort({ createdAt: -1 }).limit(20).populate(populate || []);
  }
  return records;
}

async function search(query) {
  const q = String(query.q || '').trim();
  if (!q) return { foods: [], reels: [], partners: [] };
  const type = query.type || 'all';
  const regex = new RegExp(escapeRegex(q), 'i');
  const foods = type === 'all' || type === 'foods'
    ? await queryWithFallback(
      Food,
      q,
      {},
      { $or: [{ name: regex }, { description: regex }, { tags: regex }] },
      { path: 'partner', select: 'name business photo' }
    )
    : [];
  const reels = type === 'all' || type === 'reels'
    ? await queryWithFallback(
      Reel,
      q,
      {},
      { $or: [{ caption: regex }] },
      [
        { path: 'partner', select: 'name business photo' },
        { path: 'food', select: 'name price image' }
      ]
    )
    : [];
  const partners = type === 'all' || type === 'partners'
    ? await queryWithFallback(
      User,
      q,
      { role: 'partner' },
      { role: 'partner', $or: [{ name: regex }, { 'business.name': regex }, { 'business.description': regex }] },
      []
    )
    : [];
  return { foods, reels, partners };
}

module.exports = { search };
