'use client';
// components/UserRating.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserRatingProps {
  itemId: string;
  mediaType: 'anime' | 'movie';
  currentRating: number | null;
  colorTheme?: 'blue' | 'red';
}

export default function UserRating({
  itemId,
  mediaType,
  currentRating,
  colorTheme = 'blue'
}: UserRatingProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(currentRating);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Theme color configurations
  const themeColors = {
    blue: {
      active: 'bg-yellow-500 text-gray-900',
      hover: 'bg-yellow-400',
      normal: 'bg-gray-700 hover:bg-gray-600',
      text: 'text-yellow-500'
    },
    red: {
      active: 'bg-amber-500 text-gray-900',
      hover: 'bg-amber-400',
      normal: 'bg-gray-700 hover:bg-gray-600',
      text: 'text-amber-500'
    }
  };
  
  const updateRating = async (newRating: number) => {
    const ratingToSet = rating === newRating ? null : newRating;
     
    setLoading(true);
    setError(null);
     
    try {
      // Add logging to debug the request
      console.log('Updating rating:', { externalId: itemId, mediaType, rating: ratingToSet });
      
      const response = await fetch('/api/user/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId: itemId, mediaType, rating: ratingToSet }),
      });
       
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rating');
      }
      
      console.log('Rating updated successfully:', data);
      setRating(ratingToSet);
      
      // Add visible success message
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
      toast.textContent = ratingToSet ? `Rated ${ratingToSet}/10` : 'Rating removed';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
      
      // Force a HARD refresh to reload all data
// In both UserRating.tsx and WatchStatusButtons.tsx
// Add this delay before reload to ensure the database update completes
setTimeout(() => {
  window.location.reload();
}, 500); // 500ms delay
    } catch (err) {
      // Error handling
      setError(err.message);
      console.error('Error updating rating:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-3 text-sm text-red-400">{error}</div>
      )}
      
      <div className="flex flex-wrap justify-between mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
          // Determine button color based on state
          let buttonClass = '';
          
          if (rating === value) {
            // This is the currently selected rating
            buttonClass = themeColors[colorTheme].active;
          } else if (hoveredRating !== null && value <= hoveredRating) {
            // This button is being hovered over
            buttonClass = themeColors[colorTheme].hover;
          } else {
            // Normal state
            buttonClass = themeColors[colorTheme].normal;
          }
          
          return (
            <button
              key={value}
              onClick={() => updateRating(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(null)}
              disabled={loading}
              className={`w-9 h-9 mb-1 flex items-center justify-center rounded-lg 
                        transition-all duration-200 ${buttonClass}
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow'}`}
              aria-label={`Rate ${value} out of 10`}
            >
              {value}
            </button>
          );
        })}
      </div>
      
      {rating && (
        <div className={`mt-2 text-center text-sm font-medium ${themeColors[colorTheme].text}`}>
          Your rating: {rating}/10
        </div>
      )}
    </div>
  );
}