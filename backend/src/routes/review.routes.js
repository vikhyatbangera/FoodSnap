const express = require('express');
const { body, param } = require('express-validator');
const reviewController = require('../controllers/review.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.patch(
  '/:id',
  requireAuth,
  requireRole('customer'),
  [param('id').isMongoId(), body('rating').optional().isInt({ min: 1, max: 5 }).toInt(), body('comment').optional().isString()],
  validate,
  asyncHandler(reviewController.update)
);
router.delete('/:id', requireAuth, requireRole('customer'), [param('id').isMongoId()], validate, asyncHandler(reviewController.remove));

module.exports = router;
