"use client";

import { useState, useEffect } from 'react';
import ErrorFallback from './ui/ErrorFallback';

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
        <ErrorFallback
          error={new Error("Connection Error")}
          message="Connection Error"
          suggestion={`We're having trouble connecting to our servers. This could be due to a temporary connection issue.${isRetrying ? ' Retrying...' : ''}`}
          showHome={true}
          showRefresh={!isRetrying}
          showDetails={false}
          resetErrorBoundary={isRetrying ? undefined : handleRetry}
        />
      </div>
    );
  }

  return <>{children}</>;
}