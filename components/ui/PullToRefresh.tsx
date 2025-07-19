'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPull?: number;
  className?: string;
  disabled?: boolean;
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  className = '',
  disabled = false
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const y = useMotionValue(0);
  const spring = useSpring(y, { damping: 15, stiffness: 300 });
  
  // Transform pull distance to opacity and rotation
  const opacity = useTransform(y, [0, threshold], [0, 1]);
  const rotate = useTransform(y, [0, threshold], [0, 180]);
  const scale = useTransform(y, [0, threshold], [0.8, 1.2]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      const pullDistance = Math.min(diff * 0.4, maxPull);
      y.set(pullDistance);
      
      // Haptic feedback at threshold
      if (pullDistance >= threshold && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [isPulling, disabled, isRefreshing, threshold, maxPull, y]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    const pullDistance = y.get();
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          y.set(0);
        }, 300);
      }
    } else {
      y.set(0);
    }
  }, [isPulling, disabled, isRefreshing, threshold, onRefresh, y]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Pull to refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center"
        style={{
          y: spring,
          transformOrigin: 'center bottom'
        }}
      >
        <motion.div
          className="flex flex-col items-center py-4 px-6 bg-gray-900/90 backdrop-blur-sm rounded-b-2xl border-t-0 border border-gray-700/50 shadow-xl"
          style={{ opacity, scale }}
        >
          <motion.div
            className="w-8 h-8 mb-2"
            style={{ rotate }}
          >
            {isRefreshing ? (
              <div className="w-full h-full border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-full h-full text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </motion.div>
          
          <motion.span
            className="text-sm font-medium text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isRefreshing 
              ? 'Refreshing...' 
              : y.get() >= threshold 
                ? 'Release to refresh' 
                : 'Pull to refresh'
            }
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Main content */}
      <motion.div style={{ y: spring }}>
        {children}
      </motion.div>
    </div>
  );
}

// Hook for manual refresh trigger
export function useRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async (refreshFn: () => Promise<void> | void) => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, [isRefreshing]);

  return { isRefreshing, refresh };
}

// Simplified version for desktop with button
export function RefreshButton({ 
  onRefresh, 
  isRefreshing = false, 
  className = '' 
}: {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  className?: string;
}) {
  const handleClick = async () => {
    if (isRefreshing) return;
    await onRefresh();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isRefreshing}
      className={`inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/50 rounded-lg text-white/90 transition-all duration-200 ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={{ rotate: isRefreshing ? 360 : 0 }}
        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </motion.div>
      <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
    </motion.button>
  );
} 