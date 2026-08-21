const Cart = require('../models/Cart');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');

function quantityValue(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new ApiError(400, 'Quantity must be an integer between 1 and 99');
  }
  return quantity;
}

async function populateCart(cart) {
  if (!cart) return { user: null, partner: null, items: [] };
  await cart.populate([
    { path: 'partner', select: 'name business photo' },
    { path: 'items.food', populate: { path: 'partner', select: 'name business photo' } }
  ]);
  return cart;
}

async function getCart(userId) {
  return populateCart(await Cart.findOne({ user: userId }));
}

async function addItem(userId, foodId, rawQuantity) {
  const quantity = quantityValue(rawQuantity);
  const food = await Food.findOne({ _id: foodId, isAvailable: true });
  if (!food) throw new ApiError(404, 'Available food not found');
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, partner: food.partner, items: [{ food: food._id, quantity }] });
  } else {
    if (cart.partner && cart.partner.toString() !== food.partner.toString()) {
      throw new ApiError(409, 'Cart contains items from another partner. Clear your cart before adding this item.');
    }
    const existing = cart.items.find((item) => item.food.toString() === foodId.toString());
    if (existing) existing.quantity += quantity;
    else cart.items.push({ food: food._id, quantity });
    cart.partner = food.partner;
    await cart.save();
  }
  return populateCart(cart);
}

async function updateItem(userId, foodId, rawQuantity) {
  const quantity = quantityValue(rawQuantity);
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart is empty');
  const item = cart.items.find((entry) => entry.food.toString() === foodId.toString());
  if (!item) throw new ApiError(404, 'Food is not in the cart');
  item.quantity = quantity;
  await cart.save();
  return populateCart(cart);
}

async function removeItem(userId, foodId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart is empty');
  cart.items = cart.items.filter((entry) => entry.food.toString() !== foodId.toString());
  if (!cart.items.length) cart.partner = undefined;
  await cart.save();
  return populateCart(cart);
}

async function clearCart(userId) {
  await Cart.deleteOne({ user: userId });
  return { user: userId, partner: null, items: [] };
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
