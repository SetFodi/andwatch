'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MediaPreviewData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  trailerUrl?: string;
  year?: number;
  rating?: number;
  genres?: string[];
  duration?: string;
  status?: string;
  type: 'anime' | 'movie' | 'tv';
  episodes?: number;
  seasons?: number;
}

interface HoverPreviewProps {
  children: React.ReactNode;
  mediaData: MediaPreviewData;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
  delay?: number;
}

export default function HoverPreview({
  children,
  mediaData,
  position = 'auto',
  className = '',
  delay = 500
}: HoverPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const [previewData, setPreviewData] = useState<MediaPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const hoverRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  // Calculate optimal position based on viewport
  const calculatePosition = () => {
    if (!hoverRef.current || position !== 'auto') return position;
    
    const rect = hoverRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const spaceTop = rect.top;
    const spaceBottom = viewport.height - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = viewport.width - rect.right;
    
    // Prefer bottom, then top, then right, then left
    if (spaceBottom > 400) return 'bottom';
    if (spaceTop > 400) return 'top';
    if (spaceRight > 350) return 'right';
    if (spaceLeft > 350) return 'left';
    
    return 'bottom'; // fallback
  };

  // Fetch detailed media data
  const fetchPreviewData = async () => {
    if (previewData || isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/media/${mediaData.type}/${mediaData.id}/preview`);
      if (response.ok) {
        const data = await response.json();
        setPreviewData({ ...mediaData, ...data });
      } else {
        setPreviewData(mediaData);
      }
    } catch (error) {
      console.error('Failed to fetch preview data:', error);
      setPreviewData(mediaData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setActualPosition(calculatePosition());
      setIsVisible(true);
      
      // Fetch data after a short delay
      fetchTimeoutRef.current = setTimeout(fetchPreviewData, 200);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, []);

  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
    }
  };

  const displayData = previewData || mediaData;

  return (
    <div
      ref={hoverRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={previewRef}
            initial={{ opacity: 0, scale: 0.9, y: actualPosition === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className="w-80 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
              {/* Preview Image/Video */}
              <div className="relative h-48 bg-gray-800">
                {displayData.image ? (
                  <Image
                    src={displayData.image}
                    alt={displayData.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Overlay with quick actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      {/* Rating */}
                      {displayData.rating && (
                        <div className="flex items-center space-x-1 bg-yellow-500/90 text-black px-2 py-1 rounded-full text-sm font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{displayData.rating.toFixed(1)}</span>
                        </div>
                      )}
                      
                      {/* Type badge */}
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        displayData.type === 'anime' ? 'bg-indigo-500/90 text-white' :
                        displayData.type === 'tv' ? 'bg-blue-500/90 text-white' :
                        'bg-red-500/90 text-white'
                      }`}>
                        {displayData.type === 'tv' ? 'TV Show' : displayData.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
                  {displayData.title}
                </h3>

                {/* Meta information */}
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  {displayData.year && <span>{displayData.year}</span>}
                  {displayData.duration && (
                    <>
                      <span>•</span>
                      <span>{displayData.duration}</span>
                    </>
                  )}
                  {displayData.episodes && (
                    <>
                      <span>•</span>
                      <span>{displayData.episodes} eps</span>
                    </>
                  )}
                  {displayData.seasons && (
                    <>
                      <span>•</span>
                      <span>{displayData.seasons} seasons</span>
                    </>
                  )}
                </div>

                {/* Description */}
                {displayData.description && (
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
                    {displayData.description}
                  </p>
                )}

                {/* Genres */}
                {displayData.genres && displayData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {displayData.genres.slice(0, 3).map((genre, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                    {displayData.genres.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                        +{displayData.genres.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex space-x-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    View Details
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 p-2 rounded-lg transition-colors"
                    title="Add to Watchlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </motion.button>

                  {displayData.trailerUrl && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-red-600/80 hover:bg-red-500/80 text-white p-2 rounded-lg transition-colors"
                      title="Watch Trailer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11m3-3a4 4 0 00-5.656 0M15 6H9a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2z" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simplified version for mobile or simpler use cases
export function SimpleHoverPreview({ 
  children, 
  title, 
  description, 
  className = '' 
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-lg p-3 shadow-xl max-w-xs">
              <h4 className="text-white font-medium text-sm">{title}</h4>
              {description && (
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{description}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 