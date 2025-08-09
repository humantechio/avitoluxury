'use client';

import React from 'react';
import { FaShoppingBag } from 'react-icons/fa';
import Link from 'next/link';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
             {/* Logo */}
             <Link href="/" className="flex-shrink-0 flex gap-2 items-center">
              <img
                src="/avito3-16.png"
                alt="A V I T O   S C E N T S"
                className="h-20 w-auto"
              />
              
             
            </Link>
            <Link href="/cart" className="text-sm text-gray-600 hover:text-black">
              Return to cart
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} A V I T O   S C E N T S. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 