'use client';

import React from 'react';
import Image from 'next/image';
import { getOptimizedUrl } from '@/app/lib/cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  crop?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  objectPosition?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * CloudinaryImage component for optimized image loading
 * Uses Next.js Image with Cloudinary transformations
 */
const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  quality = 80,
  crop = 'fill',
  objectFit,
  objectPosition,
  style,
  onLoad,
  onError
}) => {
  // Get optimized URL if it's a Cloudinary URL
  const optimizedSrc = src?.includes('res.cloudinary.com') 
    ? getOptimizedUrl(src, width, height, crop) 
    : src;
  
  // Handle when source is empty or undefined
  if (!optimizedSrc) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }
  
  // Use Next.js Image component with the optimized URL
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      style={{
        objectFit,
        objectPosition,
        ...style
      }}
      onLoad={onLoad}
      onError={onError}
    />
  );
};

export default CloudinaryImage; 