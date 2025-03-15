// app/search/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animeApi, tmdbApi } from "../../lib/services/api";
import Link from "next/link";
import Image from "next/image";

type SearchResult = {
  id: number | string;
  title: string;
  type: "anime" | "movies" | "tv";
  image?: string;
  overview?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"anime" | "movies" | "tv">("anime");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to keep track of the latest search request
  const latestSearchRef = useRef<string>("");

  // Animation variants
  const searchBarVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Improved search function with request ID to prevent race conditions
  const performSearch = async (searchQuery: string, type: "anime" | "movies" | "tv") => {
    // Generate a unique ID for this search request
    const searchRequestId = Date.now().toString();
    latestSearchRef.current = searchRequestId;
    
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      let results: SearchResult[] = [];

      // Search based on selected type only
      if (type === "anime" && latestSearchRef.current === searchRequestId) {
        const animeData = await animeApi.searchAnime(searchQuery, 1);
        
        // Check if this is still the latest search request
        if (latestSearchRef.current !== searchRequestId) return;
        
        results = animeData.data?.map((item: any) => ({
          id: item.mal_id,
          title: item.title,
          type: "anime" as const,
          image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          overview: item.synopsis,
        })) || [];
      }

      if (type === "movies" && latestSearchRef.current === searchRequestId) {
        const movieData = await tmdbApi.searchMovies(searchQuery, 1);
        
        // Check if this is still the latest search request
        if (latestSearchRef.current !== searchRequestId) return;
        
        if (movieData.results && Array.isArray(movieData.results)) {
          results = movieData.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: "movies" as const,
            image: tmdbApi.getImageUrl(item.poster_path),
            overview: item.overview,
          }));
        }
      }

      if (type === "tv" && latestSearchRef.current === searchRequestId) {
        const tvData = await tmdbApi.searchTVShows(searchQuery, 1);
        
        // Check if this is still the latest search request
        if (latestSearchRef.current !== searchRequestId) return;
        
        if (tvData.results && Array.isArray(tvData.results)) {
          results = tvData.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            type: "tv" as const,
            image: tmdbApi.getImageUrl(item.poster_path),
            overview: item.overview,
          }));
        }
      }

      // Final check to ensure this is still the most recent search
      if (latestSearchRef.current === searchRequestId) {
        const limitedResults = results.slice(0, 10);
        setResults(limitedResults);
        setError(limitedResults.length === 0 ? "No results found for your query." : null);
      }
      
    } catch (err: any) {
      // Only set error if this is still the latest search
      if (latestSearchRef.current === searchRequestId) {
        console.error("Search error:", err);
        setError(`Error searching for ${type}. Please try again.`);
        setResults([]);
      }
    } finally {
      // Only update loading state if this is still the latest search
      if (latestSearchRef.current === searchRequestId) {
        setIsLoading(false);
      }
    }
  };

  // Improved debounce with longer delay
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Create a debounced search with longer delay
  const debouncedSearch = debounce((searchQuery: string, type: "anime" | "movies" | "tv") => {
    performSearch(searchQuery, type);
  }, 750); // Increased from 500ms to 750ms for more stability

  // Effect to trigger search when query or mediaType changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query, mediaType);
    } else {
      setResults([]);
      setError(null);
      setIsLoading(false);
    }
  }, [query, mediaType]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Animated Search Bar */}
      <motion.div
        className="w-full max-w-4xl"
        variants={searchBarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-gray-900/70 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Filter Dropdown */}
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as "anime" | "movies" | "tv")}
              className="w-full sm:w-auto bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="anime">Anime</option>
              <option value="movies">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for ${mediaType}...`}
                className="w-full bg-transparent text-white text-xl placeholder-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 px-6 transition-all duration-300"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section - Removed the global loading message */}
      <div className="mt-12 w-full max-w-4xl">
        {error && query.trim() !== "" ? (
          <div className="text-red-400 text-center text-lg">{error}</div>
        ) : results.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
          >
            {results.map((result, index) => (
              <motion.div
                key={`${result.id}-${result.type}`}
                custom={index}
                variants={resultVariants}
                className="bg-gray-900/70 border border-gray-800/50 rounded-xl p-4 backdrop-blur-md hover:bg-gray-800/80 transition-all duration-300"
              >
                <Link href={`/${result.type}/${result.id}`} className="block">
                  <div className="aspect-[2/3] relative overflow-hidden rounded-lg shadow-md">
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-all duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white mt-3 line-clamp-1">{result.title}</h3>
                  <p className="text-sm text-gray-400 capitalize">{result.type}</p>
                  {result.overview && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.overview}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : query.trim() && !isLoading ? (
          <div className="text-gray-400 text-center text-lg">No results found for "{query}"</div>
        ) : null}
      </div>
    </div>
  );
}
