const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');

const transitions = {
  placed: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: []
};

function pageValue(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

async function placeOrder(customerId, data) {
  const cart = await Cart.findOne({ user: customerId });
  if (!cart || !cart.items.length) throw new ApiError(400, 'Cart is empty');
  if (!data.address) throw new ApiError(400, 'Delivery address is required');
  const foodIds = cart.items.map((item) => item.food);
  const foods = await Food.find({ _id: { $in: foodIds }, isAvailable: true });
  if (foods.length !== foodIds.length) throw new ApiError(409, 'One or more cart items are no longer available');
  const foodMap = new Map(foods.map((food) => [food._id.toString(), food]));
  const items = cart.items.map((item) => {
    const food = foodMap.get(item.food.toString());
    return { food: food._id, name: food.name, price: food.price, quantity: item.quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = data.deliveryFee === undefined ? 2.99 : Number(data.deliveryFee);
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) throw new ApiError(400, 'Invalid delivery fee');
  const order = await Order.create({
    customer: customerId,
    partner: cart.partner,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    address: data.address
  });
  await Promise.all([
    Cart.deleteOne({ _id: cart._id }),
    ...items.map((item) => Food.updateOne({ _id: item.food }, { $inc: { orderCount: item.quantity } }))
  ]);
  return getOrder(order._id, customerId, 'customer');
}

async function listMine(customerId, query) {
  const page = pageValue(query.page, 1);
  const limit = pageValue(query.limit, 20, 100);
  const filter = { customer: customerId };
  if (query.status) {
    if (query.status === 'active') filter.status = { $nin: ['delivered', 'cancelled'] };
    else if (query.status === 'past') filter.status = { $in: ['delivered', 'cancelled'] };
    else filter.status = query.status;
  }
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('partner', 'name business photo').populate('items.food', 'name image'),
    Order.countDocuments(filter)
  ]);
  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getOrder(id, userId, role) {
  const filter = { _id: id };
  if (role === 'customer') filter.customer = userId;
  if (role === 'partner') filter.partner = userId;
  const order = await Order.findOne(filter).populate('customer', 'name email photo').populate('partner', 'name business photo').populate('items.food', 'name image price');
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

async function partnerOrders(partnerId, query) {
  const page = pageValue(query.page, 1);
  const limit = pageValue(query.limit, 20, 100);
  const filter = { partner: partnerId };
  if (query.status) filter.status = query.status;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('customer', 'name email photo').populate('items.food', 'name image'),
    Order.countDocuments(filter)
  ]);
  return { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function updateStatus(id, user, nextStatus) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  const isCustomer = user.role === 'customer';
  const ownsOrder = isCustomer
    ? order.customer.toString() === user._id.toString()
    : order.partner.toString() === user._id.toString();
  if (!ownsOrder) throw new ApiError(403, 'You do not have access to this order');
  if (isCustomer && (nextStatus !== 'cancelled' || order.status !== 'placed')) {
    throw new ApiError(403, 'Customers may only cancel placed orders');
  }
  if (!transitions[order.status]?.includes(nextStatus)) {
    throw new ApiError(400, `Illegal order status transition from ${order.status} to ${nextStatus}`);
  }
  order.status = nextStatus;
  order.statusHistory.push({ status: nextStatus, at: new Date() });
  await order.save();
  return order;
}

module.exports = { placeOrder, listMine, getOrder, partnerOrders, updateStatus, transitions };
