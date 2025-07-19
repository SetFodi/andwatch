'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onAction: () => void | Promise<void>;
  threshold?: number;
}

interface SwipeGesturesProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  className?: string;
  disabled?: boolean;
  snapThreshold?: number;
  vibration?: boolean;
}

const DEFAULT_LEFT_ACTIONS: SwipeAction[] = [
  {
    id: 'add-watchlist',
    label: 'Add to Watchlist',
    color: 'text-white',
    bgColor: 'bg-indigo-500',
    threshold: 80,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    onAction: () => console.log('Added to watchlist'),
  },
];

const DEFAULT_RIGHT_ACTIONS: SwipeAction[] = [
  {
    id: 'mark-completed',
    label: 'Mark Completed',
    color: 'text-white',
    bgColor: 'bg-green-500',
    threshold: 80,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    onAction: () => console.log('Marked as completed'),
  },
  {
    id: 'remove',
    label: 'Remove',
    color: 'text-white',
    bgColor: 'bg-red-500',
    threshold: 120,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    onAction: () => console.log('Removed item'),
  },
];

export default function SwipeGestures({
  children,
  leftActions = DEFAULT_LEFT_ACTIONS,
  rightActions = DEFAULT_RIGHT_ACTIONS,
  onSwipeStart,
  onSwipeEnd,
  className = '',
  disabled = false,
  snapThreshold = 50,
  vibration = true
}: SwipeGesturesProps) {
  const [isActive, setIsActive] = useState(false);
  const [activeAction, setActiveAction] = useState<SwipeAction | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const vibrated = useRef(false);

  // Transform values for visual feedback
  const leftProgress = useTransform(x, [0, 100], [0, 1]);
  const rightProgress = useTransform(x, [-100, 0], [1, 0]);
  const opacity = useTransform(x, [-150, -50, 0, 50, 150], [1, 0.7, 0, 0.7, 1]);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!vibration || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    
    navigator.vibrate(patterns[type]);
  }, [vibration]);

  // Handle pan start
  const handlePanStart = useCallback(() => {
    if (disabled) return;
    
    setIsActive(true);
    setIsDragging(true);
    vibrated.current = false;
    
    if (onSwipeStart) onSwipeStart();
  }, [disabled, onSwipeStart]);

  // Handle pan (during drag)
  const handlePan = useCallback((_: any, info: PanInfo) => {
    if (disabled || !isDragging) return;

    const currentX = info.offset.x;
    x.set(currentX);

    // Determine active action based on swipe direction and distance
    let newActiveAction: SwipeAction | null = null;

    if (currentX > 0 && leftActions.length > 0) {
      // Swiping right (left actions)
      for (let i = leftActions.length - 1; i >= 0; i--) {
        const action = leftActions[i];
        if (Math.abs(currentX) >= (action.threshold || 80)) {
          newActiveAction = action;
          break;
        }
      }
    } else if (currentX < 0 && rightActions.length > 0) {
      // Swiping left (right actions)
      for (let i = rightActions.length - 1; i >= 0; i--) {
        const action = rightActions[i];
        if (Math.abs(currentX) >= (action.threshold || 80)) {
          newActiveAction = action;
          break;
        }
      }
    }

    // Trigger haptic feedback when crossing threshold
    if (newActiveAction && newActiveAction !== activeAction && !vibrated.current) {
      triggerHaptic('medium');
      vibrated.current = true;
    }

    setActiveAction(newActiveAction);
  }, [disabled, isDragging, leftActions, rightActions, activeAction, triggerHaptic, x]);

  // Handle pan end
  const handlePanEnd = useCallback(async (_: any, info: PanInfo) => {
    if (disabled) return;

    setIsDragging(false);
    const currentX = info.offset.x;
    
    // Execute action if threshold is met
    if (activeAction && Math.abs(currentX) >= (activeAction.threshold || 80)) {
      triggerHaptic('heavy');
      
      try {
        await activeAction.onAction();
      } catch (error) {
        console.error('Swipe action failed:', error);
      }
    }

    // Reset state
    x.set(0);
    setActiveAction(null);
    setIsActive(false);
    vibrated.current = false;
    
    if (onSwipeEnd) onSwipeEnd();
  }, [disabled, activeAction, triggerHaptic, onSwipeEnd, x]);

  // Render action indicators
  const renderActionIndicators = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (!isDragging && !activeAction) return null;

    return (
      <div className={`absolute top-0 bottom-0 flex items-center ${
        side === 'left' ? 'left-0 pl-4' : 'right-0 pr-4'
      }`}>
        {actions.map((action, index) => {
          const isActionActive = activeAction?.id === action.id;
          const progress = side === 'left' ? leftProgress : rightProgress;
          
          return (
            <motion.div
              key={action.id}
              className={`flex items-center justify-center w-16 h-16 rounded-full mx-2 ${action.bgColor} ${action.color}`}
              style={{
                opacity: progress,
                scale: useTransform(progress, [0, 1], [0.8, isActionActive ? 1.2 : 1])
              }}
            >
              <motion.div
                animate={{
                  scale: isActionActive ? [1, 1.2, 1] : 1,
                  rotate: isActionActive ? [0, 10, -10, 0] : 0
                }}
                transition={{
                  duration: 0.3,
                  repeat: isActionActive ? Infinity : 0,
                  repeatType: "reverse"
                }}
              >
                {action.icon}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {/* Left action indicators */}
      {renderActionIndicators(leftActions, 'left')}
      
      {/* Right action indicators */}
      {renderActionIndicators(rightActions, 'right')}

      {/* Main swipeable content */}
      <motion.div
        style={{ 
          x,
          opacity: isDragging ? opacity : 1
        }}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.1}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        className="relative z-10 bg-inherit"
        whileTap={{ scale: isDragging ? 1 : 0.98 }}
      >
        {children}
      </motion.div>

      {/* Active action feedback */}
      {activeAction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className={`px-3 py-2 rounded-full ${activeAction.bgColor} ${activeAction.color} text-sm font-medium shadow-lg`}>
            {activeAction.label}
          </div>
        </motion.div>
      )}

      {/* Swipe hint indicator */}
      {!isActive && !isDragging && (leftActions.length > 0 || rightActions.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 pointer-events-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

// Quick swipe actions for common use cases
export function QuickSwipeActions({
  children,
  onAddToWatchlist,
  onMarkCompleted,
  onRemove,
  onEdit,
  className = ''
}: {
  children: React.ReactNode;
  onAddToWatchlist?: () => void | Promise<void>;
  onMarkCompleted?: () => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  onEdit?: () => void | Promise<void>;
  className?: string;
}) {
  const leftActions: SwipeAction[] = [];
  const rightActions: SwipeAction[] = [];

  if (onAddToWatchlist) {
    leftActions.push({
      id: 'add-watchlist',
      label: 'Add to Watchlist',
      color: 'text-white',
      bgColor: 'bg-indigo-500',
      threshold: 80,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onAction: onAddToWatchlist,
    });
  }

  if (onEdit) {
    leftActions.push({
      id: 'edit',
      label: 'Edit',
      color: 'text-white',
      bgColor: 'bg-blue-500',
      threshold: 120,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onAction: onEdit,
    });
  }

  if (onMarkCompleted) {
    rightActions.push({
      id: 'mark-completed',
      label: 'Mark Completed',
      color: 'text-white',
      bgColor: 'bg-green-500',
      threshold: 80,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      onAction: onMarkCompleted,
    });
  }

  if (onRemove) {
    rightActions.push({
      id: 'remove',
      label: 'Remove',
      color: 'text-white',
      bgColor: 'bg-red-500',
      threshold: 120,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onAction: onRemove,
    });
  }

  return (
    <SwipeGestures
      leftActions={leftActions}
      rightActions={rightActions}
      className={className}
    >
      {children}
    </SwipeGestures>
  );
}

// Hook for detecting swipe gestures
export function useSwipeGesture(threshold: number = 50) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setSwipeDirection(null);
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;
    
    // Check if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    }
  }, [threshold]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return swipeDirection;
} 