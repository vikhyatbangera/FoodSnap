const express = require('express');
const { query, body, param } = require('express-validator');
const partnerController = require('../controllers/partner.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  [query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt()],
  validate,
  asyncHandler(partnerController.list)
);
router.patch(
  '/me',
  requireAuth,
  requireRole('partner'),
  imageUpload.single('logo'),
  [
    body('name').optional().trim().isLength({ min: 2, max: 120 }),
    body('description').optional().isString(),
    body('address').optional().isString(),
    body('phone').optional().isString(),
    body('cuisines').optional().custom((value) => Array.isArray(value) || typeof value === 'string')
  ],
  validate,
  asyncHandler(partnerController.updateMe)
);
router.get('/:id', [param('id').isMongoId()], validate, asyncHandler(partnerController.get));

module.exports = router;
