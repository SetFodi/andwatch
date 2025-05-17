'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface EnhancedSearchFilterProps {
  mediaType: 'anime' | 'movies' | 'tv';
  setMediaType: (type: 'anime' | 'movies' | 'tv') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  genreFilter: string;
  setGenreFilter: (genre: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  onSearch: () => void;
}

export default function EnhancedSearchFilter({
  mediaType,
  setMediaType,
  sortBy,
  setSortBy,
  genreFilter,
  setGenreFilter,
  yearFilter,
  setYearFilter,
  onSearch
}: EnhancedSearchFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current year for year filter options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

  // Media type options with icons
  const mediaTypes = [
    { 
      value: 'anime', 
      label: 'Anime',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-pink-600 to-rose-500'
    },
    { 
      value: 'movies', 
      label: 'Movies',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      color: 'from-amber-600 to-orange-500'
    },
    { 
      value: 'tv', 
      label: 'TV Shows',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-sky-600 to-blue-500'
    }
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'rating', label: 'Rating' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'alphabetical', label: 'A-Z' }
  ];

  // Genre options based on media type
  const getGenres = () => {
    switch(mediaType) {
      case 'anime':
        return [
          { value: '', label: 'All Genres' },
          { value: 'action', label: 'Action' },
          { value: 'adventure', label: 'Adventure' },
          { value: 'comedy', label: 'Comedy' },
          { value: 'drama', label: 'Drama' },
          { value: 'fantasy', label: 'Fantasy' },
          { value: 'horror', label: 'Horror' },
          { value: 'romance', label: 'Romance' },
          { value: 'sci-fi', label: 'Sci-Fi' },
          { value: 'slice-of-life', label: 'Slice of Life' }
        ];
      case 'movies':
      case 'tv':
        return [
          { value: '', label: 'All Genres' },
          { value: 'action', label: 'Action' },
          { value: 'adventure', label: 'Adventure' },
          { value: 'animation', label: 'Animation' },
          { value: 'comedy', label: 'Comedy' },
          { value: 'crime', label: 'Crime' },
          { value: 'documentary', label: 'Documentary' },
          { value: 'drama', label: 'Drama' },
          { value: 'family', label: 'Family' },
          { value: 'fantasy', label: 'Fantasy' },
          { value: 'history', label: 'History' },
          { value: 'horror', label: 'Horror' },
          { value: 'music', label: 'Music' },
          { value: 'mystery', label: 'Mystery' },
          { value: 'romance', label: 'Romance' },
          { value: 'science-fiction', label: 'Science Fiction' },
          { value: 'thriller', label: 'Thriller' },
          { value: 'war', label: 'War' },
          { value: 'western', label: 'Western' }
        ];
      default:
        return [{ value: '', label: 'All Genres' }];
    }
  };

  return (
    <div className="w-full bg-gray-900/70 border border-gray-800/50 rounded-2xl p-4 backdrop-blur-md shadow-xl">
      {/* Media Type Selector */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex p-1 bg-gray-800/50 rounded-xl">
          {mediaTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setMediaType(type.value as 'anime' | 'movies' | 'tv')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                mediaType === type.value
                  ? `bg-gradient-to-r ${type.color} text-white shadow-md`
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle for Advanced Filters */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center text-sm text-gray-400 hover:text-white transition-colors py-1"
      >
        <span>Advanced Filters</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="ml-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.span>
      </button>

      {/* Advanced Filters */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pt-3 space-y-3">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {getGenres().map((genre) => (
                <option key={genre.value} value={genre.value}>{genre.label}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={onSearch}
            className="w-full py-2 mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-indigo-500/30 text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}
