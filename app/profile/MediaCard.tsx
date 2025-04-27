"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
  genres?: string[];
  episodes?: number;
  progress?: number;
  totalEpisodes?: number;
  runtime?: number;
  isPlaceholder?: boolean;
}

export default function MediaCard({ item }: { item: MediaItem }) {
  // Add safety check for undefined items
  if (!item) {
    return (
      <div className="flex flex-col h-full bg-gray-900/30 rounded-xl overflow-hidden border border-gray-800/20 p-4">
        <div className="text-gray-500 text-center">Item not available</div>
      </div>
    );
  }

  // Format the status string for display
  const displayStatus = () => {
    if (!item.status) return null;
    
    switch (item.status) {
      case "watching": return "Watching";
      case "plan_to_watch": return "Planning"; // Fixed - match DB value to display value
      case "completed": return "Completed";
      default: return item.status.charAt(0).toUpperCase() + item.status.slice(1);
    }
  };
  
  // Status badge style
  const statusBadgeStyle = () => {
    switch (item.status) {
      case "watching":
        return "bg-blue-900/60 text-blue-300 border-blue-800/50";
      case "plan_to_watch": // Fixed - use database value
        return "bg-purple-900/60 text-purple-300 border-purple-800/50";
      case "completed":
        return "bg-emerald-900/60 text-emerald-300 border-emerald-800/50";
      default:
        return "bg-gray-900/60 text-gray-300 border-gray-800/50";
    }
  };

  // Fix the themeColor to use specific classes instead of dynamic class generation
  const themeColorClass = item.type === "anime" ? "text-indigo-400" : 
                          item.type === "tv" ? "text-blue-400" : "text-red-400";
  
  // Get the rating source label
  const ratingSource = item.type === "anime" ? "MAL" : "TMDB";
  
  // If this is a placeholder (failed to load), show a special style
  const isPlaceholder = item.isPlaceholder === true;

  return (
    <Link href={item.url || "#"} className="block h-full">
      <motion.div 
        className={`flex flex-col h-full ${isPlaceholder ? 'bg-gray-900/30' : 'bg-gray-900/50'} backdrop-blur-sm rounded-xl overflow-hidden border ${isPlaceholder ? 'border-gray-800/20' : 'border-gray-800/40'} hover:border-gray-700/80 shadow-lg hover:shadow-xl transition-all duration-300 group`}
        whileHover={{ scale: 1.02 }}
      >
        {/* Fixed aspect ratio container for consistent sizing */}
        <div className="aspect-[3/4] relative overflow-hidden">
          {item.image && !isPlaceholder ? (
            <>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII="
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            </>
          ) : (
            // Placeholder for missing image
            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gradient-to-br from-gray-800 to-gray-900">
              <svg className="w-12 h-12 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isPlaceholder && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  Loading failed
                </div>
              )}
            </div>
          )}
          
          {/* Status badge */}
          {item.status && (
            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-xs font-medium border ${statusBadgeStyle()}`}>
              {displayStatus()}
            </div>
          )}
          
          {/* Type badge */}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium ${
            item.type === "anime" 
              ? "bg-indigo-900/60 text-indigo-300 border border-indigo-800/50" 
              : item.type === "tv"
                ? "bg-blue-900/60 text-blue-300 border border-blue-800/50"
                : "bg-red-900/60 text-red-300 border border-red-800/50"
          }`}>
            {item.type === "anime" ? "Anime" : item.type === "tv" ? "TV" : "Movie"}
          </div>
          
          {/* User rating badge */}
          {item.userRating && (
            <div className="absolute bottom-2 right-2 flex items-center px-2 py-1 rounded-md bg-yellow-900/60 border border-yellow-800/50">
              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-semibold text-white">{item.userRating}/10</span>
            </div>
          )}
          
          {/* Progress indicator for watching anime/tv */}
          {item.status === "watching" && item.progress !== undefined && item.totalEpisodes && (
            <div className="absolute bottom-2 left-2 bg-blue-900/70 border border-blue-800/60 rounded-md px-2 py-1">
              <div className="flex items-center">
                <span className="text-xs font-medium text-blue-300">
                  {item.progress}/{item.totalEpisodes}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-16 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (item.progress / item.totalEpisodes) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Fixed height content area for consistent card heights */}
        <div className="p-4 flex flex-col flex-grow min-h-[6rem]">
          <h3 className={`text-white font-medium line-clamp-2 mb-1 group-hover:${themeColorClass} transition-colors duration-300 ${isPlaceholder ? 'opacity-60' : ''}`}>
            {item.title}
          </h3>
          
          <div className="flex items-center mt-1 text-xs text-gray-400">
            {item.year && <span className="mr-2">{item.year}</span>}
            
            {item.episodes && (
              <>
                <span className="mx-1 text-gray-600">•</span>
                <span>{item.episodes} eps</span>
              </>
            )}
            
            {item.runtime && (
              <>
                <span className="mx-1 text-gray-600">•</span>
                <span>{item.runtime} min</span>
              </>
            )}
            
            {item.score && (
              <>
                <span className="mx-1 text-gray-600">•</span>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className={themeColorClass}>
                    {item.score}
                    <span className="text-gray-500 text-[10px] ml-1">{ratingSource}</span>
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Genres */}
          {item.genres && item.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.genres.slice(0, 2).map((genre) => (
                <span 
                  key={genre} 
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-gray-800/70 text-gray-400"
                >
                  {genre}
                </span>
              ))}
              {item.genres.length > 2 && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-gray-800/70 text-gray-500">
                  +{item.genres.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}