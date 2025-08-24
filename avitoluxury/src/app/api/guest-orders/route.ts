import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import GuestOrder from '@/app/models/GuestOrder';
import OTP from '@/app/models/OTP';
import Product from '@/app/models/Product';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { 
      customerInfo,
      shippingAddress,
      items,
      paymentMethod,
      paymentResult
    } = await request.json();
    
    // Validate required fields
    if (!customerInfo || !shippingAddress || !items || !items.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required order information' 
      }, { status: 400 });
    }
    
    // Validate phone verification
    const { phone } = customerInfo;
    if (!phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number is required' 
      }, { status: 400 });
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Check if phone is verified with OTP
    const otpRecord = await OTP.findOne({ phone, isVerified: true });
    if (!otpRecord) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number has not been verified. Please verify your phone number first.' 
      }, { status: 400 });
    }
    
    // Calculate prices
    let itemsPrice = 0;
    
    // Process items with complete product details
    const processedItems = await Promise.all(items.map(async (item: any) => {
      // Check if product exists and get current price and details
      const product = await Product.findById(item.product);
      if (!product) {
        console.log('Guest Order API: Product not found by ID:', item.product, 'for item:', item.name);
        // Try to find by name as fallback
        const productByName = await Product.findOne({ name: item.name });
        if (productByName) {
          console.log('Guest Order API: Found product by name:', productByName.name);
          // Use the found product
          return {
            product: productByName._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            // Add complete product details
            sku: productByName.sku || '',
            productType: productByName.productType || '',
            category: productByName.category || '',
            subCategory: Array.isArray(productByName.subCategories) && productByName.subCategories.length > 0 
              ? productByName.subCategories[0] 
              : '',
            volume: productByName.volume || '',
            gender: productByName.gender || ''
          };
        }
        throw new Error(`Product not found: ${item.name}`);
      }
      
      console.log('Guest Order API: Found product details:', {
        id: product._id.toString(),
        name: product.name,
        sku: product.sku,
        productType: product.productType,
        category: product.category,
        subCategories: product.subCategories,
        volume: product.volume
      });
      
      // Calculate item price
      const itemTotal = item.price * item.quantity;
      itemsPrice += itemTotal;
      
      // Return item with complete product details
      return {
        product: item.product,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        // Add complete product details
        sku: product.sku || '',
        productType: product.productType || '',
        category: product.category || '',
        subCategory: Array.isArray(product.subCategories) && product.subCategories.length > 0 
          ? product.subCategories[0] 
          : '',
        volume: product.volume || '',
        gender: product.gender || ''
      };
    }));
    
    // Calculate shipping price (₹0 if order total ≥ ₹500, ₹70 if order total < ₹500)
    const shippingPrice = itemsPrice >= 500 ? 0 : 70;
    
    // Calculate total price
    const totalPrice = itemsPrice + shippingPrice;
    
    // Create new order
    const newOrder = new GuestOrder({
      customerInfo,
      shippingAddress,
      items: processedItems,
      paymentMethod: paymentMethod || 'Razorpay', // Default to Razorpay
      itemsPrice,
      shippingPrice,
      totalPrice,
      paymentResult: paymentResult || null,
      isPaid: false,
      isDelivered: false
    });
    
    // Save order to database
    const savedOrder = await newOrder.save();
    
    return NextResponse.json({
      success: true,
      order: {
        id: savedOrder._id,
        totalPrice: savedOrder.totalPrice
      }
    });
    
  } catch (error) {
    console.error('Error creating guest order:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create order. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get phone number from query parameters
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');
    const id = url.searchParams.get('id');
    
    // Connect to database
    await connectToDatabase();
    
    // If ID is provided, get specific order
    if (id) {
      const order = await GuestOrder.findById(id);
      
      if (!order) {
        return NextResponse.json({ 
          success: false, 
          error: 'Order not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        order
      });
    }
    
    // If phone is provided, get orders for that phone
    if (phone) {
      const orders = await GuestOrder.find({ 'customerInfo.phone': phone })
        .sort({ createdAt: -1 });
      
      return NextResponse.json({
        success: true,
        orders
      });
    }
    
    // If no parameters, return error
    return NextResponse.json({ 
      success: false, 
      error: 'Missing required parameters' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error fetching guest orders:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders. Please try again.' 
    }, { status: 500 });
  }
} 