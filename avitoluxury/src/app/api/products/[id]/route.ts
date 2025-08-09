import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Product from '../../../models/Product';
import connectMongoDB from '@/app/lib/mongodb';

// GET a single product by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    // Get id directly from params
    const { id } = context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }
    
    let product;
    
    // Try to find by MongoDB ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    
    // If not found or not a valid ObjectId, try to find by slug or custom ID field
    if (!product) {
      product = await Product.findOne({ 
        $or: [
          { slug: id },
          { customId: id },
          { sku: id }
        ]
      });
    }

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Server error' 
    }, { status: 500 });
  }
}

// UPDATE a product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    // Get id directly from params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }
    
    // Handle multipart form data
    const formData = await request.formData();
    
    // Parse product info from form data
    const productInfoJson = formData.get('productInfo') as string;
    if (!productInfoJson) {
      return NextResponse.json({ success: false, error: 'Product information is required' }, { status: 400 });
    }
    
    const productInfo = JSON.parse(productInfoJson);
    
    // Extract images and videos
    const images = productInfo.images || [];
    const videos = productInfo.videos || [];
    
    // Set main image or default if none provided
    const mainImage = productInfo.mainImage || (images.length > 0 ? images[0] : '/placeholder.jpg');
    
    // Create product data with all fields
    const productData = {
      name: productInfo.name,
      slug: productInfo.slug || (productInfo.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6)),
      description: productInfo.description,
      price: parseFloat(productInfo.price.toString()),
      comparePrice: productInfo.comparePrice ? parseFloat(productInfo.comparePrice.toString()) : 0,
      images: images,
      videos: videos,
      mainImage: mainImage,
      
      // New categorization fields
      productType: productInfo.productType,
      category: productInfo.category,
      subCategories: productInfo.subCategories || [],
      volume: productInfo.volume,
      gender: productInfo.gender || 'Unisex', // Default to Unisex if not provided
      
      // Marketing flags
      isBestSelling: productInfo.isBestSelling || false,
      isNewArrival: productInfo.isNewArrival || false,
      isBestBuy: productInfo.isBestBuy || false,
      
      // Keep existing fields
      brand: productInfo.brand || 'A V I T O   S C E N T S',
      sku: productInfo.sku,
      quantity: productInfo.quantity || 0,
      featured: productInfo.featured || false,
      isNewProduct: productInfo.isNewArrival || false, // For backward compatibility
      onSale: productInfo.comparePrice && productInfo.comparePrice > productInfo.price,
      bulletPoints: Array.isArray(productInfo.bulletPoints) ? productInfo.bulletPoints : [],
    };
    
    console.log('Updating product:', id);
    
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product updated successfully:', product._id);
    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle MongoDB duplicate key errors
      if (error instanceof mongoose.Error.ValidationError) {
        errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        statusCode = 400;
      } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        errorMessage = 'A product with this SKU already exists';
        statusCode = 409;
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage
    }, { status: statusCode });
  }
}

// DELETE a product by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    // Get id directly from params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }
    
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    console.log('Product deleted successfully:', id);
    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 