'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo } from 'react';
import MediaCard from '../app/profile/MediaCard';
import HistoryCard from '../HistoryCard';
import { MediaCardSkeleton } from './SkeletonLoader';

interface MediaItem {
  id: string | number;
  title: string;
  image: string | null;
  score: number | null;
  type: "anime" | "movie" | "tv";
  year: number | null;
  url: string;
  userRating?: number | null;
  status?: string | null;
  isPlaceholder?: boolean;
  [key: string]: any;
}

interface VirtualizedGridProps {
  items: MediaItem[];
  renderItem?: 'media' | 'history';
  loading?: boolean;
  loadingCount?: number;
  itemHeight?: number;
  columnCount?: number;
  gap?: number;
  className?: string;
  containerHeight?: string;
}

export default function VirtualizedGrid({
  items,
  renderItem = 'media',
  loading = false,
  loadingCount = 20,
  itemHeight = 400,
  columnCount = 5,
  gap = 24,
  className = '',
  containerHeight = '600px'
}: VirtualizedGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows needed based on column count
  const allItems = loading ? 
    [...items, ...Array(loadingCount).fill({ id: 'loading', isLoading: true })] : 
    items;
  
  const rowCount = Math.ceil(allItems.length / columnCount);
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < rowCount; i++) {
      const startIndex = i * columnCount;
      const endIndex = Math.min(startIndex + columnCount, allItems.length);
      result.push(allItems.slice(startIndex, endIndex));
    }
    return result;
  }, [allItems, columnCount, rowCount]);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 2,
  });

  // Handle responsive column count
  const getResponsiveColumns = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 768) return 2;
      if (width < 1024) return 3;
      if (width < 1280) return 4;
      return columnCount;
    }
    return columnCount;
  };

  const responsiveColumns = getResponsiveColumns();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index] || [];
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div 
                className="grid gap-6 h-full px-4"
                style={{
                  gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
                }}
              >
                {rowItems.map((item, index) => {
                  const itemIndex = virtualRow.index * columnCount + index;
                  
                  // Render loading skeleton
                  if (item.isLoading || loading) {
                    return <MediaCardSkeleton key={`loading-${itemIndex}`} />;
                  }
                  
                  // Render actual item
                  if (renderItem === 'history') {
                    return <HistoryCard key={item.id || itemIndex} item={item} />;
                  }
                  
                  return <MediaCard key={item.id || itemIndex} item={item} />;
                })}
                
                {/* Fill remaining columns in the last row */}
                {rowItems.length < responsiveColumns && 
                  virtualRow.index === rowCount - 1 &&
                  Array.from({ length: responsiveColumns - rowItems.length }).map((_, index) => (
                    <div key={`empty-${index}`} />
                  ))
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hook for responsive column management
export function useResponsiveColumns(baseColumns: number = 5) {
  const getColumns = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return 1;
      if (width < 768) return 2;
      if (width < 1024) return 3;
      if (width < 1280) return 4;
      return baseColumns;
    }
    return baseColumns;
  };

  return getColumns();
}

// Infinite loading version for very large datasets
interface InfiniteVirtualizedGridProps extends Omit<VirtualizedGridProps, 'items'> {
  items: MediaItem[];
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  totalCount?: number;
}

export function InfiniteVirtualizedGrid({
  items,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  totalCount,
  ...gridProps
}: InfiniteVirtualizedGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const allItems = [...items];
  if (isFetchingNextPage) {
    allItems.push(...Array(20).fill({ id: 'loading', isLoading: true }));
  }

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(allItems.length / (gridProps.columnCount || 5)),
    getScrollElement: () => parentRef.current,
    estimateSize: () => (gridProps.itemHeight || 400) + (gridProps.gap || 24),
    overscan: 5,
  });

  // Auto-fetch next page when scrolling near the end
  const lastItem = rowVirtualizer.getVirtualItems().slice(-1)[0];
  const shouldFetchNext = lastItem && 
    lastItem.index >= Math.ceil(allItems.length / (gridProps.columnCount || 5)) - 3;

  if (shouldFetchNext && hasNextPage && !isFetchingNextPage && fetchNextPage) {
    fetchNextPage();
  }

  return (
    <div className="space-y-4">
      {totalCount && (
        <div className="text-center text-gray-400">
          <p>Showing {items.length} of {totalCount} items</p>
        </div>
      )}
      
      <VirtualizedGrid
        {...gridProps}
        items={allItems}
        ref={parentRef}
      />
      
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
            <span>Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
} 