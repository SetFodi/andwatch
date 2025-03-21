// components/ProfileCategoryClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import MediaCard from "../app/profile/MediaCard";
import EmptyState from "../app/profile/EmptyState";

type CategoryIcon = "play" | "calendar" | "check";

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
  genres?: string[];
  episodes?: number;
  progress?: number;
  totalEpisodes?: number;
  runtime?: number;
}

interface ProfileCategoryClientProps {
  items: MediaItem[];
  categoryName: string;
  colorTheme: string;
  categoryIcon: CategoryIcon;
  userId: string;
}

export default function ProfileCategoryClient({
  items,
  categoryName,
  colorTheme,
  categoryIcon,
  userId,
}: ProfileCategoryClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadedItems, setLoadedItems] = useState<MediaItem[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [sortOption, setSortOption] = useState<string>("recently_updated");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get all unique genres across items
  const allGenres = Array.from(
    new Set(items.flatMap((item) => item.genres || []))
  ).sort();

  // Load items progressively for a smoother UI experience
  useEffect(() => {
    setIsLoading(true);
    setLoadedItems([]);
    setLoadProgress(0);
    
    if (items.length === 0) {
      setIsLoading(false);
      return;
    }
    
    // Load items in batches for a smoother experience
    const batchSize = 5;
    const totalItems = items.length;
    let loadedCount = 0;
    
    const loadBatch = (startIndex: number) => {
      const endIndex = Math.min(startIndex + batchSize, totalItems);
      const batch = items.slice(startIndex, endIndex);
      
      setLoadedItems(prev => [...prev, ...batch]);
      loadedCount = endIndex;
      
      const progress = Math.round((loadedCount / totalItems) * 100);
      setLoadProgress(progress);
      
      if (loadedCount < totalItems) {
        // Load next batch after a small delay
        setTimeout(() => loadBatch(loadedCount), 100);
      } else {
        // All items loaded
        setIsLoading(false);
      }
    };
    
    // Start loading the first batch
    loadBatch(0);
  }, [items]);

  // Apply filters and sorting whenever the dependencies change
  useEffect(() => {
    if (isLoading) return;
    
    let result = [...loadedItems];

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

    // Apply sorting
    result.sort((a, b) => {
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
          return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
        case "recently_completed":
          if (categoryName === "Completed") {
            return new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime();
          }
          return 0;
        case "recently_updated":
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
    });

    setFilteredItems(result);
  }, [loadedItems, sortOption, filterType, filterGenre, searchQuery, categoryName, isLoading]);

  // Get the icon component based on the category
  const IconComponent = getCategoryIcon(categoryIcon);

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
        <p className="text-white text-lg font-medium mb-2">Loading your {categoryName.toLowerCase()} list</p>
        <p className="text-gray-400">
          {loadedItems.length} of {items.length} items ({loadProgress}%)
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
                {categoryName} <span className="text-gray-400">({items.length})</span>
              </h1>
            </div>
            <div className={`h-1 w-20 bg-gradient-to-r ${colorTheme} rounded-full mb-4`}></div>
            
            <p className="text-gray-400 text-lg">
              {getCategoryDescription(categoryName, items.length)}
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
                <option value="recently_updated">Recently Updated</option>
                <option value="recently_added">Recently Added</option>
                {categoryName === "Completed" && (
                  <option value="recently_completed">Recently Completed</option>
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

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400">
          Showing <span className="text-white font-medium">{filteredItems.length}</span> of{" "}
          <span className="text-white font-medium">{items.length}</span> items
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(0.5, index * 0.05) }}
            >
              <MediaCard item={item} />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState mediaType={filterType === "all" ? "both" : filterType} />
      )}
    </motion.div>
  );
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
    default:
      return `${count} titles in this list`;
  }
}
