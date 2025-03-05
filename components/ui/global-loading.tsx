"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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

  // Handle route changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Set loading true immediately on route change
    setIsLoading(true);
    
    // After a short delay, set loading to false
    // This ensures the animation is visible even for fast page loads
    timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  // Intercept all fetch requests to show loading state
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override fetch with our interceptor
    window.fetch = async function(...args) {
      // Only track API calls, not static assets
      const isApiCall = typeof args[0] === 'string' && 
        (args[0].startsWith('/api/') || args[0].includes('api.'));
      
      if (isApiCall) {
        setPendingFetches(count => count + 1);
        setIsLoading(true);
      }
      
      try {
        // Call the original fetch
        const response = await originalFetch.apply(window, args);
        return response;
      } finally {
        if (isApiCall) {
          // Decrement pending fetches
          setPendingFetches(count => {
            const newCount = count - 1;
            // Only set loading to false if no fetches are pending
            if (newCount <= 0) {
              setIsLoading(false);
            }
            return newCount;
          });
        }
      }
    };
    
    // Restore original fetch on cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Combined loading state (route changes, fetch requests, or manual)
  const showLoading = isLoading || pendingFetches > 0 || isManualLoading;

  return (
    <LoadingContext.Provider value={{ isLoading: showLoading, setManualLoading: setIsManualLoading }}>
      {children}
      
      <AnimatePresence>
        {showLoading && <LoadingAnimation />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="relative w-24 h-24">
        {/* Main rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 border-b-violet-600 border-l-fuchsia-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
        />
        
        {/* Secondary rotating ring (opposite direction) */}
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-400 border-r-violet-400 border-b-fuchsia-400 border-l-indigo-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
        />
        
        {/* Pulsing center */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full shadow-lg" />
        </motion.div>
        
        {/* Orbiting particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
            initial={{ 
              x: 0, 
              y: 0,
              opacity: 0 
            }}
            animate={{
              x: [0, Math.cos(i * Math.PI / 3) * 40],
              y: [0, Math.sin(i * Math.PI / 3) * 40],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              repeatType: "loop"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}