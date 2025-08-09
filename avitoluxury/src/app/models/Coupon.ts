import mongoose, { Schema, models } from 'mongoose';

const CouponSchema = new Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide coupon description']
  },
  discountType: {
    type: String,
    required: [true, 'Please provide discount type'],
    enum: {
      values: ['percentage', 'fixed'],
      message: 'Discount type must be either percentage or fixed'
    }
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide discount value'],
    min: [0, 'Discount value cannot be negative']
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountValue: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide coupon start date'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide coupon end date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default models.Coupon || mongoose.model('Coupon', CouponSchema); 