'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  message?: string;
  suggestion?: string;
  showHome?: boolean;
  showRefresh?: boolean;
  showDetails?: boolean;
}

export default function ErrorFallback({
  error,
  resetErrorBoundary,
  message = "Something went wrong",
  suggestion = "Please try again later",
  showHome = true,
  showRefresh = true,
  showDetails = false
}: ErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-900/70 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-md shadow-xl"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">{message}</h2>
        <p className="text-gray-400 mb-6">{suggestion}</p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {showRefresh && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white text-sm font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Try Again</span>
            </button>
          )}
          
          {showHome && (
            <Link
              href="/"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-14 0l2 2m0 0l7 7 7-7m-14 0l2-2" />
              </svg>
              <span>Go Home</span>
            </Link>
          )}
        </div>
        
        {showDetails && error && (
          <div className="mt-6">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mx-auto"
            >
              <span>{showErrorDetails ? 'Hide' : 'Show'} Error Details</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showErrorDetails ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showErrorDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-3 bg-gray-800/50 rounded-lg text-left overflow-auto max-h-40"
              >
                <p className="text-red-400 text-xs font-mono">{error.message}</p>
                {error.stack && (
                  <pre className="text-gray-500 text-xs mt-2 whitespace-pre-wrap">
                    {error.stack.split('\n').slice(1, 4).join('\n')}
                  </pre>
                )}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
