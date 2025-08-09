'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiAlertCircle, FiShield, FiCheckCircle, FiLock, FiKey } from 'react-icons/fi';
import { saveAdminAuth } from '@/app/lib/admin-auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState(''); // Make email field empty and editable
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'password' | 'otp' | 'forgot' | 'reset'>('password');
  const [debug, setDebug] = useState<string[]>([]);
  const router = useRouter();
  
  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // Handle password submission
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      addDebug(`Attempting login with email: ${email}`);
      
      // Use the direct login API that verifies credentials and sends OTP in one step
      addDebug('Sending direct login request');
      const res = await fetch('/api/auth/admin-direct-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store'
      });
      
      addDebug(`Direct login response status: ${res.status}`);
      const data = await res.json();
      addDebug(`Direct login response: ${JSON.stringify(data)}`);
      
      if (data.success) {
        setStep('otp');
        setSuccess('OTP sent to your email address. Please check your inbox.');
        addDebug('OTP sent successfully');
      } else {
        setError(data.error || 'Invalid email or password. Please try again.');
        addDebug(`Login error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please try again.');
      addDebug(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP verification
  const handleOTPSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      addDebug(`Verifying OTP: ${otp}`);
      
      // Verify OTP
      const res = await fetch('/api/auth/admin-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        cache: 'no-store'
      });
      
      addDebug(`OTP verification response status: ${res.status}`);
      const data = await res.json();
      addDebug(`OTP verification response: ${JSON.stringify(data)}`);
      
      if (data.success && data.token) {
        // Use the imported saveAdminAuth function
        saveAdminAuth(data.token, data.user);
        addDebug('Authentication successful, redirecting to dashboard');
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        addDebug(`OTP verification error: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify OTP. Please try again.');
      addDebug(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password request
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your admin email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const res = await fetch('/api/auth/admin-password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        cache: 'no-store'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStep('reset');
        setSuccess('If the email exists, a password reset OTP has been sent. Please check your inbox.');
      } else {
        setError(data.error || 'Failed to process your request. Please try again.');
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/auth/admin-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
        cache: 'no-store'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSuccess(data.message || 'Password reset successful. You can now login with your new password.');
        setStep('password');
        setPassword('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 sm:p-6">
            <div className="flex items-center justify-center">
              <FiShield className="text-white h-8 w-8 sm:h-10 sm:w-10" />
              <img src="/avito3-15.png" alt="Logo" className="h-20 sm:h-10 ml-2" />
            </div>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Administrator Login</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {step === 'password' && 'Enter your password to continue'}
                {step === 'otp' && 'Enter the OTP sent to your email'}
                {step === 'forgot' && 'Enter your admin email to reset password'}
                {step === 'reset' && 'Enter OTP and new password'}
              </p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiCheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            
            {step === 'password' && (
              <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg bg-gray-50"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}

            {step === 'forgot' && (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                    Admin Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="forgot-email"
                      name="forgot-email"
                      type="email"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg bg-gray-50"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your admin email"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Reset OTP'
                    )}
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('password');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
            
            {step === 'otp' && (
              <form className="space-y-6" onSubmit={handleOTPSubmit}>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    OTP Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 text-center text-2xl tracking-widest font-mono border-gray-300 rounded-lg"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('password');
                      setOtp('');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Back to Password
                  </button>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form className="space-y-6" onSubmit={handleResetPassword}>
                <div>
                  <label htmlFor="reset-otp" className="block text-sm font-medium text-gray-700">
                    OTP Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="reset-otp"
                      name="reset-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 text-center text-2xl tracking-widest font-mono border-gray-300 rounded-lg"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiKey className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-3 text-sm border-gray-300 rounded-lg"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('password');
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
            
            {/* {process.env.NODE_ENV === 'development' && debug.length > 0 && (
              <div className="mt-8 p-3 bg-gray-100 rounded-md text-xs overflow-auto max-h-40">
                <h3 className="font-bold mb-2">Debug Log:</h3>
                {debug.map((msg, i) => (
                  <div key={i} className="mb-1">{msg}</div>
                ))}
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
} 