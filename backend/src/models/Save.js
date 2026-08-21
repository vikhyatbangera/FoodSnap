const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['food', 'reel'], required: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  { timestamps: true }
);

saveSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('Save', saveSchema);
