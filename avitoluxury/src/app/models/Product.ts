import mongoose, { Document, Model, Schema } from 'mongoose';

// Product base interface without Document methods
export interface IProductBase {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  videos?: string[];
  mainImage: string;
  
  // New categorization fields
  productType: string;
  category: string;
  subCategories: string[];
  volume: string;
  gender: string; // Added gender field
  bulletPoints?: string[];
  
  // Marketing flags
  isBestSelling: boolean;
  isNewArrival: boolean;
  isBestBuy: boolean;
  
  // Keep existing fields
  brand?: string;
  sku: string;
  quantity: number;
  sold?: number;
  featured?: boolean;
  // Rename isNew to avoid conflict with Document.isNew
  isNewProduct?: boolean;
  onSale?: boolean;
  rating?: number;
  numReviews?: number;
  reviews?: Array<{
    user: mongoose.Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
  attributes?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// Product document interface
export interface IProduct extends Document, Omit<IProductBase, 'isNewProduct'> {
  // Redefine the property without conflict
  isNewProduct: boolean;
}

// Review sub-schema
const ReviewSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  _id: true
});

// Product schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
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
  
  // New categorization fields
  productType: {
    type: String,
    required: [true, 'Please select a product type'],
    enum: ['Perfumes', 'Aesthetic Attars', 'Air Fresheners', 'Waxfume (Solid)']
  },
  category: {
    type: String,
    required: [true, 'Please select a category']
  },
  subCategories: {
    type: [String],
    default: []
  },
  volume: {
    type: String,
    required: [true, 'Please select a volume']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unisex', 'Other'],
    default: 'Unisex'
  },
  bulletPoints: {
    type: [String],
    default: []
  },
  
  // Marketing flags
  isBestSelling: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestBuy: {
    type: Boolean,
    default: false
  },
  
  // Keep existing fields
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
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
  // Renamed from isNew to isNewProduct
  isNewProduct: {
    type: Boolean,
    default: true
  },
  onSale: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [ReviewSchema],
  attributes: {
    type: Map,
    of: String,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ productType: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ gender: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isBestSelling: 1 });
ProductSchema.index({ isNewArrival: 1 });
ProductSchema.index({ isBestBuy: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ isNewProduct: 1 }); // Updated index name
ProductSchema.index({ onSale: 1 });

// Create a virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Create or get the Product model
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product; 