"use client";

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MediaCard from "./MediaCard";
import EmptyState from "./EmptyState";
import LazyLoadSection from "@/components/ui/LazyLoadSection";
import { MediaGridSkeleton } from "@/components/ui/SkeletonLoader";

interface MediaItem {
  id: string | number;
  title: string;
  image: string | null;
  score: number | null;
  type: "anime" | "movie" | "tv";
  year: number | null;
  url: string;
  userRating?: number | null;
  status?: string | null;
  isPlaceholder?: boolean;
}

interface CategorySectionClientProps {
  watching: MediaItem[];
  planning: MediaItem[];
  completed: MediaItem[];
  totalWatching: number;
  totalPlanning: number;
  totalCompleted: number;
}

export default function CategorySectionClient({
  watching = [], // Provide default values
  planning = [],
  completed = [],
  totalWatching = 0,
  totalPlanning = 0,
  totalCompleted = 0
}: CategorySectionClientProps) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Use this effect to handle the initial animation and loading state
  useEffect(() => {
    // Set a shorter timeout to improve perceived performance
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 300); // Much shorter to improve perceived performance

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleConnectionError = (event: ErrorEvent) => {
      if (event.message &&
         (event.message.includes('Connection closed') ||
          event.message.includes('failed to fetch'))) {
        setConnectionError("There was a problem loading your data. Please try refreshing the page.");
      }
    };

    window.addEventListener('error', handleConnectionError);
    return () => window.removeEventListener('error', handleConnectionError);
  }, []);

  const categories = [
    {
      name: "Watching",
      loadedItems: watching,
      totalCount: totalWatching,
      color: "from-blue-600 to-indigo-600",
      icon: PlayIcon
    },
    {
      name: "Planning",
      loadedItems: planning,
      totalCount: totalPlanning,
      color: "from-purple-600 to-pink-600",
      icon: CalendarIcon
    },
    {
      name: "Completed",
      loadedItems: completed,
      totalCount: totalCompleted,
      color: "from-emerald-600 to-teal-600",
      icon: CheckIcon
    }
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  // Create a shimmer loading placeholder
  const renderLoadingPlaceholder = () => (
    <MediaGridSkeleton count={10} />
  );

  // If we have a connection error
  if (connectionError) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-red-500/30 p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-xl font-medium text-white mb-2">Connection Error</h3>
        <p className="text-gray-300 mb-4">{connectionError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600/30 hover:bg-red-600/50 text-white rounded-lg transition-colors border border-red-500/50"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="space-y-6"
    >
      <Tab.Group onChange={setSelectedTabIndex}>
        <Tab.List className="flex bg-gray-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-800/50 mb-8 overflow-hidden">
          {categories.map((category, index) => (
            <Tab
              key={category.name}
              className={({ selected }) =>
                `flex items-center justify-center flex-1 py-3 px-4 text-sm md:text-base font-medium rounded-xl transition-all duration-300 ${
                  selected
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg ring-1 ring-white/10`
                    : `text-gray-400 hover:text-white hover:bg-gray-800/60`
                }`
              }
            >
              <category.icon className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">{category.name}</span>
              <span className="ml-2 bg-gray-900/50 px-2 py-0.5 rounded-full text-xs">
                {category.totalCount}
              </span>
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="relative">
          <AnimatePresence mode="wait">
            {categories.map((category, idx) => (
              <Tab.Panel
                key={idx}
                className={`${selectedTabIndex === idx ? 'block' : 'hidden'}`}
                static
              >
                {isInitialLoad ? (
                  // Show loading placeholder during initial load
                  renderLoadingPlaceholder()
                ) : category.loadedItems && category.loadedItems.length > 0 ? (
                  <LazyLoadSection
                    delay={100 * idx} // Stagger loading by tab index
                    placeholder={renderLoadingPlaceholder()}
                  >
                    <motion.div
                      key={`panel-${idx}`}
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                    >
                      {category.loadedItems.map((item, index) => (
                        <MediaCard key={`${item.id || 'item'}-${index}`} item={item} />
                      ))}
                    </motion.div>
                  </LazyLoadSection>
                ) : (
                  <EmptyState mediaType="both" />
                )}

                {!isInitialLoad && (
                  <LazyLoadSection
                    delay={200 * idx} // Load after content
                    threshold={0.05}
                    className="mt-8 text-center"
                    placeholder={
                      <div className="mt-8 text-center">
                        <div className="inline-block h-10 w-40 bg-gray-800/50 rounded-xl animate-pulse"></div>
                      </div>
                    }
                  >
                    {category.loadedItems && category.loadedItems.length > 0 ? (
                      <>
                        {category.loadedItems.length < category.totalCount && (
                          <p className="text-gray-400 mb-4">
                            Showing {category.loadedItems.length} of {category.totalCount} items
                          </p>
                        )}
                        <Link
                          href={`/profile/${category.name.toLowerCase()}`}
                          className={`inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r ${category.color} text-white font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                          prefetch={true}
                        >
                          <span>View All {category.totalCount} {category.name}</span>
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </>
                    ) : category.totalCount > 0 ? (
                      <Link
                        href={`/profile/${category.name.toLowerCase()}`}
                        className={`inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r ${category.color} text-white font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                        prefetch={true}
                      >
                        <span>View All {category.totalCount} {category.name}</span>
                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    ) : null}
                  </LazyLoadSection>
                )}
              </Tab.Panel>
            ))}
          </AnimatePresence>
        </Tab.Panels>
      </Tab.Group>
    </motion.div>
  );
}

// Icons
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}