'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  aspectRatio?: string;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc,
  showLoadingState = true,
  aspectRatio,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate blur placeholder if not provided
  const generateBlurPlaceholder = (w = 8, h = 8) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = w;
    canvas.height = h;
    
    // Create a simple gradient blur placeholder
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#1f2937');
    gradient.addColorStop(0.5, '#374151');
    gradient.addColorStop(1, '#111827');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || generateBlurPlaceholder();

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    }
  };

  // Error fallback component
  const ErrorFallback = () => (
    <div className={`flex items-center justify-center bg-gray-800/60 ${className}`}>
      <div className="text-center p-4">
        <svg 
          className="w-12 h-12 mx-auto text-gray-600 mb-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        <p className="text-gray-500 text-sm">Image unavailable</p>
      </div>
    </div>
  );

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className={`relative overflow-hidden bg-gray-800/30 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
        animate={{
          x: [-200, 200]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );

  if (hasError && !fallbackSrc) {
    return <ErrorFallback />;
  }

  const containerStyle = aspectRatio ? { aspectRatio } : {};
  const imageProps = {
    src: currentSrc,
    alt,
    quality,
    priority,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    className: `transition-opacity duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    } ${className}`,
    ...(placeholder === 'blur' && { placeholder: 'blur', blurDataURL: defaultBlurDataURL }),
    ...(width && height && { width, height }),
  };

  return (
    <div className="relative" style={containerStyle}>
      {showLoadingState && !isLoaded && <LoadingSkeleton />}
      
      {width && height ? (
        <Image {...imageProps} />
      ) : (
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
      )}

      {/* Loading indicator */}
      {showLoadingState && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      )}
    </div>
  );
}

// Progressive image loader with multiple sources
export function ProgressiveImage({
  sources,
  alt,
  className = '',
  fallback,
}: {
  sources: { src: string; type?: string; media?: string }[];
  alt: string;
  className?: string;
  fallback?: string;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadImage = async () => {
      for (const source of sources) {
        if (isCancelled) return;

        try {
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = source.src;
          });

          if (!isCancelled) {
            setLoadedSrc(source.src);
            setIsLoading(false);
            break;
          }
        } catch {
          continue;
        }
      }

      if (!isCancelled && !loadedSrc && fallback) {
        setLoadedSrc(fallback);
        setIsLoading(false);
      }
    };

    loadImage();

    return () => {
      isCancelled = true;
    };
  }, [sources, fallback, loadedSrc]);

  if (isLoading) {
    return (
      <div className={`bg-gray-800/60 animate-pulse ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (!loadedSrc) {
    return (
      <div className={`bg-gray-800/60 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={loadedSrc}
      alt={alt}
      className={className}
      showLoadingState={false}
    />
  );
}

// Lazy loading image with intersection observer
export function LazyImage({
  src,
  alt,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: OptimizedImageProps & {
  threshold?: number;
  rootMargin?: string;
}) {
  const [inView, setInView] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={imgRef} className={className}>
      {inView ? (
        <OptimizedImage
          src={src}
          alt={alt}
          className={className}
          {...props}
        />
      ) : (
        <div className={`bg-gray-800/30 animate-pulse ${className}`} />
      )}
    </div>
  );
}

// Image with zoom functionality
export function ZoomableImage({
  src,
  alt,
  className = '',
  zoomScale = 2,
  ...props
}: OptimizedImageProps & {
  zoomScale?: number;
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-lg cursor-zoom-in group">
      <motion.div
        animate={{
          scale: isZoomed ? zoomScale : 1
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        onClick={() => setIsZoomed(!isZoomed)}
        className="cursor-pointer"
      >
        <OptimizedImage
          src={src}
          alt={alt}
          className={`transition-transform duration-300 ${className}`}
          {...props}
        />
      </motion.div>
      
      {/* Zoom indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
} 