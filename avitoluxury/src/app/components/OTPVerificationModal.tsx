'use client';

import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  phone,
  onVerified
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Start countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(60);
      setCanResend(false);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isOpen]);
  
  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle OTP verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      // Reset error
      setError('');
      
      // Validate OTP
      if (!otp || otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP');
        return;
      }
      
      // Set loading state
      setLoading(true);
      
      // Call API to verify OTP
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, otp })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to verify OTP');
        return;
      }
      
      // Call onVerified callback
      onVerified();
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Reset states
      setError('');
      setResendLoading(true);
      
      // Call API to resend OTP
      const response = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to resend OTP');
        return;
      }
      
      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center"
      onClick={(e) => {
        // Only close when explicitly clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Verify Phone Number</h2>
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
        
        <form onSubmit={handleVerify}>
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              We've sent a verification code to <span className="font-semibold">+91 {phone}</span>
            </p>
            
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm text-gray-700 mb-2">
                Enter 6-digit OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  // Only allow numbers and max 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter OTP"
                className={`w-full p-3 border rounded-md ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={6}
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {canResend ? (
                  'Didn\'t receive the code?'
                ) : (
                  `Resend OTP in ${formatTime(countdown)}`
                )}
              </p>
              
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || resendLoading}
                className={`text-sm ${
                  canResend && !resendLoading
                    ? 'text-blue-600 hover:text-blue-800'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {resendLoading ? (
                  <span className="flex items-center">
                    <FiLoader className="animate-spin mr-2" />
                    Sending...
                  </span>
                ) : (
                  'Resend OTP'
                )}
              </button>
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
              disabled={loading || otp.length !== 6}
              className={`px-4 py-2 rounded-md flex items-center ${
                loading || otp.length !== 6
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 