const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    logo: { type: String, trim: true },
    cuisines: [{ type: String, trim: true }]
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'partner'], required: true },
    photo: { type: String, trim: true },
    settings: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      notifications: { type: Boolean, default: true }
    },
    business: { type: businessSchema }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.virtual('isPartner').get(function isPartner() {
  return this.role === 'partner';
});

module.exports = mongoose.model('User', userSchema);
