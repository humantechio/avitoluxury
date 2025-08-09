/**
 * Database seeding script for Perfume E-commerce Website
 * This script initializes the MongoDB database with proper schemas
 * and removes any mock/demo data.
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

// Check for MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully!');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Define schemas for all models
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must have at least 6 characters'],
    select: true // Include password by default for this script
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String
  },
  addresses: [{
    addressId: String,
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    isDefault: Boolean
  }],
  phone: {
    type: String,
    trim: true
  },
  wishlist: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  images: {
    type: [String],
    default: []
  },
  videos: {
    type: [String],
    default: []
  },
  mainImage: {
    type: String,
    required: [true, 'Please provide a main product image']
  },
  category: {
    type: String,
    required: [true, 'Please select a category']
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Please provide a product SKU'],
    unique: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide product quantity'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  sold: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isNewProduct: {
    type: Boolean,
    default: true
  },
  onSale: {
    type: Boolean,
    default: false
  },
  attributes: {
    type: Map,
    of: String,
    default: {}
  }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
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
    }
  }],
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
    country: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: false
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['COD', 'Credit Card', 'PayPal', 'UPI']
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
  }
}, { timestamps: true });

const WishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Register the models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema);

// Seed the database with initial data
async function seedDatabase() {
  try {
    // 1. Clear all existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Wishlist.deleteMany({});
    await Cart.deleteMany({});
    console.log('All existing data cleared successfully!');

    // 2. Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user created successfully!');

    // 3. Create regular user
    console.log('Creating regular user...');
    const regularPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: regularPassword,
      role: 'user'
    });
    console.log('Regular user created successfully!');

    // 4. Create sample products
    console.log('Creating sample products...');
    const products = [
      {
        name: 'Aqua Vitality',
        slug: 'aqua-vitality',
        description: 'A refreshing blend of citrus and ocean notes, creating a vibrant and energetic scent experience.',
        price: 129.99,
        comparePrice: 149.99,
        images: ['https://placehold.co/400x500?text=Aqua+Vitality'],
        mainImage: 'https://placehold.co/400x500?text=Aqua+Vitality',
        category: 'Fresh',
        brand: 'A V I T O   S C E N T S',
        sku: 'AV-001',
        quantity: 50,
        featured: true,
        isNewProduct: true,
        attributes: {
          gender: 'Unisex',
          volume: '100ml',
          about: 'Refreshing ocean scent',
          disclaimer: 'Keep away from direct sunlight'
        }
      },
      {
        name: 'Velvet Rose',
        slug: 'velvet-rose',
        description: 'Luxurious rose notes combined with subtle hints of vanilla for an elegant and romantic fragrance.',
        price: 149.99,
        comparePrice: 179.99,
        images: ['https://placehold.co/400x500?text=Velvet+Rose'],
        mainImage: 'https://placehold.co/400x500?text=Velvet+Rose',
        category: 'Floral',
        brand: 'A V I T O   S C E N T S',
        sku: 'AV-002',
        quantity: 30,
        featured: true,
        isNewProduct: false,
        attributes: {
          gender: 'Feminine',
          volume: '50ml',
          about: 'Elegant rose scent',
          disclaimer: 'For external use only'
        }
      },
      {
        name: 'Midnight Oud',
        slug: 'midnight-oud',
        description: 'A deep and mysterious blend of oud, spices, and amber for a rich and long-lasting fragrance experience.',
        price: 199.99,
        comparePrice: 229.99,
        images: ['https://placehold.co/400x500?text=Midnight+Oud'],
        mainImage: 'https://placehold.co/400x500?text=Midnight+Oud',
        category: 'Woody',
        brand: 'A V I T O   S C E N T S',
        sku: 'AV-003',
        quantity: 25,
        featured: false,
        isNewProduct: true,
        attributes: {
          gender: 'Masculine',
          volume: '100ml',
          about: 'Rich and deep oud scent',
          disclaimer: 'Store in a cool, dry place'
        }
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} sample products created successfully!`);

    // 5. Create a sample order
    console.log('Creating a sample order...');
    const sampleOrder = await Order.create({
      user: regularUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          price: createdProducts[0].price,
          quantity: 1,
          image: createdProducts[0].mainImage
        }
      ],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        phone: '1234567890'
      },
      paymentMethod: 'COD',
      itemsPrice: createdProducts[0].price,
      shippingPrice: 10.0,
      taxPrice: 15.0,
      totalPrice: createdProducts[0].price + 10.0 + 15.0,
      status: 'Pending'
    });
    console.log('Sample order created successfully!');

    // 6. Create a sample wishlist
    console.log('Creating a sample wishlist...');
    const wishlist = await Wishlist.create({
      user: regularUser._id,
      products: [
        {
          product: createdProducts[1]._id,
          addedAt: new Date()
        }
      ]
    });
    console.log('Sample wishlist created successfully!');

    // 7. Create a sample cart
    console.log('Creating a sample cart...');
    const cart = await Cart.create({
      user: regularUser._id,
      items: [
        {
          product: createdProducts[2]._id,
          quantity: 1
        }
      ]
    });
    console.log('Sample cart created successfully!');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Main function
async function main() {
  const connected = await connectToMongoDB();
  if (connected) {
    await seedDatabase();
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  } else {
    console.error('Failed to connect to MongoDB. Database seeding aborted.');
  }
}

main(); 