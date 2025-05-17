// components/ui/global-loading.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Create a context for the loading state
const LoadingContext = createContext({
  isLoading: false,
  setManualLoading: (_: boolean) => {},
});

export const useGlobalLoading = () => useContext(LoadingContext);

export default function GlobalLoadingProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [pendingFetches, setPendingFetches] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const navigationStartTime = useRef<number | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle route changes with optimized loading approach
  useEffect(() => {
    // Clear any existing timeouts
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    // Record navigation start time
    navigationStartTime.current = Date.now();

    // Show loading indicator immediately for better perceived performance
    // This makes navigation feel instant while still preventing flashes for quick loads
    setIsLoading(true);

    // Auto-hide after 2 seconds if something goes wrong
    hideTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [pathname, searchParams]);

  // Prefetch common routes for faster navigation
  useEffect(() => {
    // Prefetch main navigation routes
    const commonRoutes = ['/anime', '/movies', '/tvshows', '/profile', '/search'];
    commonRoutes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  // Optimized fetch interception
  useEffect(() => {
    const originalFetch = window.fetch;
    let activeFetchCounter = 0;
    let lastFetchCompletedAt = 0;

    window.fetch = async function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : '';
      const isApiCall = url.startsWith('/api/') || url.includes('api.');

      if (isApiCall) {
        activeFetchCounter++;
        setPendingFetches(count => count + 1);

        // Show loading immediately for API calls to improve perceived performance
        setIsLoading(true);
      }

      try {
        const response = await originalFetch.apply(window, args);
        return response;
      } finally {
        if (isApiCall) {
          activeFetchCounter--;
          lastFetchCompletedAt = Date.now();

          setPendingFetches(count => {
            const newCount = count - 1;
            if (newCount <= 0) {
              // Hide loading immediately when all fetches complete
              if (activeFetchCounter === 0) {
                setIsLoading(false);
              }
            }
            return newCount;
          });
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const showLoading = isLoading || pendingFetches > 0 || isManualLoading;

  return (
    <LoadingContext.Provider value={{ isLoading: showLoading, setManualLoading: setIsManualLoading }}>
      {children}
      <AnimatePresence>
        {showLoading && <ThemedLoadingIndicator />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

// Movie/TV/Anime themed loading indicator
function ThemedLoadingIndicator() {
  // Random selection of themed elements
  const [theme] = useState(() => {
    const themes = ['movie', 'tv', 'anime'];
    return themes[Math.floor(Math.random() * themes.length)];
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }} // Ultra-fast fade in/out for better responsiveness
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center max-w-md px-6">
        {/* Themed logo animation */}
        <motion.div
          className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 text-4xl font-bold tracking-widest mb-8"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ textShadow: '0 0 15px rgba(168, 85, 247, 0.7)' }}
        >
          ANDWATCH
        </motion.div>

        {/* Themed loading animation */}
        <div className="relative w-full mb-8">
          {theme === 'movie' && (
            <div className="flex items-center justify-center mb-4">
              <motion.div
                className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-10 h-10 border-4 border-t-transparent border-purple-500 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute w-24 h-24 border-2 border-indigo-500/30 rounded-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.5 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </div>
          )}

          {theme === 'tv' && (
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-20 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                  animate={{
                    x: ["-100%", "100%"],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>
          )}

          {theme === 'anime' && (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <motion.div
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500/0 to-purple-500/0"
                  animate={{
                    scale: [1, 1.8],
                    opacity: [0.7, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              </div>
            </div>
          )}

          {/* Enhanced progress bar */}
          <div className="w-full h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 background-animate"
              initial={{ width: "15%" }}
              animate={{ width: "95%" }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeOut"
              }}
              style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.7)' }}
            />
          </div>
        </div>

        {/* Themed loading message */}
        <motion.div
          className="text-white/90 text-sm font-medium tracking-wider flex items-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {theme === 'movie' && "Preparing your cinematic experience"}
          {theme === 'tv' && "Tuning your TV channels"}
          {theme === 'anime' && "Summoning your anime content"}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0 }}
            className="mx-0.5"
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.15 }}
            className="mx-0.5"
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.3 }}
            className="mx-0.5"
          >.</motion.span>
        </motion.div>
      </div>
    </motion.div>
  );
}