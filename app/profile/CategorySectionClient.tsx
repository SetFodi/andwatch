"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MediaCard from "./MediaCard";
import EmptyState from "./EmptyState";

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
}

interface CategorySectionClientProps {
  watching: MediaItem[];
  planning: MediaItem[];
  completed: MediaItem[];
}

export default function CategorySectionClient({ watching, planning, completed }: CategorySectionClientProps) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  
  const categories = [
    { name: "Watching", count: watching.length, items: watching, color: "from-blue-600 to-indigo-600", icon: PlayIcon },
    { name: "Planning", count: planning.length, items: planning, color: "from-purple-600 to-pink-600", icon: CalendarIcon },
    { name: "Completed", count: completed.length, items: completed, color: "from-emerald-600 to-teal-600", icon: CheckIcon }
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
                {category.count}
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
                {category.items.length > 0 ? (
                  <motion.div
                    key={`panel-${idx}`}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  >
                    {category.items.map((item, index) => (
                      <MediaCard key={`${item.id}-${index}`} item={item} />
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState mediaType="both" />
                )}
                
                {category.items.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                  >
                    <Link 
                      href={`/profile/${category.name.toLowerCase()}`} 
                      className={`inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r ${category.color} text-white font-medium text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                    >
                      <span>View All {category.items.length} {category.name}</span>
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </motion.div>
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