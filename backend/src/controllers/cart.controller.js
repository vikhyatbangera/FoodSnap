const cartService = require('../services/cart.service');

async function get(req, res) {
  res.json({ cart: await cartService.getCart(req.user._id) });
}

async function add(req, res) {
  res.json({ cart: await cartService.addItem(req.user._id, req.body.foodId, req.body.quantity) });
}

async function update(req, res) {
  res.json({ cart: await cartService.updateItem(req.user._id, req.params.foodId, req.body.quantity) });
}

async function remove(req, res) {
  res.json({ cart: await cartService.removeItem(req.user._id, req.params.foodId) });
}

async function clear(req, res) {
  res.json({ cart: await cartService.clearCart(req.user._id) });
}

module.exports = { get, add, update, remove, clear };
