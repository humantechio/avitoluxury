import mongoose, { Schema, models } from 'mongoose';

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [CartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save hook to calculate subtotal
CartSchema.pre('save', function(next) {
  const cart = this;
  let subtotal = 0;
  
  cart.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  
  cart.subtotal = subtotal;
  next();
});

export default models.Cart || mongoose.model('Cart', CartSchema); 