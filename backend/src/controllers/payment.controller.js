const Razorpay = require('razorpay');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const roundMoney = require('../utils/money');

let razorpayInstance = null;

function getRazorpay() {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new ApiError(500, 'Razorpay keys are not configured in environment variables');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

async function createRazorpayOrder(req, res, next) {
  try {
    const customerId = req.user._id;
    const cart = await Cart.findOne({ user: customerId });
    if (!cart || !cart.items.length) {
      throw new ApiError(400, 'Cart is empty');
    }

    const foodIds = cart.items.map((item) => item.food);
    const foods = await Food.find({ _id: { $in: foodIds }, isAvailable: true });
    if (foods.length !== foodIds.length) {
      throw new ApiError(409, 'One or more cart items are no longer available');
    }

    const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));
    let subtotal = 0;
    for (const item of cart.items) {
      const food = foodMap.get(item.food.toString());
      subtotal += food.price * item.quantity;
    }

    subtotal = roundMoney(subtotal);
    const deliveryFee = 2.99; // hardcoded as in order.service.js
    const total = roundMoney(subtotal + deliveryFee);

    let orderId = `order_${Date.now()}`;
    let orderAmount = Math.round(total * 100);
    let orderCurrency = 'USD';

    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_mXoG1qX6k2x0x5') {
      // Mock order for demo purposes
      orderId = `order_demo_${Date.now()}`;
    } else {
      const rzp = getRazorpay();
      const options = {
        amount: orderAmount,
        currency: orderCurrency,
        receipt: `receipt_${customerId.toString().slice(-6)}_${Date.now()}`
      };
      const order = await rzp.orders.create(options);
      orderId = order.id;
      orderAmount = order.amount;
      orderCurrency = order.currency;
    }

    res.json({
      orderId,
      amount: orderAmount,
      currency: orderCurrency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createRazorpayOrder };
