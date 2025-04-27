"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MediaCard from "../profile/MediaCard";
import EmptyState from "../profile/EmptyState";

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
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

interface ProfileCategoryClientProps {
  items: MediaItem[];
  categoryName: string;
  colorTheme: string;
  categoryIcon: string;
  userId: string;
  totalCount: number;
  isFullLoad?: boolean;
  pagination?: PaginationProps;
}

export default function ProfileCategoryClient({ 
  items, 
  categoryName, 
  colorTheme,
  categoryIcon,
  userId,
  totalCount,
  isFullLoad = false,
  pagination
}: ProfileCategoryClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  useEffect(() => {
    // Short timeout to prevent flash of loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle connectivity errors
  useEffect(() => {
    const handleConnectionError = (event: ErrorEvent) => {
      if (event.message && 
         (event.message.includes('Connection closed') || 
          event.message.includes('failed to fetch'))) {
        setConnectionError("There was a problem loading your data. Please try refreshing the page.");
      }
    };
    
    window.addEventListener('error', handleConnectionError);
    return () => window.removeEventListener('error', handleConnectionError);
  }, []);

  // Get the icon component based on the category
  const CategoryIcon = getCategoryIcon(categoryIcon);
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  // Create a shimmer loading placeholder
  const renderLoadingPlaceholder = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/40 h-full">
          <div className="aspect-[3/4] relative bg-gray-800 animate-pulse"></div>
          <div className="p-4 min-h-[6rem]">
            <div className="h-5 bg-gray-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // If we have a connection error
  if (connectionError) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-red-500/30 p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-medium text-white mb-2">Connection Error</h3>
        <p className="text-gray-300 mb-4">{connectionError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-2 bg-red-600/30 hover:bg-red-600/50 text-white rounded-lg transition-colors border border-red-500/50"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Render the pagination controls
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    return (
      <div className="mt-8 flex justify-center">
        <div className={`inline-flex rounded-md shadow-sm bg-gray-900/50 border border-gray-800/50 p-1`}>
          {/* Previous page */}
          {pagination.currentPage > 1 ? (
            <Link
              href={`?page=${pagination.currentPage - 1}`}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </Link>
          ) : (
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed rounded-md">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </span>
          )}
          
          {/* Page number */}
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-md mx-1">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          
          {/* Next page */}
          {pagination.currentPage < pagination.totalPages ? (
            <Link
              href={`?page=${pagination.currentPage + 1}`}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-md transition-colors duration-200"
            >
              Next
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed rounded-md">
              Next
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Category header */}
      <div className={`flex items-center justify-between mb-8 pb-4 border-b border-gray-800/50`}>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${colorTheme} text-white shadow-lg mr-3`}>
            <CategoryIcon className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{categoryName}</h1>
          <span className="ml-3 bg-gray-900/60 px-3 py-1 rounded-full text-sm font-medium text-gray-300">
            {totalCount}
          </span>
        </div>
        
        {/* Back button */}
        {isFullLoad && (
          <Link href="/profile" className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </Link>
        )}
      </div>
      
      {isLoading ? (
        // Show loading placeholder
        renderLoadingPlaceholder()
      ) : items.length > 0 ? (
        <AnimatePresence>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {items.map((item, index) => (
              <MediaCard key={`${item.id}-${index}`} item={item} />
            ))}
          </motion.div>
          
          {/* Pagination controls */}
          {renderPagination()}
        </AnimatePresence>
      ) : (
        <EmptyState mediaType="both" />
      )}
    </motion.div>
  );
}

// Helper function to get the correct icon component
function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case "play":
      return (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "calendar":
      return (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "check":
      return (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}