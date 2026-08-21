const Food = require('../models/Food');
const Reel = require('../models/Reel');
const Like = require('../models/Like');
const Save = require('../models/Save');
const Order = require('../models/Order');
const Review = require('../models/Review');
const roundMoney = require('../utils/money');

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function startOfDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function dateRange(days) {
  const end = startOfDay(new Date());
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return { start, end: new Date(end.getTime() + 24 * 60 * 60 * 1000) };
}

async function getOverview(partnerId, rawDays) {
  const days = Math.min(Math.max(Number(rawDays) || 30, 1), 365);
  const { start, end } = dateRange(days);
  const [foods, reels] = await Promise.all([
    Food.find({ partner: partnerId }).select('name image likeCount saveCount orderCount ratingAvg ratingCount'),
    Reel.find({ partner: partnerId }).select('caption thumbnail views likeCount saveCount')
  ]);
  const foodIds = foods.map((food) => food._id);
  const reelIds = reels.map((reel) => reel._id);
  const orderWindow = { partner: partnerId, createdAt: { $gte: start, $lt: end } };
  const revenueWindow = { ...orderWindow, status: { $ne: 'cancelled' } };
  const [
    orderTotals,
    likes,
    saves,
    reviewTotals,
    revenueByDayRows,
    ordersByStatus,
    foodRevenue,
    recentFoodOrders
  ] = await Promise.all([
    Order.aggregate([
      { $match: orderWindow },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', 0] } },
          avgOrderValue: { $avg: { $cond: [{ $ne: ['$status', 'cancelled'] }, '$total', null] } }
        }
      }
    ]),
    Like.countDocuments({ targetType: 'food', target: { $in: foodIds } }).then((foodLikes) => Like.countDocuments({ targetType: 'reel', target: { $in: reelIds } }).then((reelLikes) => foodLikes + reelLikes)),
    Save.countDocuments({ targetType: 'food', target: { $in: foodIds } }).then((foodSaves) => Save.countDocuments({ targetType: 'reel', target: { $in: reelIds } }).then((reelSaves) => foodSaves + reelSaves)),
    Review.aggregate([
      { $match: { partner: partnerId } },
      { $group: { _id: null, reviewCount: { $sum: 1 }, ratingAvg: { $avg: '$rating' } } }
    ]),
    Order.aggregate([
      { $match: revenueWindow },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([{ $match: orderWindow }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: revenueWindow },
      { $unwind: '$items' },
      { $match: { 'items.food': { $in: foodIds } } },
      { $group: { _id: '$items.food', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, orderCount: { $sum: '$items.quantity' } } }
    ]),
    Order.aggregate([
      { $match: revenueWindow },
      { $unwind: '$items' },
      { $match: { 'items.food': { $in: foodIds } } },
      { $group: { _id: '$items.food', orderVelocity: { $sum: '$items.quantity' } } }
    ])
  ]);
  const totals = orderTotals[0] || { orders: 0, revenue: 0, avgOrderValue: 0 };
  const reviews = reviewTotals[0] || { reviewCount: 0, ratingAvg: 0 };
  const revenueMap = new Map(revenueByDayRows.map((row) => [row._id, { date: row._id, revenue: roundMoney(row.revenue), orders: row.orders }]));
  const revenueByDay = [];
  for (let date = new Date(start); date < end; date.setUTCDate(date.getUTCDate() + 1)) {
    const key = dayKey(date);
    revenueByDay.push(revenueMap.get(key) || { date: key, revenue: 0, orders: 0 });
  }
  const statusCounts = Object.fromEntries(ordersByStatus.map((row) => [row._id, row.count]));
  const foodRevenueMap = new Map(foodRevenue.map((row) => [row._id.toString(), row]));
  const velocityMap = new Map(recentFoodOrders.map((row) => [row._id.toString(), row.orderVelocity]));
  const foodStats = foods.map((food) => {
    const revenue = foodRevenueMap.get(food._id.toString());
    return {
      food: { _id: food._id, name: food.name, image: food.image },
      revenue: roundMoney(revenue?.revenue || 0),
      orderCount: revenue?.orderCount || 0,
      trendingScore: food.likeCount + food.saveCount + (velocityMap.get(food._id.toString()) || 0)
    };
  });
  const byRevenue = [...foodStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const byOrderCount = [...foodStats].sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);
  const trendingFoods = [...foodStats].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 5);
  const topReels = [...reels]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((reel) => ({ _id: reel._id, caption: reel.caption, thumbnail: reel.thumbnail, views: reel.views }));
  return {
    totals: {
      orders: totals.orders || 0,
      revenue: roundMoney(totals.revenue || 0),
      avgOrderValue: roundMoney(totals.avgOrderValue || 0),
      likes,
      saves,
      reelViews: reels.reduce((sum, reel) => sum + reel.views, 0),
      reviewCount: reviews.reviewCount || 0,
      ratingAvg: reviews.ratingAvg || 0
    },
    revenueByDay,
    topFoods: { byRevenue, byOrderCount },
    trendingFoods,
    ordersByStatus: statusCounts,
    topReels
  };
}

module.exports = { getOverview, dateRange };
