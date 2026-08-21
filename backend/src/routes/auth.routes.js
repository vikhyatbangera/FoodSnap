const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const businessFields = ['name', 'description', 'address', 'phone', 'logo', 'cuisines'];

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['customer', 'partner']),
    body('business').optional().isObject(),
    body('business.cuisines').optional().isArray(),
    ...businessFields.filter((field) => field !== 'cuisines').map((field) => body(`business.${field}`).optional().isString())
  ],
  validate,
  asyncHandler(authController.register)
);
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  validate,
  asyncHandler(authController.login)
);
router.get('/me', requireAuth, asyncHandler(authController.me));

module.exports = router;
