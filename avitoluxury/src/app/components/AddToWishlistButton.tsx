'use client';

import React from 'react';

interface AddToWishlistButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  className?: string;
  filled?: boolean;
  iconOnly?: boolean;
}

// This component is disabled as wishlist functionality has been removed
export default function AddToWishlistButton({
  className = '',
}: Partial<AddToWishlistButtonProps>) {
  // Return null to render nothing
  return null;
} 