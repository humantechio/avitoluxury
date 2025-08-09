'use client';

import { useState } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface GuestCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (address: GuestAddressInfo) => void;
}

interface GuestAddressInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function GuestCheckoutModal({
  isOpen,
  onClose,
  onSubmit
}: GuestCheckoutModalProps) {
  const [formData, setFormData] = useState<GuestAddressInfo>({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof GuestAddressInfo, string>>>({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name as keyof GuestAddressInfo]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Fetch city and state by pincode
  const fetchCityAndStateByPincode = async (pincode: string) => {
    try {
      console.log('GuestModal: Fetching city and state for pincode:', pincode);
      const response = await fetch(`/api/checkout/pincode-lookup?pincode=${pincode}`);
      const data = await response.json();
      console.log('GuestModal: Pincode lookup response:', data);
      
      if (data.success) {
        console.log('GuestModal: Setting city to:', data.data.city);
        console.log('GuestModal: Setting state to:', data.data.state);
        
        // Update form data with city and state
        setFormData(prev => {
          const updated = {
            ...prev,
            city: data.data.city,
            state: data.data.state
          };
          console.log('GuestModal: Updated form data:', updated);
          return updated;
        });
        
        // Clear any errors for city and state
        setErrors(prev => ({
          ...prev,
          city: '',
          state: ''
        }));
      } else {
        console.error('GuestModal: Pincode lookup failed:', data.error);
      }
    } catch (error) {
      console.error('GuestModal: Error fetching city and state:', error);
    }
  };
  
  const validateForm = () => {
    const newErrors: Partial<Record<keyof GuestAddressInfo, string>> = {};
    let isValid = true;
    
    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    
    // Validate city
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
      isValid = false;
    }
    
    // Validate state
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
      isValid = false;
    }
    
    // Validate pincode
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Call onSubmit callback with the address information
      onSubmit(formData);
      
    } catch (error) {
      console.error('Error submitting guest checkout info:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center"
      onClick={(e) => {
        // Do not close modal when clicking backdrop
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Shipping Information</h2>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm text-gray-700 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm text-gray-700 mb-1">
                Address*
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-3 border rounded-md ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full address"
                rows={3}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  readOnly={formData.city !== ''}
                  className={`w-full p-3 border rounded-md ${
                    errors.city ? 'border-red-500' : formData.city ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
                  }`}
                  placeholder="City"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm text-gray-700 mb-1">
                  State*
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  readOnly={formData.state !== ''}
                  className={`w-full p-3 border rounded-md ${
                    errors.state ? 'border-red-500' : formData.state ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
                  }`}
                  placeholder="State"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="pincode" className="block text-sm text-gray-700 mb-1">
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
                      pincode: ''
                    }));
                  }
                  
                  // If pincode is 6 digits, fetch city and state
                  if (value.length === 6) {
                    fetchCityAndStateByPincode(value);
                  }
                }}
                className={`w-full p-3 border rounded-md ${
                  errors.pincode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="6-digit pincode"
                maxLength={6}
              />
              {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <FiLoader className="animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                'Continue to Checkout'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 