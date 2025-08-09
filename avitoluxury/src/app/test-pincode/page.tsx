'use client';

import { useState } from 'react';

export default function TestPincodePage() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(value);
    
    if (value.length === 6) {
      fetchPincodeData(value);
    }
  };

  const fetchPincodeData = async (pincode: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/checkout/pincode-lookup?pincode=${pincode}`);
      const data = await response.json();
      
      console.log('API Response:', data);
      setResult(data);
      
      if (!data.success) {
        setError(data.error || 'Failed to fetch pincode data');
      }
    } catch (err) {
      console.error('Error fetching pincode data:', err);
      setError('An error occurred while fetching pincode data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pincode API Test</h1>
      
      <div className="mb-6">
        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
          Enter Pincode
        </label>
        <input
          type="text"
          id="pincode"
          value={pincode}
          onChange={handlePincodeChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          maxLength={6}
          placeholder="Enter 6-digit pincode"
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter a 6-digit pincode to test the API
        </p>
      </div>
      
      {loading && (
        <div className="text-blue-600 mb-4">Loading...</div>
      )}
      
      {error && (
        <div className="text-red-600 mb-4">{error}</div>
      )}
      
      {result && result.success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-green-800 mb-2">Result:</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">City:</div>
            <div>{result.data.city}</div>
            <div className="font-medium">State:</div>
            <div>{result.data.state}</div>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">API Response:</h3>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
          {result ? JSON.stringify(result, null, 2) : 'No data yet'}
        </pre>
      </div>
    </div>
  );
} 