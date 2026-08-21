const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

reviewSchema.index({ customer: 1, food: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
