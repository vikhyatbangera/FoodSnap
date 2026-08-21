const foodService = require('../services/food.service');
const reviewService = require('../services/review.service');

async function list(req, res) {
  res.json(await foodService.listFoods(req.query));
}

async function get(req, res) {
  res.json(await foodService.getFood(req.params.id));
}

async function create(req, res) {
  res.status(201).json({ food: await foodService.createFood(req.user._id, req.body, req.file) });
}

async function update(req, res) {
  res.json({ food: await foodService.updateFood(req.params.id, req.user._id, req.body, req.file) });
}

async function remove(req, res) {
  res.json(await foodService.deleteFood(req.params.id, req.user._id));
}

async function listReviews(req, res) {
  res.json(await foodService.listReviews(req.params.id, req.query));
}

async function createReview(req, res) {
  res.status(201).json({
    review: await reviewService.createReview(req.user._id, req.params.id, req.body)
  });
}

module.exports = { list, get, create, update, remove, listReviews, createReview };
