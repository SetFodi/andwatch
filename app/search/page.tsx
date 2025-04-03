// app/search/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // Import useCallback
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

// Helper function to get the correct URL path segment (Kept from previous suggestion)
const getLinkPath = (type: "anime" | "movies" | "tv"): string => {
  switch (type) {
    case "anime":
      return "anime";
    case "movies":
      return "movies";
    case "tv":
      return "tvshows"; // Map 'tv' type to 'tvshows' path
    default:
      return type;
  }
};

// Debounce utility function (can be moved outside component if preferred)
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  delay: number,
) => {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
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

  // Animation variants (kept from original)
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

  // Search function remains largely the same
  const performSearch = async (
    searchQuery: string,
    type: "anime" | "movies" | "tv",
  ) => {
    const searchRequestId = Date.now().toString();
    latestSearchRef.current = searchRequestId;

    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      setIsLoading(false); // Ensure loading stops if query is cleared
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let apiResults: SearchResult[] = [];

      if (type === "anime") {
        // Check ref *before* API call
        if (latestSearchRef.current !== searchRequestId) return;
        const animeData = await animeApi.searchAnime(searchQuery, 1);
        // Check ref *after* API call
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
      } else if (type === "movies") {
        if (latestSearchRef.current !== searchRequestId) return;
        const movieData = await tmdbApi.searchMovies(searchQuery, 1);
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
      } else if (type === "tv") {
        if (latestSearchRef.current !== searchRequestId) return;
        const tvData = await tmdbApi.searchTVShows(searchQuery, 1);
        if (latestSearchRef.current !== searchRequestId) return;
        if (tvData.results && Array.isArray(tvData.results)) {
          apiResults = tvData.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            type: "tv" as const,
            image: tmdbApi.getImageUrl(item.poster_path),
            overview: item.overview,
          }));
        }
      }

      // Final check before setting state
      if (latestSearchRef.current === searchRequestId) {
        const limitedResults = apiResults.slice(0, 10); // Limit results
        setResults(limitedResults);
        setError(
          limitedResults.length === 0 && searchQuery.trim() // Only show 'no results' if query wasn't empty
            ? "No results found for your query."
            : null,
        );
      }
    } catch (err: any) {
      if (latestSearchRef.current === searchRequestId) {
        console.error("Search error:", err);
        // Check for rate limit error specifically if possible (depends on API client)
        if (err?.response?.status === 429) {
          setError("Rate limited by the API. Please wait a moment and try again.");
        } else {
          setError(`Error searching for ${type}. Please try again.`);
        }
        setResults([]);
      }
    } finally {
      // Only update loading state if this is the latest request
      if (latestSearchRef.current === searchRequestId) {
        setIsLoading(false);
      }
    }
  };

  // Create a stable, debounced search function using useCallback
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, type: "anime" | "movies" | "tv") => {
      performSearch(searchQuery, type);
    }, 750), // 750ms delay
    [], // No dependencies needed for useCallback here, performSearch is stable
  );

  // Effect to trigger search when query or mediaType changes
  useEffect(() => {
    // No need to check query.trim() here, performSearch handles it
    debouncedSearch(query, mediaType);

    // Cleanup function to potentially cancel the *last* debounce timer
    // when the component unmounts or dependencies change.
    // The debounce function itself clears previous timers, but this
    // handles the case where the component unmounts *during* the delay.
    return () => {
      // We need access to the timeoutId inside debounce to clear it.
      // Modifying debounce slightly to return a cancel function:
      // (See modified debounce function below if needed, though often
      // the existing logic + latestSearchRef check is sufficient)
    };
  }, [query, mediaType, debouncedSearch]); // debouncedSearch is now stable

  // --- JSX Structure (closer to original, incorporating TV link fix) ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-950 via-black to-gray-900 pt-24 md:pt-32">
      {/* Animated Search Bar */}
      <motion.div
        className="w-full max-w-4xl mb-8" // Added margin-bottom
        variants={searchBarVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Reverted to original structure slightly */}
        <div className="relative bg-gray-900/70 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Filter Dropdown */}
            <select
              value={mediaType}
              onChange={(e) =>
                setMediaType(e.target.value as "anime" | "movies" | "tv")
              }
              className="w-full sm:w-auto bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="anime">Anime</option>
              <option value="movies">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full flex-grow">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search for ${
                  mediaType === "tv" ? "TV Shows" : mediaType
                }...`} // Dynamic placeholder
                // Reverted input styling closer to original
                className="w-full bg-transparent text-white text-xl placeholder-gray-500 border-b-2 border-gray-700 focus:border-indigo-500 focus:outline-none py-2 px-1 transition-colors duration-300"
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
      <div className="mt-12 w-full max-w-4xl">
        {/* Show error only if not loading and error exists */}
        {error && !isLoading ? (
          <div className="text-red-400 text-center text-lg py-8">{error}</div>
        ) : // Show results only if not loading, no error, and results exist
        !isLoading && !error && results.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" // Adjusted grid
            initial="hidden"
            animate="visible"
          >
            {results.map((result, index) => (
              <motion.div
                key={`${result.id}-${result.type}`}
                custom={index}
                variants={resultVariants}
                // Reverted card styling closer to original
                className="bg-gray-900/70 border border-gray-800/50 rounded-xl p-4 backdrop-blur-md hover:bg-gray-800/80 transition-all duration-300"
              >
                {/* Use the helper function for the link */}
                <Link
                  href={`/${getLinkPath(result.type)}/${result.id}`}
                  className="block group"
                >
                  <div className="aspect-[2/3] relative overflow-hidden rounded-lg shadow-md mb-3">
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          // Optional: Handle image loading errors, e.g., show placeholder
                          console.error("Image load error:", result.image);
                          // e.currentTarget.src = '/placeholder.png'; // Example
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 rounded-lg">
                        No Image
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-medium text-white line-clamp-1 group-hover:text-indigo-400 transition-colors duration-200">
                    {result.title}
                  </h3>
                  <p className="text-xs text-gray-400 capitalize">
                    {result.type === "tv" ? "TV Show" : result.type}
                  </p>
                  {/* Overview is optional - kept original logic */}
                  {result.overview && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {result.overview}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : // Show 'no results' only if not loading, no error, query exists, but no results
        !isLoading && !error && query.trim() && results.length === 0 ? (
          <div className="text-gray-400 text-center text-lg py-8">
            No results found for "{query}"
          </div>
        ) : // If loading, or initial state (no query), show nothing here
        null}
      </div>
    </div>
  );
}


