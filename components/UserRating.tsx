'use client';
// components/UserRating.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserRatingProps {
  itemId: string;
  mediaType: 'anime' | 'movie';
  currentRating: number | null;
}

export default function UserRating({
  itemId,
  mediaType,
  currentRating
}: UserRatingProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(currentRating);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const updateRating = async (newRating: number) => {
    // If clicking the current rating, remove the rating
    const ratingToSet = rating === newRating ? null : newRating;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalId: itemId,
          mediaType,
          rating: ratingToSet,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update rating');
      }
      
      setRating(ratingToSet);
      router.refresh();
    } catch (err: any) {
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
      
      <div className="flex flex-wrap justify-between">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            onClick={() => updateRating(value)}
            disabled={loading}
            className={`w-9 h-9 mb-1 flex items-center justify-center rounded transition ${
              rating === value
                ? 'bg-yellow-500 text-gray-900 font-bold'
                : 'bg-gray-700 hover:bg-gray-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Rate ${value} out of 10`}
          >
            {value}
          </button>
        ))}
      </div>
      
      {rating && (
        <div className="mt-2 text-center text-sm text-yellow-500">
          Your rating: {rating}/10
        </div>
      )}
    </div>
  );
}