const express = require('express');
const { body, query, param } = require('express-validator');
const reelController = require('../controllers/reel.controller');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const { mediaUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const mediaFields = mediaUpload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

router.get(
  '/',
  optionalAuth,
  [
    query('sort').optional().isIn(['trending', 'newest']),
    query('partner').optional().isMongoId(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  validate,
  asyncHandler(reelController.list)
);
router.post(
  '/',
  requireAuth,
  requireRole('partner'),
  mediaFields,
  [body('caption').optional().isString(), body('foodId').optional({ nullable: true }).isMongoId()],
  validate,
  asyncHandler(reelController.create)
);
router.patch(
  '/:id',
  requireAuth,
  requireRole('partner'),
  mediaFields,
  [param('id').isMongoId(), body('caption').optional().isString(), body('foodId').optional({ nullable: true }).isMongoId()],
  validate,
  asyncHandler(reelController.update)
);
router.delete('/:id', requireAuth, requireRole('partner'), [param('id').isMongoId()], validate, asyncHandler(reelController.remove));
router.post('/:id/view', [param('id').isMongoId()], validate, asyncHandler(reelController.view));

module.exports = router;
