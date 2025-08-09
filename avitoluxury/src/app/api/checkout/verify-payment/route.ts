import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db-connect';
import Order from '@/app/models/Order';
import Product from '@/app/models/Product';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '@/app/lib/email-utils';
import { sendOrderConfirmationSMS } from '@/app/lib/sms-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    } = body;
    
    // Validate input
    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find order and populate user information
    const order = await Order.findById(orderId).populate('user').populate({
      path: 'items.product',
      model: Product
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }
    
    // Generate signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');
    
    // Compare signatures
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    // Update order
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'Processing';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'completed',
      update_time: new Date().toISOString(),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    
    await order.save();
    
    // Send order confirmation email
    try {
      const formattedDate = new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata'
      });

      // Format order data for email with enhanced product details
      const emailData = {
        user: {
          fullName: order.shippingAddress.fullName,
          email: order.user.email,
          phone: order.shippingAddress.phone,
          alternatePhone: order.alternatePhone || '',
          address: {
            line1: order.shippingAddress.address,
            line2: '',
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip: order.shippingAddress.postalCode,
            country: order.shippingAddress.country
          }
        },
        order: {
          items: order.items.map(item => {
            // Get product details if available
            const productDetails = item.product ? {
              category: item.product.category || 'N/A',
              subCategory: item.product.subCategories && item.product.subCategories.length > 0 
                ? item.product.subCategories[0] 
                : 'N/A',
              volume: item.product.volume || 'N/A',
              image: item.product.mainImage || item.image || '/placeholder-product.jpg'
            } : {
              category: 'N/A',
              subCategory: 'N/A',
              volume: 'N/A',
              image: item.image || '/placeholder-product.jpg'
            };
            
            return {
              name: item.name,
              category: productDetails.category,
              subCategory: productDetails.subCategory,
              volume: productDetails.volume,
              image: productDetails.image,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity
            };
          })
        },
        payment: {
          id: razorpay_payment_id,
          amount: order.totalPrice,
          method: order.paymentMethod,
          date: formattedDate
        }
      };

      await sendOrderConfirmationEmail(emailData);
      
      // Send SMS notification
      const trackingLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://avitoluxury.in'}/order-tracking?tracking_id=${order.trackingId}`;
      
      await sendOrderConfirmationSMS({
        phone: order.shippingAddress.phone,
        trackingId: order.trackingId,
        transactionId: razorpay_payment_id,
        totalAmount: order.totalPrice,
        trackingLink
      });
      
    } catch (emailError) {
      console.error('Failed to send order confirmation email or SMS:', emailError);
      // Don't fail the request if email/SMS sending fails
    }
    
    return NextResponse.json({
      success: true,
      trackingId: order.trackingId
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 