const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index: true
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        at: { type: Date, required: true }
      }
    ],
    address: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

orderSchema.path('statusHistory').default(() => [{ status: 'placed', at: new Date() }]);

module.exports = mongoose.model('Order', orderSchema);
