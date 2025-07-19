'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'anime' | 'movie' | 'tv';
  year?: number;
  image?: string;
  score?: number;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSelect?: (item: SearchSuggestion) => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  mediaType?: 'all' | 'anime' | 'movie' | 'tv';
}

const RECENT_SEARCHES_KEY = 'andwatch_recent_searches';
const MAX_RECENT_SEARCHES = 10;
const MAX_SUGGESTIONS = 8;

export default function SearchAutocomplete({
  placeholder = 'Search anime, movies, TV shows...',
  onSearch,
  onSelect,
  className = '',
  disabled = false,
  autoFocus = false,
  mediaType = 'all'
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) return;
    
    try {
      const updated = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, MAX_RECENT_SEARCHES);
      
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, [recentSearches]);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const endpoints = [];
      
      if (mediaType === 'all' || mediaType === 'anime') {
        endpoints.push(fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&type=anime&limit=3`));
      }
      if (mediaType === 'all' || mediaType === 'movie') {
        endpoints.push(fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&type=movie&limit=3`));
      }
      if (mediaType === 'all' || mediaType === 'tv') {
        endpoints.push(fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&type=tv&limit=3`));
      }

      const responses = await Promise.all(endpoints);
      const results = await Promise.all(responses.map(r => r.json()));
      
      const allSuggestions: SearchSuggestion[] = results
        .flatMap(result => result.suggestions || [])
        .slice(0, MAX_SUGGESTIONS);

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [mediaType]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  // Handle search submission
  const handleSubmit = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim().length < 2) return;

    saveRecentSearch(finalQuery);
    setIsOpen(false);
    setQuery('');
    
    if (onSearch) {
      onSearch(finalQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    saveRecentSearch(suggestion.title);
    setIsOpen(false);
    setQuery('');
    
    if (onSelect) {
      onSelect(suggestion);
    } else {
      const path = suggestion.type === 'anime' ? 'anime' : 
                   suggestion.type === 'tv' ? 'tvshows' : 'movies';
      router.push(`/${path}/${suggestion.id}`);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const itemCount = suggestions.length + (recentSearches.length > 0 ? recentSearches.length + 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < itemCount - 1 ? prev + 1 : prev);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === -1) {
          handleSubmit();
        } else if (selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          const recentIndex = selectedIndex - suggestions.length - (recentSearches.length > 0 ? 1 : 0);
          if (recentIndex >= 0 && recentIndex < recentSearches.length) {
            handleSubmit(recentSearches[recentIndex]);
          }
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showRecentSearches = query.length < 2 && recentSearches.length > 0;
  const showSuggestions = suggestions.length > 0;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-12 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />

        {/* Loading spinner */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && (showSuggestions || showRecentSearches) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Recent Searches */}
            {showRecentSearches && (
              <div className="p-2">
                <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Searches
                </div>
                
                {recentSearches.slice(0, 5).map((search, index) => {
                  const itemIndex = suggestions.length + index + 1;
                  return (
                    <motion.button
                      key={search}
                      onClick={() => handleSubmit(search)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 ${
                        selectedIndex === itemIndex
                          ? 'bg-indigo-600/20 text-indigo-300'
                          : 'hover:bg-gray-800/60 text-gray-300'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="truncate">{search}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="p-2 border-t border-gray-700/50">
                <div className="flex items-center px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Suggestions
                </div>

                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-150 ${
                      selectedIndex === index
                        ? 'bg-indigo-600/20 text-white'
                        : 'hover:bg-gray-800/60 text-gray-300'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center space-x-3">
                      {suggestion.image ? (
                        <div className="w-12 h-16 rounded-md overflow-hidden bg-gray-700 flex-shrink-0">
                          <Image
                            src={suggestion.image}
                            alt={suggestion.title}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{suggestion.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.type === 'anime' ? 'bg-indigo-900/50 text-indigo-300' :
                            suggestion.type === 'tv' ? 'bg-blue-900/50 text-blue-300' :
                            'bg-red-900/50 text-red-300'
                          }`}>
                            {suggestion.type === 'tv' ? 'TV Show' : suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                          </span>
                          {suggestion.year && <span>{suggestion.year}</span>}
                          {suggestion.score && (
                            <div className="flex items-center">
                              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span>{suggestion.score.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 