'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressData {
  currentEpisode?: number;
  totalEpisodes?: number;
  currentSeason?: number;
  totalSeasons?: number;
  watchedMinutes?: number;
  totalMinutes?: number;
  lastWatched?: Date;
  notes?: string;
}

interface ProgressTrackerProps {
  itemId: string;
  mediaType: 'anime' | 'tv' | 'movie';
  initialProgress?: ProgressData;
  onProgressUpdate?: (progress: ProgressData) => void;
  className?: string;
  compact?: boolean;
}

export default function ProgressTracker({
  itemId,
  mediaType,
  initialProgress = {},
  onProgressUpdate,
  className = '',
  compact = false
}: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData>(initialProgress);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempProgress, setTempProgress] = useState<ProgressData>(initialProgress);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (mediaType === 'movie' && progress.watchedMinutes && progress.totalMinutes) {
      return Math.min((progress.watchedMinutes / progress.totalMinutes) * 100, 100);
    }
    
    if (mediaType === 'anime' || mediaType === 'tv') {
      if (progress.currentEpisode && progress.totalEpisodes) {
        return Math.min((progress.currentEpisode / progress.totalEpisodes) * 100, 100);
      }
    }
    
    return 0;
  }, [progress, mediaType]);

  // Save progress to backend
  const saveProgress = useCallback(async (newProgress: ProgressData) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/progress/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType,
          progress: {
            ...newProgress,
            lastWatched: new Date()
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to save progress');

      const updatedProgress = { ...newProgress, lastWatched: new Date() };
      setProgress(updatedProgress);
      
      if (onProgressUpdate) {
        onProgressUpdate(updatedProgress);
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
  }, [itemId, mediaType, isSaving, onProgressUpdate]);

  // Quick episode increment
  const incrementEpisode = useCallback(() => {
    if (progress.currentEpisode && progress.totalEpisodes) {
      const newEpisode = Math.min(progress.currentEpisode + 1, progress.totalEpisodes);
      const newProgress = { ...progress, currentEpisode: newEpisode };
      saveProgress(newProgress);
    }
  }, [progress, saveProgress]);

  // Quick episode decrement
  const decrementEpisode = useCallback(() => {
    if (progress.currentEpisode) {
      const newEpisode = Math.max(progress.currentEpisode - 1, 0);
      const newProgress = { ...progress, currentEpisode: newEpisode };
      saveProgress(newProgress);
    }
  }, [progress, saveProgress]);

  // Handle edit submission
  const handleEditSubmit = () => {
    saveProgress(tempProgress);
    setIsEditing(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setTempProgress(progress);
    setIsEditing(false);
  };

  const completionPercentage = getCompletionPercentage();

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Compact Progress Bar */}
        <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Progress Text */}
        <div className="text-sm text-gray-400 min-w-fit">
          {mediaType === 'movie' && progress.watchedMinutes && progress.totalMinutes ? (
            `${Math.round(progress.watchedMinutes)}/${progress.totalMinutes}min`
          ) : (
            `${progress.currentEpisode || 0}/${progress.totalEpisodes || 0}`
          )}
        </div>

        {/* Quick Actions */}
        {(mediaType === 'anime' || mediaType === 'tv') && (
          <div className="flex space-x-1">
            <button
              onClick={decrementEpisode}
              disabled={!progress.currentEpisode || progress.currentEpisode <= 0}
              className="w-6 h-6 rounded-full bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs"
            >
              −
            </button>
            <button
              onClick={incrementEpisode}
              disabled={!progress.totalEpisodes || progress.currentEpisode >= progress.totalEpisodes}
              className="w-6 h-6 rounded-full bg-indigo-600/80 hover:bg-indigo-500/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Watch Progress
        </h3>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Progress Visualization */}
      <div className="mb-6">
        {/* Progress Bar */}
        <div className="bg-gray-800/60 rounded-full h-3 mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: [-100, 300]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ width: '100px' }}
            />
          </motion.div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-400">
              {Math.round(completionPercentage)}%
            </p>
            <p className="text-sm text-gray-400">Complete</p>
          </div>
          
          {mediaType !== 'movie' && (
            <div>
              <p className="text-2xl font-bold text-purple-400">
                {progress.currentEpisode || 0}
              </p>
              <p className="text-sm text-gray-400">Episodes</p>
            </div>
          )}
          
          <div>
            <p className="text-2xl font-bold text-pink-400">
              {progress.lastWatched 
                ? new Date(progress.lastWatched).toLocaleDateString()
                : 'Never'
              }
            </p>
            <p className="text-sm text-gray-400">Last Watched</p>
          </div>
        </div>
      </div>

      {/* Quick Actions for Episodes */}
      {(mediaType === 'anime' || mediaType === 'tv') && !isEditing && (
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={decrementEpisode}
            disabled={!progress.currentEpisode || progress.currentEpisode <= 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous Episode</span>
          </button>

          <div className="text-lg font-semibold text-white px-4 py-2 bg-indigo-600/20 rounded-lg">
            {progress.currentEpisode || 0} / {progress.totalEpisodes || 0}
          </div>

          <button
            onClick={incrementEpisode}
            disabled={!progress.totalEpisodes || progress.currentEpisode >= progress.totalEpisodes}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500/80 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next Episode</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Edit Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-700/50 pt-4"
          >
            <div className="space-y-4">
              {(mediaType === 'anime' || mediaType === 'tv') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Episode
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={tempProgress.totalEpisodes || 999}
                      value={tempProgress.currentEpisode || 0}
                      onChange={(e) => setTempProgress({
                        ...tempProgress,
                        currentEpisode: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Episodes
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tempProgress.totalEpisodes || 0}
                      onChange={(e) => setTempProgress({
                        ...tempProgress,
                        totalEpisodes: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {mediaType === 'movie' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Watched Minutes
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={tempProgress.totalMinutes || 999}
                      value={tempProgress.watchedMinutes || 0}
                      onChange={(e) => setTempProgress({
                        ...tempProgress,
                        watchedMinutes: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Minutes
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tempProgress.totalMinutes || 0}
                      onChange={(e) => setTempProgress({
                        ...tempProgress,
                        totalMinutes: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={tempProgress.notes || ''}
                  onChange={(e) => setTempProgress({
                    ...tempProgress,
                    notes: e.target.value
                  })}
                  placeholder="Add personal notes about your progress..."
                  className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleEditSubmit}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 rounded-lg text-white font-medium transition-colors"
                >
                  {isSaving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
                </button>
                
                <button
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Notes */}
      {progress.notes && !isEditing && (
        <div className="mt-4 p-3 bg-gray-800/40 rounded-lg border-l-4 border-indigo-500">
          <p className="text-gray-300 text-sm">{progress.notes}</p>
        </div>
      )}
    </div>
  );
}

// Simple progress indicator for cards
export function ProgressIndicator({ 
  currentEpisode = 0, 
  totalEpisodes = 0, 
  className = '' 
}: {
  currentEpisode?: number;
  totalEpisodes?: number;
  className?: string;
}) {
  const percentage = totalEpisodes > 0 ? (currentEpisode / totalEpisodes) * 100 : 0;

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {currentEpisode}/{totalEpisodes} episodes
      </div>
    </div>
  );
} 