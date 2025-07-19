"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MediaCard from "../app/profile/MediaCard";
import HistoryCard from "./HistoryCard";
import EmptyState from "../app/profile/EmptyState";

type CategoryIcon = "play" | "calendar" | "check" | "history";

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
  addedAt?: string | Date;
  updatedAt?: string | Date;
  completedAt?: string | Date;
  lastModified?: string | Date;
  genres?: string[];
  episodes?: number;
  progress?: number;
  totalEpisodes?: number;
  runtime?: number;
  isPlaceholder?: boolean;
}

interface ServerFilteredProfileClientProps {
  items: MediaItem[];
  categoryName: string;
  colorTheme: string;
  categoryIcon: CategoryIcon;
  userId: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filterType?: string;
  searchQuery?: string;
  isHistory?: boolean;
}

// Helper function to get category icon
function getCategoryIcon(iconName: CategoryIcon) {
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
    case "history":
      return (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

// Helper function to get category description
function getCategoryDescription(category: string, count: number): string {
  switch (category) {
    case "Watching":
      return `${count} titles you're currently watching`;
    case "Planning":
      return `${count} titles you're planning to watch`;
    case "Completed":
      return `${count} titles you've completed watching`;
    case "Watch History":
      return `${count} titles in your watch history`;
    default:
      return `${count} titles in this list`;
  }
}

export default function ServerFilteredProfileClient({
  items = [],
  categoryName,
  colorTheme,
  categoryIcon,
  userId,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  filterType = 'all',
  searchQuery = '',
  isHistory = false
}: ServerFilteredProfileClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localFilterType, setLocalFilterType] = useState(filterType);

  // Get the icon component based on the category
  const IconComponent = getCategoryIcon(categoryIcon);

  // Handle filter changes
  const updateFilters = (newType?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newType !== undefined) {
      if (newType === 'all') {
        params.delete('type');
      } else {
        params.set('type', newType);
      }
    }
    
    if (newSearch !== undefined) {
      if (newSearch.trim() === '') {
        params.delete('search');
      } else {
        params.set('search', newSearch);
      }
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  // Handle search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, localSearchQuery);
  };

  // Handle type filter change
  const handleTypeFilter = (type: string) => {
    setLocalFilterType(type);
    updateFilters(type, undefined);
  };

  // Navigate to specific page
  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
  
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  
    return (
      <div className="flex justify-center mt-8">
        <nav className="inline-flex rounded-md shadow-sm bg-gray-800/70 p-1" aria-label="Pagination">
          <button
            onClick={() => navigateToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md 
              ${currentPage === 1 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => navigateToPage(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium
                ${currentPage === page
                  ? `bg-gradient-to-r ${colorTheme} text-white`
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md
              ${currentPage === totalPages
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="opacity-100">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Link 
                href="/profile" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-4xl font-light tracking-wide text-white">
                {categoryName} <span className="text-gray-400">({totalCount})</span>
                <span className="text-sm text-emerald-400 ml-3">(Page {currentPage})</span>
              </h1>
            </div>
            <div className={`h-1 w-20 bg-gradient-to-r ${colorTheme} rounded-full mb-4`}></div>
            
            <p className="text-gray-400 text-lg">
              {getCategoryDescription(categoryName, totalCount)}
            </p>
          </div>

          <div className={`flex items-center justify-center p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700`}>
            <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${colorTheme} flex items-center justify-center shadow-lg`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800/50 p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  placeholder="Search titles..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </form>
            </div>

            {/* Sort Dropdown */}
            <div className="md:w-64">
              <select
                value="recently_updated"
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                <option value="recently_updated">Recently Updated</option>
                <option value="recently_added">Recently Added</option>
                <option value="recently_completed">Recently Completed</option>
                <option value="title_asc">Title (A-Z)</option>
                <option value="title_desc">Title (Z-A)</option>
                <option value="score_desc">Highest Rating</option>
                <option value="year_desc">Newest First</option>
                <option value="year_asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex space-x-2 items-center">
              <span className="text-gray-400 text-sm whitespace-nowrap">Type:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTypeFilter("all")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilterType === "all"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  All
                </button>
                <button
                  onClick={() => handleTypeFilter("anime")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilterType === "anime"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  Anime
                </button>
                <button
                  onClick={() => handleTypeFilter("movie")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilterType === "movie"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  Movies
                </button>
                <button
                  onClick={() => handleTypeFilter("tv")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    localFilterType === "tv"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  TV Shows
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count and Message */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400">
            Showing <span className="text-white font-medium">{items.length}</span> of{" "}
            <span className="text-white font-medium">{totalCount}</span> items
            <span className="text-gray-500 ml-1">
              (Page {currentPage} of {totalPages})
            </span>
          </p>
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setLocalSearchQuery('');
              updateFilters(undefined, '');
            }}
            className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear search
          </button>
        )}
      </div>

      {/* Media Grid */}
      {items.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item, index) => (
              <div 
                key={`${item?.id || index}-${index}`}
                className="opacity-100" 
              >
                {isHistory 
                  ? <HistoryCard item={item} /> 
                  : <MediaCard item={item} />
                }
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && renderPagination()}
        </div>
      ) : (
        <EmptyState
          mediaType={localFilterType === "all" ? "both" : localFilterType}
          filterActive={localFilterType !== "all" || searchQuery !== ""}
        />
      )}
    </div>
  );
}
