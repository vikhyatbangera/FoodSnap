const express = require('express');
const { body, query, param } = require('express-validator');
const foodController = require('../controllers/food.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const createFoodFields = [
  body('name').trim().isLength({ min: 2, max: 160 }),
  body('description').optional().isString(),
  body('price').isFloat({ min: 0 }).toFloat(),
  body('category').optional().isString(),
  body('tags').optional().custom((value) => Array.isArray(value) || typeof value === 'string'),
  body('isAvailable').optional().isBoolean().toBoolean()
];
const updateFoodFields = [
  body('name').optional().trim().isLength({ min: 2, max: 160 }),
  body('description').optional().isString(),
  body('price').optional().isFloat({ min: 0 }).toFloat(),
  body('category').optional().isString(),
  body('tags').optional().custom((value) => Array.isArray(value) || typeof value === 'string'),
  body('isAvailable').optional().isBoolean().toBoolean()
];
const listFields = [
  query('q').optional().isString(),
  query('category').optional().isString(),
  query('partner').optional().isMongoId(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
  query('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'rating', 'popular', 'trending']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
];

router.get('/', listFields, validate, asyncHandler(foodController.list));
router.get(
  '/:id/reviews',
  [param('id').isMongoId(), query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt()],
  validate,
  asyncHandler(foodController.listReviews)
);
router.post(
  '/:id/reviews',
  requireAuth,
  requireRole('customer'),
  [param('id').isMongoId(), body('rating').isInt({ min: 1, max: 5 }).toInt(), body('comment').optional().isString()],
  validate,
  asyncHandler(foodController.createReview)
);
router.get('/:id', [param('id').isMongoId()], validate, asyncHandler(foodController.get));
router.post(
  '/',
  requireAuth,
  requireRole('partner'),
  imageUpload.single('image'),
  createFoodFields,
  validate,
  asyncHandler(foodController.create)
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('partner'),
  imageUpload.single('image'),
  [param('id').isMongoId(), ...updateFoodFields],
  validate,
  asyncHandler(foodController.update)
);
router.delete(
  '/:id',
  requireAuth,
  requireRole('partner'),
  [param('id').isMongoId()],
  validate,
  asyncHandler(foodController.remove)
);

module.exports = router;
