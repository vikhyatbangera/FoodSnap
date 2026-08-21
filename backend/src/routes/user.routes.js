const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.patch(
  '/me',
  requireAuth,
  imageUpload.single('photo'),
  [body('name').optional().trim().isLength({ min: 2, max: 100 })],
  validate,
  asyncHandler(userController.updateMe)
);
router.patch(
  '/me/settings',
  requireAuth,
  [body('theme').optional().isIn(['light', 'dark']), body('notifications').optional().isBoolean().toBoolean()],
  validate,
  asyncHandler(userController.updateSettings)
);
router.get('/me/saved', requireAuth, asyncHandler(userController.saved));

module.exports = router;
