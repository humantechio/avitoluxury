'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestSMSPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('TX123456');
  const [amount, setAmount] = useState('1999');
  const [trackingId, setTrackingId] = useState('TRK789012');
  const [trackingLink, setTrackingLink] = useState('https://avitoluxury.in/track');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [configData, setConfigData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone,
          transactionId,
          amount,
          trackingId,
          trackingLink
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to send SMS');
        setResult(data);
      }
    } catch (err) {
      setError('An error occurred while sending the SMS');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    try {
      const response = await fetch('/api/sms-debug');
      const data = await response.json();
      setConfigData(data);
    } catch (err) {
      console.error('Failed to check config:', err);
      setConfigData({ error: 'Failed to check configuration' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">SMS Test Tool</h1>
        
        <div className="mb-4 text-center">
          <button 
            onClick={checkConfig}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            Check SMS Configuration
          </button>
        </div>
        
        {configData && (
          <div className="mb-6 p-3 bg-gray-50 rounded-md text-xs">
            <h3 className="font-medium mb-1">Configuration:</h3>
            <pre className="overflow-auto">{JSON.stringify(configData, null, 2)}</pre>
          </div>
        )}
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <h3 className="font-medium mb-1">Template Information:</h3>
          <p>Template Name: AVITO LUXURY</p>
          <p className="mt-1">Template Text: "Thank you for shopping with AVITO LUXURY. Your transaction ID is #VAR1#, amount paid ₹#VAR2#, tracking ID #VAR3#. Track your order here: #VAR4#. We hope to see you again!"</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number (e.g., 9876543210)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter 10-digit number without country code, or with +91 prefix
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID (VAR1)
            </label>
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (VAR2)
            </label>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking ID (VAR3)
            </label>
            <input
              type="text"
              id="trackingId"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="trackingLink" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Link (VAR4)
            </label>
            <input
              type="text"
              id="trackingLink"
              value={trackingLink}
              onChange={(e) => setTrackingLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white w-full ${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Sending...' : 'Send Test SMS'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-medium">Error</h3>
            <p className="text-red-700">{error}</p>
            {result && (
              <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
        
        {result && !error && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-800 font-medium">Success</h3>
            <p className="text-green-700">SMS sent successfully!</p>
            <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-500">
          This tool is for testing purposes only. Make sure your 2Factor.in API key is configured.
        </div>
      </div>
    </div>
  );
} 