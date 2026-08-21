const express = require('express');
const { body, param } = require('express-validator');
const cartController = require('../controllers/cart.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth, requireRole('customer'));
router.get('/', asyncHandler(cartController.get));
router.post(
  '/items',
  [body('foodId').isMongoId(), body('quantity').isInt({ min: 1, max: 99 }).toInt()],
  validate,
  asyncHandler(cartController.add)
);
router.patch(
  '/items/:foodId',
  [param('foodId').isMongoId(), body('quantity').isInt({ min: 1, max: 99 }).toInt()],
  validate,
  asyncHandler(cartController.update)
);
router.delete('/items/:foodId', [param('foodId').isMongoId()], validate, asyncHandler(cartController.remove));
router.delete('/', asyncHandler(cartController.clear));

module.exports = router;
