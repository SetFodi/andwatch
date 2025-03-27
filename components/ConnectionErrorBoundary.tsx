"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ConnectionErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ConnectionErrorBoundary({ children }: ConnectionErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Add global error handler for Connection closed errors
    const handleError = (event: ErrorEvent) => {
      if (event.error && 
          (event.error.message?.includes('Connection closed') || 
           event.error.message?.includes('failed to fetch') ||
           event.error.message?.includes('network'))) {
        
        console.log('Caught connection error:', event.error);
        setHasError(true);
        
        // Prevent default error handling
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Wait a short time before retry to let connections reset
    setTimeout(() => {
      setHasError(false);
      setIsRetrying(false);
      window.location.reload();
    }, 2000);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 border border-gray-700/50 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white text-center mb-2">Connection Error</h2>
          <p className="text-gray-300 text-center mb-6">
            We're having trouble connecting to our servers. This could be due to a temporary connection issue.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`w-full py-3 rounded-xl text-white font-medium transition-all duration-300 ${isRetrying 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'}`}
            >
              {isRetrying ? 'Retrying...' : `Retry Connection${retryCount > 0 ? ` (${retryCount})` : ''}`}
            </button>
            <Link href="/" className="text-center text-indigo-400 hover:text-indigo-300 transition-colors">
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}