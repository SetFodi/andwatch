'use client';
// components/WatchStatusButtons.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Watch status options with theme variations
const watchStatusOptions = [
  { 
    value: 'watching', 
    label: 'Watching', 
    colors: {
      blue: 'bg-green-600 hover:bg-green-700',
      red: 'bg-rose-600 hover:bg-rose-700',
      active: {
        blue: 'bg-green-700',
        red: 'bg-rose-700'
      }
    },
    icon: (
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    value: 'completed', 
    label: 'Completed', 
    colors: {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-red-600 hover:bg-red-700',
      active: {
        blue: 'bg-blue-700',
        red: 'bg-red-700'
      }
    },
    icon: (
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    value: 'plan_to_watch', 
    label: 'Plan to Watch', 
    colors: {
      blue: 'bg-purple-600 hover:bg-purple-700',
      red: 'bg-pink-600 hover:bg-pink-700',
      active: {
        blue: 'bg-purple-700',
        red: 'bg-pink-700'
      }
    },
    icon: (
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    )
  }
];

interface WatchStatusButtonsProps {
  itemId: string;
  mediaType: 'anime' | 'movie' | 'tv';  // Add 'tv' here
  currentStatus: string | null;
  colorTheme?: 'blue' | 'red';
  onStatusChange?: (newStatus: string | null) => void;
}

export default function WatchStatusButtons({ 
  itemId,
  mediaType,
  currentStatus,
  colorTheme = 'blue',
  onStatusChange
}: WatchStatusButtonsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when props change
  useEffect(() => {
    setStatus(currentStatus);
    setError(null);
    setSuccess(false);
  }, [currentStatus, itemId, mediaType]);
  
  const updateWatchStatus = async (newStatus: string) => {
    const statusToSet = status === newStatus ? null : newStatus;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Updating watch status:', { externalId: itemId, mediaType, status: statusToSet });
      
      const response = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId: itemId, mediaType, status: statusToSet }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update watch status');
      }
      
      console.log('Watch status updated successfully:', data);
      setStatus(statusToSet);
      setSuccess(true);
      
      // Add visual feedback
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
      toast.textContent = statusToSet 
        ? `Added to ${watchStatusOptions.find(opt => opt.value === statusToSet)?.label}` 
        : 'Removed from list';
      document.body.appendChild(toast);
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
      
      // Use the callback to inform parent component of the change
      if (onStatusChange) {
        onStatusChange(statusToSet);
      }
      
      // Trigger a soft refresh instead of a hard page reload
      router.refresh();
      
      // If we need to preserve a rating, handle it in a more controlled way
      if (data.item && data.item.userRating) {
        // Rating is already preserved in the API response, no need for additional API calls
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating watch status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 text-sm text-red-400">{error}</div>
      )}
      
      {success && (
        <div className="mb-3 text-sm text-green-400">Watch status updated successfully!</div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {watchStatusOptions.map((option) => {
          // Determine the correct color based on status and theme
          const buttonColor = status === option.value
            ? `${option.colors.active[colorTheme]} ring-2 ring-white/20 font-semibold shadow-lg`
            : option.colors[colorTheme];
          
          return (
            <button
              key={option.value}
              onClick={() => updateWatchStatus(option.value)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 
                        flex items-center justify-center ${buttonColor} 
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
            >
              {option.icon}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}