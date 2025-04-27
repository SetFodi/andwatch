// components/ui/global-loading.tsx
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

  // Handle route changes with smarter loading approach
  useEffect(() => {
    let loadingShowTimeoutId: NodeJS.Timeout;
    let loadingHideTimeoutId: NodeJS.Timeout;
    
    // Only show loading indicator if navigation takes longer than 150ms
    // This prevents flashing for quick page loads
    loadingShowTimeoutId = setTimeout(() => {
      setIsLoading(true);
      
      // Auto-hide after 3 seconds if something goes wrong to prevent permanent loading
      loadingHideTimeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }, 150);
    
    return () => {
      clearTimeout(loadingShowTimeoutId);
      clearTimeout(loadingHideTimeoutId);
    };
  }, [pathname, searchParams]);

  // Intercept fetch requests with smarter tracking
  useEffect(() => {
    const originalFetch = window.fetch;
    let activeFetchCounter = 0;
    let lastFetchCompletedAt = 0;
    
    window.fetch = async function(...args) {
      const isApiCall = typeof args[0] === 'string' && 
        (args[0].startsWith('/api/') || args[0].includes('api.'));
      
      if (isApiCall) {
        activeFetchCounter++;
        setPendingFetches(count => count + 1);
        
        // Only set loading to true if we haven't already shown loading
        // or if it's been more than 300ms since the last fetch completed
        if (activeFetchCounter === 1 || Date.now() - lastFetchCompletedAt > 300) {
          setIsLoading(true);
        }
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
              // Add a tiny delay before hiding to prevent flickering
              // when multiple fetches complete close to each other
              setTimeout(() => {
                if (activeFetchCounter === 0) {
                  setIsLoading(false);
                }
              }, 100);
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
        {showLoading && <OptimizedLoadingIndicator />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

function OptimizedLoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} // Faster fade in/out
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="text-purple-300 text-3xl font-medium tracking-widest mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ textShadow: '0 0 8px rgba(168, 85, 247, 0.5)' }}
        >
          ANDWATCH
        </motion.div>
        
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 1.5, // Faster animation
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.7)' }}
          />
        </div>
        
        <div className="mt-4 text-white/80 text-sm font-light tracking-wider flex items-center">
          <span>Loading</span>
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
        </div>
      </div>
    </motion.div>
  );
}