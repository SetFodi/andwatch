"use client";
import Link from "next/link";
import { motion } from "framer-motion";

interface EmptyStateProps {
  mediaType: "anime" | "movie" | "both";
}

export default function EmptyState({ mediaType }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/80 p-10 py-16 rounded-3xl shadow-2xl text-center border border-gray-800/40 backdrop-blur-md"
    >
      <div className="flex flex-col items-center max-w-md mx-auto">
        {/* Empty Illustration */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 relative"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-900/30 to-purple-900/30 flex items-center justify-center backdrop-blur-sm border border-indigo-700/20 shadow-xl">
            <svg className="w-16 h-16 text-indigo-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="absolute right-0 bottom-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </motion.div>

        {/* Title & Description */}
        <motion.h3
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-gray-100 mb-3"
        >
          {mediaType === "both" ? "Your Collection is Empty" : `No ${mediaType}s Yet`}
        </motion.h3>
        
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-gray-300 text-sm md:text-base mb-8"
        >
          {mediaType === "both" 
            ? "Start building your personal collection by adding titles that interest you." 
            : `Time to discover some ${mediaType}s and add them to your collection.`}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {(mediaType === "anime" || mediaType === "both") && (
            <Link 
              href="/anime" 
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-500"></span>
              <span className="absolute inset-0 w-0 h-0 bg-white/20 group-hover:w-full group-hover:h-full transition-all duration-300 ease-out rounded-xl"></span>
              <span className="relative flex items-center font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Explore Anime
              </span>
            </Link>
          )}

          {(mediaType === "movie" || mediaType === "both") && (
            <Link 
              href="/movies" 
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-rose-600 to-red-600 opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-500"></span>
              <span className="absolute inset-0 w-0 h-0 bg-white/20 group-hover:w-full group-hover:h-full transition-all duration-300 ease-out rounded-xl"></span>
              <span className="relative flex items-center font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                Explore Movies
              </span>
            </Link>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}