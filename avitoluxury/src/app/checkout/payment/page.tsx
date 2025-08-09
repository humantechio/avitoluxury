'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [userDismissedModal, setUserDismissedModal] = useState(false);
  
  // Load order ID from session storage
  useEffect(() => {
    try {
      const storedOrderId = sessionStorage.getItem('checkout_order_id');
      if (!storedOrderId) {
        // Redirect to checkout page if order ID doesn't exist
        router.push('/checkout');
        return;
      }
      
      setOrderId(storedOrderId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading order ID:', error);
      setError('An error occurred while loading your order. Please try again.');
      setIsLoading(false);
    }
  }, [router]);
  
  // Handle Razorpay script load
  const handleScriptLoad = () => {
    console.log('Razorpay script loaded');
    setScriptLoaded(true);
  };
  
  // Initialize Razorpay payment
  const initializePayment = async () => {
    if (!orderId) {
      setError('Missing order information. Please try again.');
      return;
    }
    
    if (!scriptLoaded || !window.Razorpay) {
      setError('Payment gateway is not loaded. Please refresh the page.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch payment details from API
      const response = await fetch('/api/payment/razorpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }
      
      // Create Razorpay options
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'A V I T O   S C E N T S',
        description: 'Premium Fragrances',
        order_id: data.razorpayOrderId,
        handler: function(response: any) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone
        },
        notes: {
          orderId: orderId
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            setUserDismissedModal(true);
          }
        },
        // Add payment methods
        config: {
          display: {
            blocks: {
              utib: {
                name: 'Pay using UPI',
                instruments: [
                  {
                    method: 'upi'
                  }
                ]
              },
              other: {
                name: 'Other Payment Methods',
                instruments: [
                  {
                    method: 'card'
                  },
                  {
                    method: 'netbanking'
                  },
                  {
                    method: 'wallet'
                  }
                ]
              }
            },
            sequence: ['block.utib', 'block.other'],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        // Hide account section
        remember_customer: false,
        readonly: {
          email: true,
          contact: true
        },
        hide_account_section: true
      };
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize payment');
      setIsLoading(false);
    }
  };
  
  // Handle payment success
  const handlePaymentSuccess = async (response: any) => {
    try {
      setIsLoading(true);
      
      // Verify payment with server
      const verifyResponse = await fetch('/api/payment/razorpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        }),
      });
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
      
      // Payment successful
      setPaymentStatus('success');
      setTrackingId(verifyData.trackingId);
      
      // Clear cart
      localStorage.setItem('cart', '[]');
      
      // Clear checkout data
      sessionStorage.removeItem('checkout_form_data');
      sessionStorage.removeItem('checkout_order_id');
      
      // Dispatch event to update cart count in header
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      setError(error instanceof Error ? error.message : 'Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start payment when script is loaded and order ID is available
  useEffect(() => {
    if (scriptLoaded && orderId && paymentStatus === 'pending' && !isLoading && !userDismissedModal) {
      initializePayment();
    }
  }, [scriptLoaded, orderId, paymentStatus, isLoading, userDismissedModal]);
  
  return (
    <div className="max-w-lg mx-auto">
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={handleScriptLoad}
        onError={() => setError('Failed to load payment gateway. Please refresh the page.')}
      />
      
      <h1 className="text-2xl font-medium mb-8 text-center">Payment</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        {isLoading && (
          <div className="py-8">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
            <p className="text-gray-600">Processing your payment...</p>
          </div>
        )}
        
        {!isLoading && paymentStatus === 'success' && (
          <div className="py-8">
            <div className="flex justify-center mb-4">
              <FiCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-xl font-medium mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
            
            {trackingId && (
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
                <p className="font-medium">{trackingId}</p>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => router.push(`/order-tracking?tracking_id=${trackingId}`)}
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
              >
                Track Order
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 py-2 px-4 hover:text-black"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
        
        {!isLoading && paymentStatus === 'failed' && (
          <div className="py-8">
            <div className="flex justify-center mb-4">
              <FiAlertCircle className="text-red-500 text-5xl" />
            </div>
            <h2 className="text-xl font-medium mb-2">Payment Failed</h2>
            {error && <p className="text-red-500 mb-6">{error}</p>}
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setUserDismissedModal(false);
                  initializePayment();
                }}
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
              >
                Try Again
              </button>
              
              <button
                onClick={() => router.push('/checkout/summary')}
                className="text-gray-600 py-2 px-4 hover:text-black"
              >
                Back to Order Summary
              </button>
            </div>
          </div>
        )}
        
        {!isLoading && paymentStatus === 'pending' && error && (
          <div className="py-8">
            <div className="flex justify-center mb-4">
              <FiAlertCircle className="text-red-500 text-5xl" />
            </div>
            <h2 className="text-xl font-medium mb-2">Error</h2>
            <p className="text-red-500 mb-6">{error}</p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setUserDismissedModal(false);
                  initializePayment();
                }}
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
              >
                Try Again
              </button>
              
              <button
                onClick={() => router.push('/checkout/summary')}
                className="text-gray-600 py-2 px-4 hover:text-black"
              >
                Back to Order Summary
              </button>
            </div>
          </div>
        )}

        {!isLoading && paymentStatus === 'pending' && !error && userDismissedModal && (
          <div className="py-8">
            <h2 className="text-xl font-medium mb-4">Complete Your Payment</h2>
            <p className="text-gray-600 mb-6">You closed the payment window. Click below to reopen it and complete your payment.</p>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setUserDismissedModal(false);
                  initializePayment();
                }}
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800"
              >
                Proceed to Payment
              </button>
              
              <button
                onClick={() => router.push('/checkout/summary')}
                className="text-gray-600 py-2 px-4 hover:text-black"
              >
                Back to Order Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 