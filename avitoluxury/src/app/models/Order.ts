import mongoose, { Schema, models } from 'mongoose';

const OrderItemSchema = new Schema({
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

const OrderSchema = new Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  alternatePhone: {
    type: String,
    required: false
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Credit Card', 'PayPal', 'UPI', 'Online', 'Razorpay']
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    razorpayOrderId: String,
    razorpay_payment_id: String,
    razorpay_signature: String
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
  }
}, {
  timestamps: true
});

const Order = models.Order || mongoose.model('Order', OrderSchema);

export default Order; 