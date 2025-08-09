'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FiDownload, FiPrinter, FiShare2, FiLoader } from 'react-icons/fi';

export default function PublicInvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${id}/invoice`);
        
        if (!response.ok) {
          throw new Error('Failed to load invoice');
        }
        
        const data = await response.json();
        
        if (!data.success || !data.invoice) {
          throw new Error(data.error || 'Failed to load invoice');
        }
        
        setInvoice(data.invoice);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${invoice?.invoiceNumber}`,
          text: `Your invoice from AVITO LUXURY`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support sharing
      navigator.clipboard.writeText(window.location.href);
      alert('Invoice link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <FiLoader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
          <p className="mt-4 text-gray-600">
            If you believe this is a mistake, please contact our customer support.
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">
        {/* Invoice Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
            <p className="text-gray-600">{invoice.invoiceNumber}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex space-x-2 print:hidden">
              <button 
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiPrinter className="mr-2" />
                Print
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <FiShare2 className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Bill To</h2>
              <p className="text-gray-700">{invoice.customer.name}</p>
              <p className="text-gray-700">{invoice.customer.email}</p>
              <p className="text-gray-700">{invoice.customer.phone}</p>
              <p className="text-gray-700">{invoice.customer.address.line1}</p>
              <p className="text-gray-700">
                {invoice.customer.address.city}, {invoice.customer.address.state} {invoice.customer.address.postalCode}
              </p>
              <p className="text-gray-700">{invoice.customer.address.country}</p>
            </div>
            <div className="md:text-right">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Invoice Details</h2>
              <p className="text-gray-700">
                <span className="font-medium">Invoice Date:</span> {new Date(invoice.date).toLocaleDateString()}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Order ID:</span> {invoice.orderId}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Payment Method:</span> {invoice.paymentMethod}
              </p>
              {invoice.deliveryDate && (
                <p className="text-gray-700">
                  <span className="font-medium">Delivery Date:</span> {new Date(invoice.deliveryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right font-medium">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 mb-8">
            <div className="flex justify-end">
              <div className="w-full sm:w-1/2 md:w-1/3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">₹{invoice.shipping.toFixed(2)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-800">₹{invoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-gray-800 text-red-600">-₹{invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                  <span>Total</span>
                  <span>₹{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Thank you for your purchase!</h3>
              <p className="text-gray-600">We appreciate your business and hope you enjoy your products.</p>
            </div>
            <div className="text-sm text-gray-500">
              <p>AVITO LUXURY</p>
              <p>contact@avitoluxury.in</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 