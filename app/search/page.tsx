"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { animeApi, movieApi } from "../../lib/services/api";
import Link from "next/link";
import Image from "next/image";

type SearchResult = {
  id: number | string;
  title: string;
  type: "anime" | "movies";
  image?: string;
  overview?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [mediaType, setMediaType] = useState<"anime" | "movies" | "">("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation variants for the search bar
  const searchBarVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Animation variants for results
  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  // Enhanced search function with debugging
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let animeResults = [];
      let movieResults = [];

      // Search anime if selected or all
      if (!mediaType || mediaType === "anime") {
        const animeData = await animeApi.searchAnime(query, 1);
        animeResults = animeData.data?.map((item: any) => ({
          id: item.mal_id,
          title: item.title,
          type: "anime" as const,
          image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
          overview: item.synopsis,
        })) || [];
        console.log("Anime results:", animeResults);
      }

      // Search movies if selected or all
      if (!mediaType || mediaType === "movies") {
        const movieData = await movieApi.searchMovies(query, 1);
        console.log("Movie API response:", movieData);
        if (movieData.results && Array.isArray(movieData.results)) {
          movieResults = movieData.results.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: "movies" as const,
            image: movieApi.getImageUrl(item.poster_path),
            overview: item.overview,
          }));
        } else {
          console.warn("Movie API returned no valid results:", movieData);
          movieResults = [];
        }
        console.log("Movie results:", movieResults);
      }

      const combinedResults = [...animeResults, ...movieResults].slice(0, 10); // Limit to 10 results
      if (combinedResults.length === 0) {
        setError("No results found for your query.");
      } else {
        setResults(combinedResults);
      }
    } catch (err: any) {
      console.error("Search error details:", err);
      setError(`Failed to fetch search results. Please try again. Details: ${err.message}`);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger search on Enter key or button click
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
              onChange={(e) => setMediaType(e.target.value as "anime" | "movies" | "")}
              className="w-full sm:w-auto bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <option value="">All</option>
              <option value="anime">Anime</option>
              <option value="movies">Movies</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for anime or movies..."
                className="w-full bg-transparent text-white text-xl placeholder-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl py-3 px-6 pr-12 transition-all duration-300"
              />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="mt-12 w-full max-w-4xl">
        {isLoading ? (
          <div className="text-gray-400 text-center text-lg">Searching...</div>
        ) : error ? (
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
        ) : query.trim() ? (
          <div className="text-gray-400 text-center text-lg">No results found for "{query}"</div>
        ) : null}
      </div>
    </div>
  );
}