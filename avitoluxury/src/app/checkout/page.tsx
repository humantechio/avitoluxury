'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertCircle } from 'react-icons/fi';
import OTPVerificationModal from '@/app/checkout/components/OTPVerificationModal';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  houseNo: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    houseNo: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  
  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        
        // Calculate subtotal
        const total = parsedCart.reduce((sum: number, item: any) => {
          const itemPrice = item.discountedPrice || item.price;
          return sum + (itemPrice * item.quantity);
        }, 0);
        
        setSubtotal(total);
        setIsCartEmpty(parsedCart.length === 0);
      } else {
        setIsCartEmpty(true);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setIsCartEmpty(true);
    }
  }, []);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // If pincode is entered and it's 6 digits, fetch city and state
    if (name === 'pincode' && value.length === 6) {
      fetchCityAndStateByPincode(value);
    }
  };

  // Fetch city and state by pincode
  const fetchCityAndStateByPincode = async (pincode: string) => {
    try {
      console.log('Fetching city and state for pincode:', pincode);
      const response = await fetch(`/api/checkout/pincode-lookup?pincode=${pincode}`);
      const data = await response.json();
      console.log('Pincode lookup response:', data);
      
      if (data.success) {
        console.log('Setting city to:', data.data.city);
        console.log('Setting state to:', data.data.state);
        
        // Get the state value from the API response
        const stateValue = data.data.state;
        
        // Check if the state from API matches any option in our select dropdown
        const stateExists = [
          "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
          "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
          "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
          "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
          "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
        ].includes(stateValue);
        
        console.log('State exists in dropdown:', stateExists);
        
        // Update form data with city and state
        setFormData(prev => {
          const updated = {
            ...prev,
            city: data.data.city,
            state: stateExists ? stateValue : prev.state
          };
          console.log('Updated form data:', updated);
          return updated;
        });
        
        // Clear any errors for city and state
        setErrors(prev => ({
          ...prev,
          city: undefined,
          state: undefined
        }));
      } else {
        console.error('Pincode lookup failed:', data.error);
      }
    } catch (error) {
      console.error('Error fetching city and state:', error);
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    // Required fields validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.houseNo.trim()) newErrors.houseNo = 'House/Flat No is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setOtpError(null);
      
      try {
        // Send OTP via 2Factor
        const response = await fetch('/api/checkout/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: formData.phone }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Show OTP verification modal
          setShowOTPModal(true);
        } else {
          // Show error
          setOtpError(data.error || 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        setOtpError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle OTP verification success
  const handleOTPVerified = () => {
    // Store form data in session storage for next step
    sessionStorage.setItem('checkout_form_data', JSON.stringify(formData));
    
    // Navigate to summary page
    router.push('/checkout/summary');
  };
  
  // If cart is empty, show empty cart message
  if (isCartEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-medium mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Add some products to your cart before proceeding to checkout.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
        >
          Continue Shopping
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-medium mb-8">Checkout</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-medium mb-6">Your Information</h2>
        
        <form onSubmit={handleSubmit}>
          {otpError && (
            <div className="mb-4 flex items-start bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <FiAlertCircle className="mt-1 text-yellow-500 mr-3 w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-semibold text-yellow-800">Warning</div>
                <div className="text-yellow-700 text-sm">{otpError}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.fullName}
                </p>
              )}
            </div>
            
            {/* Email */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.email}
                </p>
              )}
            </div>
            
            {/* Phone Number */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number* (for OTP)
              </label>
              <div className="flex">
                <div className="flex items-center bg-gray-100 px-3 border border-r-0 border-gray-300 rounded-l-md">
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-r-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.phone}
                </p>
              )}
            </div>
            
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
            </div>
            
            {/* House No */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700 mb-1">
                House/Flat No*
              </label>
              <input
                type="text"
                id="houseNo"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.houseNo ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.houseNo && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.houseNo}
                </p>
              )}
            </div>
            
            {/* Address */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address/Building Name*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.address}
                </p>
              )}
            </div>
            
            {/* Landmark */}
            <div className="col-span-2">
              <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
                Landmark*
              </label>
              <input
                type="text"
                id="landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${errors.landmark ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.landmark && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.landmark}
                </p>
              )}
            </div>
            
            {/* City */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                readOnly={formData.city !== ''}
                className={`w-full p-2 border rounded-md ${errors.city ? 'border-red-500' : formData.city ? 'border-gray-300 bg-gray-50' : 'border-gray-300'}`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.city}
                </p>
              )}
            </div>
            
            {/* State */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State*
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={formData.state !== ''}
                className={`w-full p-2 border rounded-md ${errors.state ? 'border-red-500' : formData.state ? 'border-gray-300 bg-gray-50' : 'border-gray-300'}`}
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Delhi">Delhi</option>
              </select>
              {errors.state && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.state}
                </p>
              )}
            </div>
            
            {/* Pincode */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode* <span className="text-xs text-gray-500">(Auto-fills city & state)</span>
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={(e) => {
                  // Only allow numbers and max 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData(prev => ({
                    ...prev,
                    pincode: value
                  }));
                  
                  if (errors.pincode) {
                    setErrors(prev => ({
                      ...prev,
                      pincode: undefined
                    }));
                  }
                  
                  // If pincode is 6 digits, fetch city and state
                  if (value.length === 6) {
                    fetchCityAndStateByPincode(value);
                  }
                }}
                className={`w-full p-2 border rounded-md ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                maxLength={6}
                placeholder="Enter 6-digit pincode"
              />
              {errors.pincode && (
                <p className="mt-1 text-sm text-red-500 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.pincode}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {isLoading ? 'Processing...' : 'Proceed'}
            </button>
          </div>
        </form>
      </div>
      
      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phone={formData.phone}
        onVerified={handleOTPVerified}
      />
    </div>
  );
} 