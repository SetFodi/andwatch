// app/search/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // Import useCallback
import { motion } from "framer-motion";
import { animeApi } from "../../lib/services/api";
import Link from "next/link";
import Image from "next/image";
import EnhancedSearchFilter from "@/components/ui/EnhancedSearchFilter";

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
  const [mediaType, setMediaType] = useState<"anime" | "movies" | "tv">("anime");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced filter states
  const [sortBy, setSortBy] = useState("popularity");
  const [genreFilter, setGenreFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

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

  // Enhanced search function with filters
  const performSearch = async (
    searchQuery: string,
    type: "anime" | "movies" | "tv",
    filters = { sort: sortBy, genre: genreFilter, year: yearFilter }
  ) => {
    const searchRequestId = Date.now().toString();
    latestSearchRef.current = searchRequestId;

    // Allow empty query for browsing with filters
    if (!searchQuery.trim() && !filters.genre && !filters.year) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let apiResults: SearchResult[] = [];

      if (type === "anime") {
        // Check ref before API call
        if (latestSearchRef.current !== searchRequestId) return;

        // Use different API methods based on whether we're searching or browsing
        let animeData;
        if (searchQuery.trim()) {
          animeData = await animeApi.searchAnime(searchQuery, 1);
        } else {
          // If no query but has filters, use top anime as base
          animeData = await animeApi.getTopAnime(1);
        }

        // Check ref after API call
        if (latestSearchRef.current !== searchRequestId) return;

        // Map and filter results
        let mappedResults = animeData.data?.map((item: any) => ({
          id: item.mal_id,
          title: item.title,
          type: "anime" as const,
          image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          overview: item.synopsis,
          year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : null),
          genres: item.genres?.map((g: any) => g.name.toLowerCase()) || []
        })) || [];

        // Apply filters
        if (filters.genre) {
          mappedResults = mappedResults.filter(item =>
            item.genres.some((g: string) => g.includes(filters.genre.toLowerCase()))
          );
        }

        if (filters.year) {
          mappedResults = mappedResults.filter(item =>
            item.year === parseInt(filters.year)
          );
        }

        // Apply sorting
        if (filters.sort) {
          mappedResults = sortResults(mappedResults, filters.sort);
        }

        apiResults = mappedResults;
      } else if (type === "movies") {
        if (latestSearchRef.current !== searchRequestId) return;

        // Use different API methods based on whether we're searching or browsing
        let movieData;
        if (searchQuery.trim()) {
          const response = await fetch(`/api/search/movies?q=${encodeURIComponent(searchQuery)}&page=1`);
          movieData = await response.json();
        } else {
          // If no query but has filters, use popular movies as base
          const response = await fetch(`/api/search/popular?type=movies&page=1`);
          movieData = await response.json();
        }

        if (latestSearchRef.current !== searchRequestId) return;

        if (movieData.results && Array.isArray(movieData.results)) {
          let mappedResults = movieData.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: "movies" as const,
            image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            overview: item.overview,
            year: item.release_date ? new Date(item.release_date).getFullYear() : null,
            genres: item.genre_ids || []
          }));

          // Apply filters
          if (filters.year) {
            mappedResults = mappedResults.filter(item =>
              item.year === parseInt(filters.year)
            );
          }

          // Apply sorting
          if (filters.sort) {
            mappedResults = sortResults(mappedResults, filters.sort);
          }

          apiResults = mappedResults;
        }
      } else if (type === "tv") {
        if (latestSearchRef.current !== searchRequestId) return;

        // Use different API methods based on whether we're searching or browsing
        let tvData;
        if (searchQuery.trim()) {
          const response = await fetch(`/api/search/tv?q=${encodeURIComponent(searchQuery)}&page=1`);
          tvData = await response.json();
        } else {
          // If no query but has filters, use popular TV shows as base
          const response = await fetch(`/api/search/popular?type=tv&page=1`);
          tvData = await response.json();
        }

        if (latestSearchRef.current !== searchRequestId) return;

        if (tvData.results && Array.isArray(tvData.results)) {
          let mappedResults = tvData.results.map((item: any) => ({
            id: item.id,
            title: item.name,
            type: "tv" as const,
            image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            overview: item.overview,
            year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
            genres: item.genre_ids || []
          }));

          // Apply filters
          if (filters.year) {
            mappedResults = mappedResults.filter(item =>
              item.year === parseInt(filters.year)
            );
          }

          // Apply sorting
          if (filters.sort) {
            mappedResults = sortResults(mappedResults, filters.sort);
          }

          apiResults = mappedResults;
        }
      }

      // Final check before setting state
      if (latestSearchRef.current === searchRequestId) {
        const limitedResults = apiResults.slice(0, 20); // Show more results
        setResults(limitedResults);
        setError(
          limitedResults.length === 0 && (searchQuery.trim() || filters.genre || filters.year)
            ? "No results found for your query and filters."
            : null
        );
      }
    } catch (err: any) {
      if (latestSearchRef.current === searchRequestId) {
        console.error("Search error:", err);
        // Check for rate limit error specifically if possible
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

  // Helper function to sort results
  const sortResults = (results: any[], sortType: string) => {
    switch (sortType) {
      case 'popularity':
        // Already sorted by popularity in most APIs
        return results;
      case 'rating':
        return [...results].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      case 'newest':
        return [...results].sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'oldest':
        return [...results].sort((a, b) => (a.year || 0) - (b.year || 0));
      case 'alphabetical':
        return [...results].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return results;
    }
  };

  // Create a stable, debounced search function using useCallback
  const debouncedSearch = useCallback(
    debounce((searchQuery: string, type: "anime" | "movies" | "tv") => {
      performSearch(searchQuery, type);
    }, 750), // 750ms delay
    [], // No dependencies needed for useCallback here, performSearch is stable
  );

  // Function to handle search button click or Enter key
  const handleSearch = useCallback(() => {
    performSearch(query, mediaType, { sort: sortBy, genre: genreFilter, year: yearFilter });
  }, [query, mediaType, sortBy, genreFilter, yearFilter, performSearch]);

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
          {/* Search Input */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search for ${
                mediaType === "tv" ? "TV Shows" : mediaType
              } or browse by filters...`}
              className="w-full bg-transparent text-white text-xl placeholder-gray-500 border-b-2 border-gray-700 focus:border-indigo-500 focus:outline-none py-2 px-1 transition-colors duration-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {isLoading ? (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
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
            ) : (
              <button
                onClick={handleSearch}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
          </div>

          {/* Enhanced Search Filter */}
          <EnhancedSearchFilter
            mediaType={mediaType}
            setMediaType={setMediaType}
            sortBy={sortBy}
            setSortBy={setSortBy}
            genreFilter={genreFilter}
            setGenreFilter={setGenreFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            onSearch={handleSearch}
          />
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
                        onError={() => {
                          // Handle image loading errors
                          console.error("Image load error:", result.image);
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


