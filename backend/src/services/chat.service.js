const Food = require('../models/Food');
const Reel = require('../models/Reel');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Like = require('../models/Like');
const Save = require('../models/Save');
const env = require('../config/env');
const analyticsService = require('./analytics.service');

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function supported(role) {
  return role === 'partner'
    ? 'You can ask about revenue, sales summary, best listings, trending products, engagement, or review summary.'
    : 'You can ask about best rated foods, trending foods, popular reels, cheap food under a price, recommendations, or my orders.';
}

async function customerData(userId, intent, message) {
  if (intent === 'best_rated') {
    return Food.find({ ratingCount: { $gte: 1 } }).sort({ ratingAvg: -1, ratingCount: -1 }).limit(5).select('name price ratingAvg ratingCount');
  }
  if (intent === 'popular_reels') return Reel.find().sort({ views: -1 }).limit(5).populate('food', 'name').select('caption views food');
  if (intent === 'cheap_under_price') {
    const match = message.match(/(?:under|below|less than|up to)\s*\$?\s*(\d+(?:\.\d+)?)/i);
    const price = match ? Number(match[1]) : 15;
    return { price, foods: await Food.find({ price: { $lte: price }, ratingCount: { $gte: 1 } }).sort({ ratingAvg: -1 }).limit(5).select('name price ratingAvg') };
  }
  if (intent === 'my_orders') return Order.find({ customer: userId }).sort({ createdAt: -1 }).limit(5).populate('partner', 'business name').select('status total createdAt partner');
  if (intent === 'recommend') {
    const [liked, saved] = await Promise.all([
      Like.find({ user: userId, targetType: 'food' }).select('target'),
      Save.find({ user: userId, targetType: 'food' }).select('target')
    ]);
    const ids = [...liked, ...saved].map((item) => item.target);
    const preferences = ids.length ? await Food.find({ _id: { $in: ids } }).distinct('category') : [];
    return Food.find(preferences.length ? { category: { $in: preferences }, ratingCount: { $gte: 1 } } : { ratingCount: { $gte: 1 } })
      .sort({ ratingAvg: -1, ratingCount: -1 }).limit(5).select('name price category ratingAvg');
  }
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return Food.aggregate([
    { $match: { ratingCount: { $gte: 1 } } },
    { $lookup: { from: 'orders', let: { foodId: '$_id' }, pipeline: [{ $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' }, $expr: { $in: ['$$foodId', '$items.food'] } } }, { $count: 'orders' }], as: 'recentOrders' } },
    { $addFields: { trendingScore: { $add: ['$likeCount', '$saveCount', { $ifNull: [{ $arrayElemAt: ['$recentOrders.orders', 0] }, 0] }] } } },
    { $sort: { trendingScore: -1 } },
    { $limit: 5 },
    { $project: { name: 1, price: 1, ratingAvg: 1, trendingScore: 1 } }
  ]);
}

async function partnerData(userId, intent) {
  const overview = await analyticsService.getOverview(userId, 30);
  if (intent === 'revenue') return overview.totals;
  if (intent === 'sales_summary') return { totals: overview.totals, ordersByStatus: overview.ordersByStatus };
  if (intent === 'best_listings') return overview.topFoods.byRevenue;
  if (intent === 'trending_products') return overview.trendingFoods;
  if (intent === 'engagement') return { likes: overview.totals.likes, saves: overview.totals.saves, reelViews: overview.totals.reelViews };
  return Review.find({ partner: userId }).sort({ createdAt: -1 }).limit(5).populate('customer', 'name').select('rating comment customer createdAt').then(async (latest) => ({
    reviewCount: overview.totals.reviewCount,
    ratingAvg: overview.totals.ratingAvg,
    latest
  }));
}

function detectIntent(message, role) {
  const text = message.toLowerCase();
  if (role === 'partner') {
    if (/review/.test(text)) return 'review_summary';
    if (/engagement|likes?|saves?|views?/.test(text)) return 'engagement';
    if (/trend/.test(text)) return 'trending_products';
    if (/best|top|listing/.test(text)) return 'best_listings';
    if (/sales|orders?|aov|average order/.test(text)) return 'sales_summary';
    if (/revenue|earning|income/.test(text)) return 'revenue';
    return 'fallback';
  }
  if (/order/.test(text)) return 'my_orders';
  if (/cheap|under|below|less than|price/.test(text)) return 'cheap_under_price';
  if (/recommend|suggest|for me/.test(text)) return 'recommend';
  if (/reel|video/.test(text)) return 'popular_reels';
  if (/trend|trending/.test(text)) return 'trending';
  if (/best|top|rated|rating/.test(text)) return 'best_rated';
  return 'fallback';
}

function template(role, intent, data) {
  if (intent === 'fallback') return supported(role);
  if (intent === 'best_rated') return `Top rated foods: ${data.map((item) => `${item.name} (${item.ratingAvg.toFixed(1)})`).join(', ')}.`;
  if (intent === 'trending') return `Trending now: ${data.map((item) => item.name).join(', ')}.`;
  if (intent === 'popular_reels') return `Popular reels: ${data.map((item) => `${item.caption || 'Untitled'} (${item.views} views)`).join(', ')}.`;
  if (intent === 'cheap_under_price') return `Foods under ${money(data.price)}: ${data.foods.map((item) => `${item.name} at ${money(item.price)}`).join(', ') || 'none found'}.`;
  if (intent === 'recommend') return `Recommended for you: ${data.map((item) => item.name).join(', ')}.`;
  if (intent === 'my_orders') return `Your recent orders: ${data.map((item) => `${item.status} at ${money(item.total)}`).join(', ') || 'none yet'}.`;
  if (intent === 'revenue') return `In the last 30 days you made ${money(data.revenue)} from ${data.orders} orders, with an average order value of ${money(data.avgOrderValue)}.`;
  if (intent === 'sales_summary') return `Sales summary: ${data.totals.orders} orders and ${money(data.totals.revenue)} revenue. Statuses: ${Object.entries(data.ordersByStatus).map(([status, count]) => `${status} ${count}`).join(', ')}.`;
  if (intent === 'best_listings') return `Best listings by revenue: ${data.map((item) => `${item.food.name} (${money(item.revenue)})`).join(', ')}.`;
  if (intent === 'trending_products') return `Trending products: ${data.map((item) => item.food.name).join(', ')}.`;
  if (intent === 'engagement') return `Engagement: ${data.likes} likes, ${data.saves} saves, and ${data.reelViews} reel views.`;
  return `Review summary: ${data.reviewCount} reviews with an average rating of ${Number(data.ratingAvg || 0).toFixed(1)}.`;
}

async function phraseWithOpenAi(question, reply, data) {
  if (!env.openaiApiKey) return reply;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.openaiApiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'Rewrite the deterministic answer clearly without inventing facts.' }, { role: 'user', content: JSON.stringify({ question, reply, data }) }],
        temperature: 0.2
      })
    });
    if (!response.ok) return reply;
    const result = await response.json();
    return result.choices?.[0]?.message?.content || reply;
  } catch (error) {
    void error;
    return reply;
  }
}

async function chat(user, message) {
  const intent = detectIntent(message, user.role);
  const data = intent === 'fallback' ? null : user.role === 'partner'
    ? await partnerData(user._id, intent)
    : await customerData(user._id, intent, message);
  const reply = template(user.role, intent, data);
  return { reply: await phraseWithOpenAi(message, reply, data), data: data || undefined, intent };
}

module.exports = { chat, detectIntent };
