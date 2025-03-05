"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type MediaType = "anime" | "movie" | "both";

interface EmptyStateProps {
  mediaType: MediaType;
  filterActive?: boolean;
}

export default function EmptyState({ mediaType, filterActive = false }: EmptyStateProps) {
  // Determine appropriate message and icon based on media type and if filters are active
  let message = "";
  let subMessage = "";
  let buttonText = "";
  let buttonLink = "";
  
  if (filterActive) {
    message = "No results found";
    subMessage = "Try adjusting your filters or search query";
    buttonText = "Clear filters";
    buttonLink = "#"; // This would be handled via onClick in a real implementation
  } else {
    switch (mediaType) {
      case "anime":
        message = "No anime found in your list";
        subMessage = "Start adding anime to your watchlist";
        buttonText = "Discover Anime";
        buttonLink = "/anime";
        break;
      case "movie":
        message = "No movies found in your list";
        subMessage = "Start adding movies to your watchlist";
        buttonText = "Discover Movies";
        buttonLink = "/movies";
        break;
      case "both":
      default:
        message = "Your list is empty";
        subMessage = "Start adding anime or movies to your watchlist";
        buttonText = "Discover content";
        buttonLink = "/";
        break;
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="h-20 w-20 rounded-full bg-gray-800/80 flex items-center justify-center mb-6">
        {filterActive ? (
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        )}
      </div>
      <h3 className="text-2xl font-light text-white mb-2">{message}</h3>
      <p className="text-gray-500 max-w-md mb-8">{subMessage}</p>
      
      <Link 
        href={buttonLink}
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl text-white shadow-md transition-all duration-300 hover:shadow-lg"
      >
        {buttonText}
      </Link>
    </motion.div>
  );
}