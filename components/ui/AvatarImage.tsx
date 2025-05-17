'use client';

import { useState } from 'react';
import Image from 'next/image';

interface AvatarImageProps {
  src: string | null;
  alt: string;
  fallbackText: string;
  size?: number;
  className?: string;
}

export default function AvatarImage({
  src,
  alt,
  fallbackText,
  size = 40,
  className = ''
}: AvatarImageProps) {
  const [error, setError] = useState(false);

  // If no src or error loading, show fallback
  if (!src || error) {
    return (
      <div className={`flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-600/80 to-violet-600/80 ${className}`}>
        <span className="text-white font-medium">{fallbackText}</span>
      </div>
    );
  }

  // Otherwise show the image with error handling
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className={`object-cover ${className}`}
        onError={() => setError(true)}
        priority
      />
    </div>
  );
}
