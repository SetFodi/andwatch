'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BulkItem {
  id: string;
  title: string;
  type?: 'anime' | 'movie' | 'tv';
  image?: string;
}

interface BulkOperationsProps {
  items: BulkItem[];
  onBulkAction: (action: string, selectedIds: string[]) => Promise<void>;
  actions?: BulkAction[];
  className?: string;
}

interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'danger' | 'warning';
  confirmMessage?: string;
}

const DEFAULT_ACTIONS: BulkAction[] = [
  {
    id: 'add-to-watchlist',
    label: 'Add to Watchlist',
    color: 'primary',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    id: 'mark-completed',
    label: 'Mark as Completed',
    color: 'success',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    id: 'remove-from-list',
    label: 'Remove from List',
    color: 'danger',
    confirmMessage: 'Are you sure you want to remove these items?',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
  },
  {
    id: 'change-status',
    label: 'Change Status',
    color: 'warning',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
];

export default function BulkOperations({
  items,
  onBulkAction,
  actions = DEFAULT_ACTIONS,
  className = ''
}: BulkOperationsProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems(new Set());
    }
  };

  // Select/deselect all items
  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // Toggle individual item selection
  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Execute bulk action
  const executeBulkAction = async (action: BulkAction) => {
    if (selectedItems.size === 0) return;

    if (action.confirmMessage) {
      if (!window.confirm(action.confirmMessage)) return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      await onBulkAction(action.id, Array.from(selectedItems));
      setSelectedItems(new Set());
    } catch (error) {
      console.error(`Failed to execute ${action.id}:`, error);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Get action button color classes
  const getActionColorClasses = (color?: string) => {
    switch (color) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            if (isSelectionMode) {
              e.preventDefault();
              toggleSelectAll();
            }
            break;
          case 'Escape':
            if (isSelectionMode) {
              setIsSelectionMode(false);
              setSelectedItems(new Set());
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelectionMode, selectedItems.size, items.length]);

  return (
    <div className={`relative ${className}`}>
      {/* Selection Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={toggleSelectionMode}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-600/50 rounded-lg text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{isSelectionMode ? 'Exit Selection' : 'Select Items'}</span>
        </button>

        {isSelectionMode && (
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>{selectedItems.size} of {items.length} selected</span>
            <button
              onClick={toggleSelectAll}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl p-4"
          >
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium mr-4">
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>

              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => executeBulkAction(action)}
                  disabled={isProcessing}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${getActionColorClasses(action.color)}`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}

              <button
                onClick={() => setSelectedItems(new Set())}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-gray-900/95 border border-gray-700/50 rounded-xl p-8 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <h3 className="text-white font-semibold mb-2">Processing...</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Applying bulk action to {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Checkboxes Overlay */}
      {isSelectionMode && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="absolute"
              style={{
                // Calculate position based on grid layout
                // This is a simplified calculation - adjust based on your actual grid
                left: `${(index % 5) * 20}%`,
                top: `${Math.floor(index / 5) * 200 + 8}px`,
              }}
            >
              <button
                onClick={() => toggleItemSelection(item.id)}
                className={`pointer-events-auto w-6 h-6 rounded-full border-2 transition-colors ${
                  selectedItems.has(item.id)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-gray-800/80 border-gray-600 hover:border-indigo-400'
                }`}
              >
                {selectedItems.has(item.id) && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selection Help Text */}
      {isSelectionMode && selectedItems.size === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-400"
        >
          <p>Click on items to select them, then choose a bulk action.</p>
          <p className="text-sm mt-1">Use Ctrl+A to select all, Escape to exit selection mode.</p>
        </motion.div>
      )}
    </div>
  );
}

// Hook for managing bulk selection state
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return newSelected;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedItems.size, items.length, selectAll, deselectAll]);

  const isSelected = useCallback((itemId: string) => {
    return selectedItems.has(itemId);
  }, [selectedItems]);

  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedItems.has(item.id));
  }, [items, selectedItems]);

  return {
    selectedItems,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    getSelectedItems,
    selectedCount: selectedItems.size,
    isAllSelected: selectedItems.size === items.length && items.length > 0,
  };
} 