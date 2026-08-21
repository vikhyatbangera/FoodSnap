const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.post('/', requireAuth, [body('message').isString().trim().isLength({ min: 1, max: 1000 })], validate, asyncHandler(chatController.chat));

module.exports = router;
