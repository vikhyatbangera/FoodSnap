const express = require('express');
const { query } = require('express-validator');
const analyticsController = require('../controllers/analytics.controller');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/overview', requireAuth, requireRole('partner'), [query('days').optional().isInt({ min: 1, max: 365 }).toInt()], validate, asyncHandler(analyticsController.overview));

module.exports = router;
