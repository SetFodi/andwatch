"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
}

interface ProfileCategoryClientProps {
  items: MediaItem[];
  categoryName: string;
  colorTheme: string;
  categoryIcon: CategoryIcon;
  userId: string;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  isPaginated?: boolean;
  displayLoadMoreLink?: boolean;
  fullLoadUrl?: string;
  isFullLoad?: boolean;
  pagination?: PaginationInfo;
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

export default function ProfileCategoryClient({
  items = [], // Provide default empty array 
  categoryName,
  colorTheme,
  categoryIcon,
  userId,
  totalCount = 0,
  currentPage = 1,
  totalPages = 1,
  isPaginated = false,
  displayLoadMoreLink = false,
  fullLoadUrl,
  isFullLoad = false,
  pagination,
  isHistory = false
}: ProfileCategoryClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loadedItems, setLoadedItems] = useState<MediaItem[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [sortOption, setSortOption] = useState<string>(isHistory ? "recently_modified" : "recently_updated");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Use current page and total pages from pagination prop if available
  const paginationCurrentPage = pagination?.currentPage || currentPage || 1;
  const paginationTotalPages = pagination?.totalPages || totalPages || 1;

  // Get all unique genres across items
  const allGenres = Array.from(
    new Set(items.flatMap((item) => item?.genres || []))
  ).sort();

  // Add error handling for connection errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && 
         (event.error.message?.includes('Connection closed') || 
          event.error.message?.includes('failed to fetch') ||
          event.error.message?.includes('network error'))) {
        setHasConnectionError(true);
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Load items progressively for a smoother UI experience
  useEffect(() => {
    setIsLoading(true);
    setLoadedItems([]);
    setLoadProgress(0);
    setLoadError(null);
    
    if (!items || items.length === 0) {
      setIsLoading(false);
      return;
    }
    
    // Filter out invalid items
    const validItems = items.filter(item => item !== null && item !== undefined);
    
    // Load items in batches for a smoother experience
    const batchSize = 10; // Increased batch size for faster initial load
    const totalItems = validItems.length;
    let loadedCount = 0;
    
    const loadBatch = (startIndex: number) => {
      try {
        const endIndex = Math.min(startIndex + batchSize, totalItems);
        const batch = validItems.slice(startIndex, endIndex);
        
        setLoadedItems(prev => [...prev, ...batch]);
        loadedCount = endIndex;
        
        const progress = Math.round((loadedCount / totalItems) * 100);
        setLoadProgress(progress);
        
        if (loadedCount < totalItems) {
          // Load next batch after a small delay
          setTimeout(() => loadBatch(loadedCount), 50); // Reduced delay for better performance
        } else {
          // All items loaded
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading items batch:", error);
        setLoadError("There was an error loading your items. Please refresh the page to try again.");
        setIsLoading(false);
      }
    };
    
    // Start loading the first batch
    loadBatch(0);
    
    // Cleanup function for unmounting
    return () => {
      // This ensures any pending batch loads are cancelled if component unmounts
      setLoadedItems([]);
    };
  }, [items]);

  // Apply filters and sorting whenever the dependencies change
  const applyFiltersAndSort = useCallback(() => {
    if (isLoading) return;
    
    try {
      // Filter out invalid items
      let result = loadedItems.filter(item => item !== null && item !== undefined);

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter((item) =>
          item.title.toLowerCase().includes(query)
        );
      }

      // Apply media type filter
      if (filterType !== "all") {
        result = result.filter((item) => item.type === filterType);
      }

      // Apply genre filter
      if (filterGenre !== "all") {
        result = result.filter((item) => 
          item.genres?.includes(filterGenre)
        );
      }

      // Apply sorting - wrap in try/catch to handle any potential date issues
      result.sort((a, b) => {
        try {
          switch (sortOption) {
            case "title_asc":
              return a.title.localeCompare(b.title);
            case "title_desc":
              return b.title.localeCompare(a.title);
            case "score_desc":
              return (b.userRating || 0) - (a.userRating || 0);
            case "year_desc":
              return (b.year || 0) - (a.year || 0);
            case "year_asc":
              return (a.year || 0) - (b.year || 0);
            case "recently_added":
              const aAddedTime = a.addedAt ? new Date(a.addedAt).getTime() : 0;
              const bAddedTime = b.addedAt ? new Date(b.addedAt).getTime() : 0;
              return bAddedTime - aAddedTime;
            case "recently_completed":
              if (categoryName === "Completed") {
                const aCompletedTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                const bCompletedTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                return bCompletedTime - aCompletedTime;
              }
              return 0;
            case "recently_modified":
              // For history items, sort by most recent activity
              const aModifiedTime = a.lastModified || a.updatedAt || a.completedAt || a.addedAt ? 
                new Date(a.lastModified || a.updatedAt || a.completedAt || a.addedAt).getTime() : 0;
              const bModifiedTime = b.lastModified || b.updatedAt || b.completedAt || b.addedAt ? 
                new Date(b.lastModified || b.updatedAt || b.completedAt || b.addedAt).getTime() : 0;
              return bModifiedTime - aModifiedTime;
            case "recently_updated":
            default:
              const aUpdatedTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
              const bUpdatedTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
              return bUpdatedTime - aUpdatedTime;
          }
        } catch (error) {
          console.error("Error during sorting:", error);
          return 0; // Keep original order on error
        }
      });

      setFilteredItems(result);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Set filtered items to empty array in case of error
      setFilteredItems([]);
    }
  }, [loadedItems, sortOption, filterType, filterGenre, searchQuery, categoryName, isLoading, isHistory]);

  // Use effect to apply filters when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  // Get the icon component based on the category
  const IconComponent = getCategoryIcon(categoryIcon);

  // Navigate to specific page
  const navigateToPage = (page: number) => {
    if (page < 1 || page > paginationTotalPages) return;
    router.push(`/profile/${isHistory ? 'history' : categoryName.toLowerCase()}?page=${page}`);
  };

  // If we've detected a connection error
  if (hasConnectionError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-white text-lg font-medium mb-2">Connection Error</p>
        <p className="text-gray-400 text-center mb-6">
          We couldn't load your {categoryName.toLowerCase()} list. This might be due to a connection issue.
        </p>
        <button
          onClick={() => window.location.reload()}
          className={`px-6 py-3 bg-gradient-to-r ${colorTheme} rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300`}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Show loading indicator
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-gray-800/50 rounded-full h-3 mb-6 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${colorTheme} rounded-full transition-all duration-300`}
            style={{ width: `${loadProgress}%` }}
          ></div>
        </div>
        <p className="text-white text-lg font-medium mb-2">Loading your {categoryName.toLowerCase()}</p>
        <p className="text-gray-400">
          {loadedItems.length} of {items.length} items ({loadProgress}%)
        </p>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-white text-lg font-medium mb-2">Something went wrong</p>
        <p className="text-gray-400 text-center mb-6">
          {loadError}
        </p>
        <button
          onClick={() => window.location.reload()}
          className={`px-6 py-3 bg-gradient-to-r ${colorTheme} rounded-xl text-white font-medium hover:opacity-90 transition-all duration-300`}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Render pagination controls
  const renderPagination = () => {
    if (!isPaginated || paginationTotalPages <= 1) return null;
  
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, paginationCurrentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(paginationTotalPages, startPage + maxPageButtons - 1);
    
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
            onClick={() => navigateToPage(paginationCurrentPage - 1)}
            disabled={paginationCurrentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-md 
              ${paginationCurrentPage === 1 
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
                ${paginationCurrentPage === page
                  ? `bg-gradient-to-r ${colorTheme} text-white`
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => navigateToPage(paginationCurrentPage + 1)}
            disabled={paginationCurrentPage === paginationTotalPages}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-md
              ${paginationCurrentPage === paginationTotalPages
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
                {categoryName} <span className="text-gray-400">({totalCount || items.length})</span>
                {isFullLoad && <span className="text-sm text-emerald-400 ml-3">(Full View)</span>}
                {isPaginated && <span className="text-sm text-emerald-400 ml-3">(Page {paginationCurrentPage})</span>}
              </h1>
            </div>
            <div className={`h-1 w-20 bg-gradient-to-r ${colorTheme} rounded-full mb-4`}></div>
            
            <p className="text-gray-400 text-lg">
              {getCategoryDescription(categoryName, totalCount || items.length)}
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
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="md:w-64">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
              >
                {isHistory ? (
                  <>
                    <option value="recently_modified">Most Recent Activity</option>
                    <option value="recently_updated">Recently Updated</option>
                    <option value="recently_added">Recently Added</option>
                  </>
                ) : (
                  <>
                    <option value="recently_updated">Recently Updated</option>
                    <option value="recently_added">Recently Added</option>
                    {categoryName === "Completed" && (
                      <option value="recently_completed">Recently Completed</option>
                    )}
                  </>
                )}
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
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "all"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType("anime")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "anime"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  Anime
                </button>
                <button
                  onClick={() => setFilterType("movie")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "movie"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setFilterType("tv")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterType === "tv"
                      ? `bg-gradient-to-r ${colorTheme} text-white`
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  } transition-colors`}
                >
                  TV Shows
                </button>
              </div>
            </div>

            {/* Genre Filter (when there are genres) */}
            {allGenres.length > 0 && (
              <div className="flex space-x-2 items-center overflow-x-auto pb-2 flex-grow">
                <span className="text-gray-400 text-sm whitespace-nowrap">Genre:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterGenre("all")}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      filterGenre === "all"
                        ? `bg-gradient-to-r ${colorTheme} text-white`
                        : "bg-gray-800 text-gray-400 hover:text-white"
                    } transition-colors`}
                  >
                    All Genres
                  </button>
                  {allGenres.slice(0, 5).map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setFilterGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                        filterGenre === genre
                          ? `bg-gradient-to-r ${colorTheme} text-white`
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      } transition-colors`}
                    >
                      {genre}
                    </button>
                  ))}
                  {allGenres.length > 5 && (
                    <div className="relative group">
                      <button className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-400 hover:text-white whitespace-nowrap">
                        More...
                      </button>
                      <div className="absolute left-0 top-full mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-10 p-2 w-48 hidden group-hover:block">
                        <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                          {allGenres.slice(5).map((genre) => (
                            <button
                              key={genre}
                              onClick={() => setFilterGenre(genre)}
                              className={`px-3 py-1.5 rounded text-sm text-left ${
                                filterGenre === genre
                                  ? `bg-gradient-to-r ${colorTheme} text-white`
                                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                              } transition-colors`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Count and Message */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400">
            Showing <span className="text-white font-medium">{filteredItems.length}</span> of{" "}
            <span className="text-white font-medium">{totalCount || items.length}</span> items
            {isPaginated && (
              <span className="text-gray-500 ml-1">
                (Page {paginationCurrentPage} of {paginationTotalPages})
              </span>
            )}
          </p>
          {!isFullLoad && !isPaginated && (totalCount && totalCount > items.length) && (
            <p className="text-yellow-500/70 text-sm mt-1">
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Initial load limited to improve performance
            </p>
          )}
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
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
      {filteredItems.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map((item, index) => (
              <div 
                key={`${item?.id || index}-${index}`}
                className="opacity-100" 
              >
                {item && (
                  isHistory 
                    ? <HistoryCard item={item} /> 
                    : <MediaCard item={item} />
                )}
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {isPaginated && paginationTotalPages > 1 && renderPagination()}
          
          {/* Load More Link (for non-paginated view) */}
          {displayLoadMoreLink && fullLoadUrl && !isPaginated && (totalCount > items.length) && (
            <div className="mt-12 text-center">
              <div className="mb-4 text-gray-400">
                <p>Showing {items.length} of {totalCount} items</p>
                <p className="text-sm mt-1 text-gray-500">This is an optimized view to improve performance</p>
              </div>
              
              <Link 
                href={fullLoadUrl}
                className={`inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r ${colorTheme} text-white font-medium text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
              >
                <span>View All {totalCount} {categoryName}</span>
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              
              <p className="mt-4 text-sm text-gray-500">
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Loading all items at once may cause performance issues
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState mediaType={filterType === "all" ? "both" : filterType} />
      )}
    </div>
  );
}
