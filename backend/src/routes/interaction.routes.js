const express = require('express');
const { body } = require('express-validator');
const interactionController = require('../controllers/interaction.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const fields = [body('targetType').isIn(['food', 'reel']), body('target').isMongoId()];

router.post('/likes', requireAuth, fields, validate, asyncHandler(interactionController.like));
router.post('/saves', requireAuth, fields, validate, asyncHandler(interactionController.save));

module.exports = router;
