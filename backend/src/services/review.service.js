const Food = require('../models/Food');
const Order = require('../models/Order');
const Review = require('../models/Review');
const ApiError = require('../utils/ApiError');

async function recomputeFoodRating(foodId) {
  const [summary] = await Review.aggregate([
    { $match: { food: foodId } },
    { $group: { _id: '$food', ratingAvg: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
  ]);
  await Food.updateOne(
    { _id: foodId },
    { $set: { ratingAvg: summary?.ratingAvg || 0, ratingCount: summary?.ratingCount || 0 } }
  );
}

async function createReview(customerId, foodId, data) {
  const food = await Food.findById(foodId);
  if (!food) throw new ApiError(404, 'Food not found');
  const order = await Order.findOne({
    customer: customerId,
    status: 'delivered',
    'items.food': foodId
  });
  if (!order) throw new ApiError(403, 'You can review food only after a delivered order containing it');
  let review;
  try {
    review = await Review.create({
      customer: customerId,
      food: foodId,
      partner: food.partner,
      order: order._id,
      rating: data.rating,
      comment: data.comment
    });
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'You have already reviewed this food');
    throw error;
  }
  await recomputeFoodRating(foodId);
  return review.populate('customer', 'name photo');
}

async function updateReview(id, customerId, data) {
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.customer.toString() !== customerId.toString()) throw new ApiError(403, 'You do not own this review');
  if (data.rating !== undefined) review.rating = data.rating;
  if (data.comment !== undefined) review.comment = data.comment;
  await review.save();
  await recomputeFoodRating(review.food);
  return review.populate('customer', 'name photo');
}

async function deleteReview(id, customerId) {
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found');
  if (review.customer.toString() !== customerId.toString()) throw new ApiError(403, 'You do not own this review');
  await Review.deleteOne({ _id: id });
  await recomputeFoodRating(review.food);
  return { deleted: true };
}

module.exports = { createReview, updateReview, deleteReview, recomputeFoodRating };
