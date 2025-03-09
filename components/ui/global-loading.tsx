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
    
    setIsLoading(true);
    timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  // Intercept fetch requests
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const isApiCall = typeof args[0] === 'string' && 
        (args[0].startsWith('/api/') || args[0].includes('api.'));
      
      if (isApiCall) {
        setPendingFetches(count => count + 1);
        setIsLoading(true);
      }
      
      try {
        const response = await originalFetch.apply(window, args);
        return response;
      } finally {
        if (isApiCall) {
          setPendingFetches(count => {
            const newCount = count - 1;
            if (newCount <= 0) {
              setIsLoading(false);
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
        {showLoading && <CleanAnimeLoading />}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

function CleanAnimeLoading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center">
        {/* Simple logo/text */}
        <motion.div
          className="text-purple-300 text-3xl font-medium tracking-widest mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ textShadow: '0 0 8px rgba(168, 85, 247, 0.5)' }}
        >
          ANDWATCH
        </motion.div>
        
        {/* Clean progress bar with subtle anime glow */}
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.7)' }}
          />
        </div>
        
        {/* Simple status text with anime-style dot animation */}
        <div className="mt-6 text-white/80 text-sm font-light tracking-wider flex items-center">
          <span>Loading</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0 }}
            className="mx-0.5"
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.2 }}
            className="mx-0.5"
          >.</motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.4 }}
            className="mx-0.5"
          >.</motion.span>
        </div>
      </div>
    </motion.div>
  );
}