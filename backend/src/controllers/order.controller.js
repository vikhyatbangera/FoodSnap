const orderService = require('../services/order.service');

async function create(req, res) {
  res.status(201).json({ order: await orderService.placeOrder(req.user._id, req.body) });
}

async function mine(req, res) {
  res.json(await orderService.listMine(req.user._id, req.query));
}

async function get(req, res) {
  res.json({ order: await orderService.getOrder(req.params.id, req.user._id, req.user.role) });
}

async function partner(req, res) {
  res.json(await orderService.partnerOrders(req.user._id, req.query));
}

async function status(req, res) {
  res.json({ order: await orderService.updateStatus(req.params.id, req.user, req.body.status) });
}

module.exports = { create, mine, get, partner, status };
