const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['food', 'reel'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
