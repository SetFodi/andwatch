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
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-10 rounded-3xl shadow-xl text-center border border-gray-700/50 backdrop-blur-md"
    >
      <svg className="w-20 h-20 mx-auto mb-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
      <p className="text-gray-200 text-xl font-light mb-6">
        {mediaType === "both" ? "Your journey awaits—add some titles!" : `No ${mediaType}s yet—time to explore!`}
      </p>
      <div className="flex justify-center gap-4">
        {(mediaType === "anime" || mediaType === "both") && (
          <Link href="/anime" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
            Explore Anime
          </Link>
        )}
        {(mediaType === "movie" || mediaType === "both") && (
          <Link href="/movies" className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-full hover:from-rose-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
            Explore Movies
          </Link>
        )}
      </div>
    </motion.div>
  );
}