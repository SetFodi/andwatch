// components/SafeImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function SafeImage({ 
  src, 
  alt, 
  width = 400, 
  height = 600, 
  className = "object-cover w-full h-full",
  priority = false
}: SafeImageProps) {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-700">
        No Image Available
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}