'use client';

import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LazyLoadSectionProps {
  children: ReactNode;
  delay?: number;
  threshold?: number;
  className?: string;
  placeholder?: ReactNode;
}

export default function LazyLoadSection({
  children,
  delay = 100,
  threshold = 0.1,
  className = '',
  placeholder
}: LazyLoadSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  const [sectionRef, setSectionRef] = useState<HTMLDivElement | null>(null);

  // Set up the intersection observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // When section is visible, start loading after the specified delay
          setTimeout(() => {
            setIsVisible(true);
            
            // After content is loaded, disconnect the observer
            if (observer && sectionRef) {
              observer.unobserve(sectionRef);
            }
          }, delay);
        }
      },
      { threshold }
    );
    
    setObserver(obs);
    
    return () => {
      if (obs) {
        obs.disconnect();
      }
    };
  }, [delay, threshold]);

  // Observe the section when ref is available
  useEffect(() => {
    if (observer && sectionRef) {
      observer.observe(sectionRef);
    }
  }, [observer, sectionRef]);

  // Set loaded state after a short delay to allow for animations
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={setSectionRef} className={className}>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      ) : (
        placeholder || (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800/50 rounded-lg w-1/3 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800/30 rounded-lg h-64 w-full"></div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
