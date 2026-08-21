const express = require('express');
const { body, query, param } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(requireAuth);
router.post('/', requireRole('customer'), [body('address').isString().trim().notEmpty(), body('deliveryFee').optional().isFloat({ min: 0 }).toFloat()], validate, asyncHandler(orderController.create));
router.get('/mine', requireRole('customer'), [
  query('status').optional().isIn(['active', 'past', 'placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], validate, asyncHandler(orderController.mine));
router.get('/partner', requireRole('partner'), [
  query('status').optional().isIn(['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], validate, asyncHandler(orderController.partner));
router.patch('/:id/status', [
  param('id').isMongoId(),
  body('status').isIn(['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'])
], validate, asyncHandler(orderController.status));
router.get('/:id', [param('id').isMongoId()], validate, asyncHandler(orderController.get));

module.exports = router;
