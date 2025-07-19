'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  apiResponseTimes?: { [endpoint: string]: number[] };
  memoryUsage?: MemoryInfo;
  networkInfo?: NetworkInformation;
  timestamp: number;
}

interface PerformanceStats {
  avgResponseTime: number;
  slowestEndpoint: string;
  fastestEndpoint: string;
  errorRate: number;
  totalRequests: number;
  memoryUsage: number;
  performanceScore: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ timestamp: Date.now() });
  const [stats, setStats] = useState<PerformanceStats>({
    avgResponseTime: 0,
    slowestEndpoint: '',
    fastestEndpoint: '',
    errorRate: 0,
    totalRequests: 0,
    memoryUsage: 0,
    performanceScore: 100
  });
  const [isVisible, setIsVisible] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Performance observer for Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const newMetrics: Partial<PerformanceMetrics> = {};

      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              newMetrics.fcp = entry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            newMetrics.lcp = (entry as any).startTime;
            break;
          case 'first-input':
            newMetrics.fid = (entry as any).processingStart - entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              newMetrics.cls = (newMetrics.cls || 0) + (entry as any).value;
            }
            break;
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            newMetrics.ttfb = navEntry.responseStart - navEntry.requestStart;
            break;
        }
      });

      setMetrics(prev => ({ ...prev, ...newMetrics, timestamp: Date.now() }));
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'navigation'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  // Monitor API requests
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    const apiTimes: { [key: string]: number[] } = {};
    let requestCount = 0;
    let errorCount = 0;

    window.fetch = async function(...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const startTime = performance.now();
      requestCount++;

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Track API endpoint performance
        if (url.startsWith('/api/')) {
          const endpoint = url.split('?')[0]; // Remove query params
          if (!apiTimes[endpoint]) apiTimes[endpoint] = [];
          apiTimes[endpoint].push(responseTime);
          
          // Keep only last 10 measurements per endpoint
          if (apiTimes[endpoint].length > 10) {
            apiTimes[endpoint] = apiTimes[endpoint].slice(-10);
          }
        }

        if (!response.ok) errorCount++;

        // Update metrics
        setMetrics(prev => ({
          ...prev,
          apiResponseTimes: { ...apiTimes },
          timestamp: Date.now()
        }));

        return response;
      } catch (error) {
        errorCount++;
        throw error;
      }
    };

    // Calculate stats periodically
    const statsInterval = setInterval(() => {
      const allTimes: number[] = [];
      let slowest = { endpoint: '', time: 0 };
      let fastest = { endpoint: '', time: Infinity };

      Object.entries(apiTimes).forEach(([endpoint, times]) => {
        allTimes.push(...times);
        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        
        if (avgTime > slowest.time) {
          slowest = { endpoint, time: avgTime };
        }
        if (avgTime < fastest.time) {
          fastest = { endpoint, time: avgTime };
        }
      });

      const avgResponseTime = allTimes.length > 0 
        ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length 
        : 0;

      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;

      // Calculate performance score
      let score = 100;
      if (metrics.lcp && metrics.lcp > 2500) score -= 20;
      if (metrics.fid && metrics.fid > 100) score -= 15;
      if (metrics.cls && metrics.cls > 0.1) score -= 15;
      if (avgResponseTime > 1000) score -= 20;
      if (errorRate > 5) score -= 30;

      setStats({
        avgResponseTime,
        slowestEndpoint: slowest.endpoint,
        fastestEndpoint: fastest.endpoint === Infinity ? '' : fastest.endpoint,
        errorRate,
        totalRequests: requestCount,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        performanceScore: Math.max(0, score)
      });

      // Generate alerts
      const newAlerts: string[] = [];
      if (avgResponseTime > 2000) newAlerts.push('High API response times detected');
      if (errorRate > 10) newAlerts.push('High error rate detected');
      if (metrics.lcp && metrics.lcp > 4000) newAlerts.push('Poor loading performance detected');
      if ((performance as any).memory?.usedJSHeapSize > 50 * 1024 * 1024) {
        newAlerts.push('High memory usage detected');
      }
      setAlerts(newAlerts);

    }, 5000);

    return () => {
      window.fetch = originalFetch;
      clearInterval(statsInterval);
    };
  }, [metrics.lcp, metrics.fid, metrics.cls]);

  // Memory monitoring
  useEffect(() => {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const memoryInterval = setInterval(() => {
      const memInfo = (performance as any).memory as MemoryInfo;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memInfo,
        timestamp: Date.now()
      }));
    }, 10000);

    return () => clearInterval(memoryInterval);
  }, []);

  // Format time values
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-indigo-600/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-indigo-500/90 transition-colors flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {alerts.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{alerts.length}</span>
          </div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed bottom-4 right-4 z-50 w-80 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-white font-semibold">Performance</h3>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Performance Score */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(stats.performanceScore)}`}>
            {Math.round(stats.performanceScore)}
          </div>
          <p className="text-sm text-gray-400">Performance Score</p>
          
          <div className="mt-2 bg-gray-800/60 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                stats.performanceScore >= 90 ? 'bg-green-500' :
                stats.performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${stats.performanceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Core Web Vitals</h4>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400">LCP</p>
            <p className={`font-semibold ${metrics.lcp && metrics.lcp <= 2500 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.lcp ? formatTime(metrics.lcp) : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400">FID</p>
            <p className={`font-semibold ${metrics.fid && metrics.fid <= 100 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.fid ? formatTime(metrics.fid) : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400">CLS</p>
            <p className={`font-semibold ${metrics.cls && metrics.cls <= 0.1 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400">TTFB</p>
            <p className={`font-semibold ${metrics.ttfb && metrics.ttfb <= 200 ? 'text-green-400' : 'text-yellow-400'}`}>
              {metrics.ttfb ? formatTime(metrics.ttfb) : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* API Performance */}
      <div className="p-4 border-t border-gray-700/50 space-y-3">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">API Performance</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Avg Response Time</span>
            <span className="text-white font-semibold">{formatTime(stats.avgResponseTime)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Total Requests</span>
            <span className="text-white font-semibold">{stats.totalRequests}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Error Rate</span>
            <span className={`font-semibold ${stats.errorRate <= 5 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.errorRate.toFixed(1)}%
            </span>
          </div>

          {stats.memoryUsage > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Memory Usage</span>
              <span className="text-white font-semibold">{formatBytes(stats.memoryUsage)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="p-4 border-t border-gray-700/50">
          <h4 className="text-sm font-medium text-red-400 uppercase tracking-wide mb-2">Alerts</h4>
          <div className="space-y-1">
            {alerts.map((alert, index) => (
              <div key={index} className="text-xs text-red-300 bg-red-900/20 px-2 py-1 rounded">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 text-xs px-3 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 rounded-lg text-white font-medium transition-colors"
          >
            Refresh Page
          </button>
          
          <button
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                  registrations.forEach(registration => registration.unregister());
                });
              }
              
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name));
                });
              }
            }}
            className="flex-1 text-xs px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 font-medium transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Hook to manually track custom performance metrics
export function usePerformanceTracker() {
  const trackEvent = useCallback((name: string, duration?: number) => {
    if (typeof window === 'undefined') return;
    
    performance.mark(`${name}-start`);
    if (duration) {
      setTimeout(() => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }, duration);
    } else {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
  }, []);

  const startTiming = useCallback((name: string) => {
    if (typeof window === 'undefined') return () => {};
    
    const startTime = performance.now();
    performance.mark(`${name}-start`);
    
    return () => {
      const endTime = performance.now();
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      return endTime - startTime;
    };
  }, []);

  return { trackEvent, startTiming };
} 