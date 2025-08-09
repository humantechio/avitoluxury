import mongoose, { Schema, models } from 'mongoose';

const GuestOrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    required: false
  },
  // Complete product details fields
  sku: {
    type: String,
    required: false
  },
  productType: {
    type: String,
    required: false
  },
  category: {
    type: String,
    required: false
  },
  subCategory: {
    type: String,
    required: false
  },
  volume: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  }
});

const GuestOrderSchema = new Schema({
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  shippingAddress: {
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  items: [GuestOrderItemSchema],
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Online', 'Razorpay'],
    default: 'Razorpay'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discountPrice: {
    type: Number,
    default: 0.0
  },
  couponCode: {
    type: String
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  trackingNumber: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default models.GuestOrder || mongoose.model('GuestOrder', GuestOrderSchema); 