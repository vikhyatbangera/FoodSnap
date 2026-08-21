const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, trim: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    saveCount: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

foodSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Food', foodSchema);
