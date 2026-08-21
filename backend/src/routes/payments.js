const express = require('express');
const { createRazorpayOrder } = require('../controllers/payment.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/create-order', requireRole('customer'), createRazorpayOrder);

module.exports = router;
