"use client";

import { Tab } from "@headlessui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import MediaCard from "./MediaCard";
import EmptyState from "./EmptyState";

interface CategorySectionClientProps {
  watching: Array<{
    id: string | number;
    title: string;
    image: string | null;
    score: number | null;
    type: "anime" | "movie";
    year: number | null;
    url: string;
    userRating?: number | null;
    status?: string | null;
  }>;
  planning: Array<{
    id: string | number;
    title: string;
    image: string | null;
    score: number | null;
    type: "anime" | "movie";
    year: number | null;
    url: string;
    userRating?: number | null;
    status?: string | null;
  }>;
  completed: Array<{
    id: string | number;
    title: string;
    image: string | null;
    score: number | null;
    type: "anime" | "movie";
    year: number | null;
    url: string;
    userRating?: number | null;
    status?: string | null;
  }>;
}

export default function CategorySectionClient({ watching, planning, completed }: CategorySectionClientProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-gray-800/50 backdrop-blur-md p-1 rounded-xl border border-gray-700/50 mb-6">
          {["Watching", "Planning", "Completed"].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                  selected
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            {watching.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {watching.map((item, index) => (
                  <MediaCard key={index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState mediaType="both" />
            )}
            {watching.length > 0 && (
              <div className="mt-6 text-center">
                <Link href="/profile/watching" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200 hover:underline">
                  View All ({watching.length})
                </Link>
              </div>
            )}
          </Tab.Panel>
          <Tab.Panel>
            {planning.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {planning.map((item, index) => (
                  <MediaCard key={index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState mediaType="both" />
            )}
            {planning.length > 0 && (
              <div className="mt-6 text-center">
                <Link href="/profile/planning" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200 hover:underline">
                  View All ({planning.length})
                </Link>
              </div>
            )}
          </Tab.Panel>
          <Tab.Panel>
            {completed.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {completed.map((item, index) => (
                  <MediaCard key={index} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState mediaType="both" />
            )}
            {completed.length > 0 && (
              <div className="mt-6 text-center">
                <Link href="/profile/completed" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200 hover:underline">
                  View All ({completed.length})
                </Link>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </motion.div>
  );
}