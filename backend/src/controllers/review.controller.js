const reviewService = require('../services/review.service');

async function update(req, res) {
  res.json({ review: await reviewService.updateReview(req.params.id, req.user._id, req.body) });
}

async function remove(req, res) {
  res.json(await reviewService.deleteReview(req.params.id, req.user._id));
}

module.exports = { update, remove };
