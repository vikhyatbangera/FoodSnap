const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', index: true },
    video: { type: String, required: true, trim: true },
    thumbnail: { type: String, trim: true },
    caption: { type: String, trim: true },
    views: { type: Number, default: 0, min: 0 },
    likeCount: { type: Number, default: 0, min: 0 },
    saveCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reelSchema.index({ caption: 'text' });

module.exports = mongoose.model('Reel', reelSchema);
