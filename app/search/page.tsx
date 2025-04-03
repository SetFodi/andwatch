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

// Helper function to get the correct URL path segment
const getLinkPath = (type: "anime" | "movies" | "tv"): string => {
  switch (type) {
    case "anime":
      return "anime";
    case "movies":
      return "movies";
    case "tv":
      return "tvshows"; // Map 'tv' type to 'tvshows' path
    default:
      // Should not happen with TypeScript, but good practice
      return type;
  }
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"anime" | "movies" | "tv">(
    "anime",
  );
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
  const performSearch = async (
    searchQuery: string,
    type: "anime" | "movies" | "tv",
  ) => {
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
      let apiResults: SearchResult[] = []; // Renamed to avoid conflict

      // Search based on selected type only
      if (type === "anime" && latestSearchRef.current === searchRequestId) {
        const animeData = await animeApi.searchAnime(searchQuery, 1);

        // Check if this is still the latest search request
        if (latestSearchRef.current !== searchRequestId) return;

        apiResults =
          animeData.data?.map((item: any) => ({
            id: item.mal_id,
            title: item.title,
            type: "anime" as const,
            image:
              item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
            overview: item.synopsis,
          })) || [];
      }

      if (type === "movies" && latestSearchRef.current === searchRequestId) {
        const movieData = await tmdbApi.searchMovies(searchQuery, 1);

        // Check if this is still the latest search request
        if (latestSearchRef.current !== searchRequestId) return;

        if (movieData.results && Array.isArray(movieData.results)) {
          apiResults = movieData.results.map((item: any) => ({
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
          apiResults = tvData.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            type: "tv" as const, // Keep internal type as 'tv'
            image: tmdbApi.getImageUrl(item.poster_path),
            overview: item.overview,
          }));
        }
      }

      // Final check to ensure this is still the most recent search
      if (latestSearchRef.current === searchRequestId) {
        const limitedResults = apiResults.slice(0, 10);
        setResults(limitedResults);
        setError(
          limitedResults.length === 0
            ? "No results found for your query."
            : null,
        );
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
  const debouncedSearch = debounce(
    (searchQuery: string, type: "anime" | "movies" | "tv") => {
      performSearch(searchQuery, type);
    },
    750,
  ); // Increased from 500ms to 750ms for more stability

  // Effect to trigger search when query or mediaType changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query, mediaType);
    } else {
      setResults([]);
      setError(null);
      setIsLoading(false);
    }
    // Clean up the timer when the component unmounts or dependencies change
    // The debounce function already handles clearing the previous timeout,
    // but explicitly returning a cleanup function from useEffect is good practice
    // if the debounced function itself held resources that needed cleanup.
    // In this case, it's primarily managing a timeout, which debounce handles.
  }, [query, mediaType, debouncedSearch]); // Added debouncedSearch to dependency array

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-950 via-black to-gray-900 pt-24 md:pt-32">
      {/* Animated Search Bar */}
      <motion.div
        className="w-full max-w-4xl mb-8" // Added margin-bottom
        variants={searchBarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative bg-gray-900/70 border border-gray-800/50 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Filter Dropdown */}
            <select
              value={mediaType}
              onChange={(e) =>
                setMediaType(e.target.value as "anime" | "movies" | "tv")
              }
              className="w-full sm:w-auto bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 flex-shrink-0" // Added py-2.5 for consistency, flex-shrink-0
            >
              <option value="anime">Anime</option>
              <option value="movies">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full flex-grow">
              {" "}
              {/* Added flex-grow */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for ${mediaType}...`}
                className="w-full bg-gray-800/30 text-white text-lg sm:text-xl placeholder-gray-500 border border-gray-700/50 focus:border-indigo-500 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300" // Adjusted styles
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="animate-spin h-5 w-5 text-indigo-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="mt-8 w-full max-w-4xl">
        {" "}
        {/* Adjusted margin-top */}
        {error && query.trim() !== "" && !isLoading ? ( // Show error only if not loading
          <div className="text-red-400 text-center text-lg py-8">{error}</div>
        ) : results.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6" // Adjusted grid columns for potentially more results
            initial="hidden"
            animate="visible"
          >
            {results.map((result, index) => (
              <motion.div
                key={`${result.id}-${result.type}`}
                custom={index}
                variants={resultVariants}
                className="bg-gray-900/70 border border-gray-800/50 rounded-xl overflow-hidden backdrop-blur-md hover:bg-gray-800/80 transition-all duration-300 flex flex-col" // Added flex flex-col
              >
                {/* Use the helper function for the link */}
                <Link
                  href={`/${getLinkPath(result.type)}/${result.id}`}
                  className="block group" // Added group for potential hover effects
                >
                  <div className="aspect-[2/3] relative overflow-hidden shadow-md">
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" // Adjusted sizes
                        className="object-cover transition-all duration-300 group-hover:scale-105" // Added group-hover
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {" "}
                    {/* Added padding for text */}
                    <h3 className="text-base font-medium text-white mt-1 line-clamp-1 group-hover:text-indigo-400 transition-colors duration-200">
                      {result.title}
                    </h3>{" "}
                    {/* Adjusted text size, added hover effect */}
                    <p className="text-xs text-gray-400 capitalize">
                      {/* Display 'TV Show' instead of 'tv' */}
                      {result.type === "tv" ? "TV Show" : result.type}
                    </p>
                    {/* Optional: Keep overview if desired, but removed for cleaner cards */}
                    {/* {result.overview && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{result.overview}</p>
                    )} */}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : query.trim() && !isLoading ? ( // Show 'no results' only if not loading and query exists
          <div className="text-gray-400 text-center text-lg py-8">
            No results found for "{query}"
          </div>
        ) : null}
      </div>
    </div>
  );
}

