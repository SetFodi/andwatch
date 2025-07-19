'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string;
  height?: string;
  animation?: 'pulse' | 'wave' | 'shimmer';
}

// Base skeleton component
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  animation = 'shimmer'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-800/30 relative overflow-hidden';
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-sm'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    shimmer: ''
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{ width, height }}
    >
      {animation === 'shimmer' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"
          animate={{
            x: [-200, 200]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </div>
  );
}

// Media card skeleton
export function MediaCardSkeleton() {
  return (
    <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/40 p-0">
      <div className="aspect-[3/4] relative">
        <Skeleton height="100%" animation="shimmer" />
        {/* Status badge skeleton */}
        <div className="absolute top-2 left-2">
          <Skeleton width="60px" height="20px" className="rounded-full" />
        </div>
        {/* Type badge skeleton */}
        <div className="absolute top-2 right-2">
          <Skeleton width="40px" height="20px" className="rounded-full" />
        </div>
        {/* Rating badge skeleton */}
        <div className="absolute bottom-2 right-2">
          <Skeleton width="50px" height="24px" className="rounded-md" />
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <Skeleton height="20px" width="90%" />
        <Skeleton height="16px" width="70%" />
        
        {/* Details row skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton width="40px" height="12px" />
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <Skeleton width="50px" height="12px" />
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <Skeleton width="30px" height="12px" />
        </div>
        
        {/* Genres skeleton */}
        <div className="flex flex-wrap gap-1">
          <Skeleton width="45px" height="18px" className="rounded-full" />
          <Skeleton width="55px" height="18px" className="rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Grid skeleton for media grids
export function MediaGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MediaCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Profile header skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800/50 p-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar skeleton */}
        <div className="flex-shrink-0">
          <Skeleton variant="circular" width="128px" height="128px" />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          {/* Name skeleton */}
          <Skeleton height="32px" width="200px" className="mx-auto md:mx-0" />
          
          {/* Username skeleton */}
          <Skeleton height="20px" width="150px" className="mx-auto md:mx-0" />
          
          {/* Stats skeleton */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton height="24px" width="40px" className="mx-auto mb-1" />
                <Skeleton height="16px" width="60px" />
              </div>
            ))}
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-4">
            <Skeleton width="120px" height="40px" className="rounded-xl" />
            <Skeleton width="120px" height="40px" className="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

// List skeleton for simple lists
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton variant="circular" width="48px" height="48px" />
          <div className="flex-1 space-y-2">
            <Skeleton height="20px" width="60%" />
            <Skeleton height="16px" width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Search results skeleton
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800/40">
          {/* Poster skeleton */}
          <div className="flex-shrink-0">
            <Skeleton width="80px" height="120px" className="rounded-lg" />
          </div>
          
          <div className="flex-1 space-y-3">
            {/* Title skeleton */}
            <Skeleton height="24px" width="70%" />
            
            {/* Year and type skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton width="50px" height="16px" />
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <Skeleton width="40px" height="16px" />
            </div>
            
            {/* Description skeleton */}
            <div className="space-y-2">
              <Skeleton height="14px" width="100%" />
              <Skeleton height="14px" width="90%" />
              <Skeleton height="14px" width="60%" />
            </div>
            
            {/* Rating skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton width="60px" height="20px" className="rounded-full" />
              <Skeleton width="80px" height="20px" className="rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Reviews skeleton
export function ReviewsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          {/* Review header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Skeleton variant="circular" width="40px" height="40px" />
              <div>
                <Skeleton height="16px" width="100px" />
                <Skeleton height="12px" width="80px" className="mt-1" />
              </div>
            </div>
            <Skeleton width="60px" height="24px" className="rounded-full" />
          </div>
          
          {/* Review content */}
          <div className="space-y-2">
            <Skeleton height="16px" width="100%" />
            <Skeleton height="16px" width="95%" />
            <Skeleton height="16px" width="88%" />
            <Skeleton height="16px" width="70%" />
          </div>
        </div>
      ))}
    </div>
  );
} 