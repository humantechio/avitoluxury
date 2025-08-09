import mongoose, { Schema, models } from 'mongoose';

const OTPSchema = new Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: false, // Not required since we'll use sessionId for verification
  },
  sessionId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 minutes (300 seconds)
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

export default models.OTP || mongoose.model('OTP', OTPSchema); 