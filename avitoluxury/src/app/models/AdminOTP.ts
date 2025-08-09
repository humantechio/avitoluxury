import mongoose, { Schema } from 'mongoose';

// Define the interface for AdminOTP document
interface IAdminOTP {
  email?: string;
  phone?: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
  method: 'email' | 'sms';
}

// Create the schema
const AdminOTPSchema = new Schema<IAdminOTP>({
  email: { 
    type: String, 
    lowercase: true,
    trim: true,
    sparse: true // Allow null/undefined while maintaining uniqueness
  },
  phone: {
    type: String,
    trim: true,
    sparse: true // Allow null/undefined while maintaining uniqueness
  },
  otp: { 
    type: String, 
    required: true 
  },
  method: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
    default: 'email'
  },
  expiresAt: { 
    type: Date, 
    required: true,
    default: function() {
      // OTP expires after 10 minutes
      return new Date(Date.now() + 10 * 60 * 1000);
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indexes
AdminOTPSchema.index({ email: 1 });
AdminOTPSchema.index({ phone: 1 });
AdminOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic document cleanup

// Define a method to check if OTP is valid
AdminOTPSchema.methods.isValid = function(): boolean {
  return new Date() < this.expiresAt;
};

// Create the model
const AdminOTP = mongoose.models.AdminOTP || mongoose.model<IAdminOTP>('AdminOTP', AdminOTPSchema);

export default AdminOTP; 