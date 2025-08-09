'use client';

import { useState } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface PhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string) => void;
}

export default function PhoneNumberModal({
  isOpen,
  onClose,
  onSubmit
}: PhoneNumberModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Reset error
      setError('');
      
      // Validate phone number (basic validation)
      if (!phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }
      
      // Set loading state
      setLoading(true);
      
      // Call onSubmit callback with the phone number
      onSubmit(phone);
      
    } catch (error) {
      console.error('Error submitting phone number:', error);
      setError('An error occurred. Please try again.');
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
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Enter Phone Number</h2>
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
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Please enter your phone number to continue with checkout
            </p>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <div className="bg-gray-100 p-3 border border-r-0 rounded-l-md border-gray-300">
                  +91
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    // Only allow numbers and max 10 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                    setError('');
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Enter 10-digit number"
                  className={`w-full p-3 border rounded-r-md ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={10}
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
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
                'Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 