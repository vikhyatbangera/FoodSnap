const express = require('express');
const { query } = require('express-validator');
const searchController = require('../controllers/search.controller');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', [query('q').isString().trim().notEmpty(), query('type').optional().isIn(['all', 'foods', 'reels', 'partners'])], validate, asyncHandler(searchController.search));

module.exports = router;
