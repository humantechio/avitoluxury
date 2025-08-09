import mongoose, { Document, Model, Schema } from 'mongoose';

// Subscriber base interface without Document methods
export interface ISubscriberBase {
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: Date;
  lastNotifiedAt?: Date;
  unsubscribedAt?: Date;
}

// Subscriber document interface
export interface ISubscriber extends Document, ISubscriberBase {}

// Subscriber schema
const SubscriberSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  lastNotifiedAt: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better performance
SubscriberSchema.index({ email: 1 }, { unique: true });
SubscriberSchema.index({ isActive: 1 });

// Create or get the Subscriber model
const Subscriber: Model<ISubscriber> = mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber; 