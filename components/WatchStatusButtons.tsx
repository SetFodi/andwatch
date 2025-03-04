'use client';
// components/WatchStatusButtons.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Watch status options
const watchStatusOptions = [
  { value: 'watching', label: 'Watching', color: 'bg-green-600 hover:bg-green-700' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-600 hover:bg-blue-700' },
  { value: 'on-hold', label: 'On-Hold', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { value: 'dropped', label: 'Dropped', color: 'bg-red-600 hover:bg-red-700' },
  { value: 'plan_to_watch', label: 'Plan to Watch', color: 'bg-purple-600 hover:bg-purple-700' }
];

interface WatchStatusButtonsProps {
  itemId: string;
  mediaType: 'anime' | 'movie';
  currentStatus: string | null;
}

export default function WatchStatusButtons({ 
  itemId,
  mediaType,
  currentStatus
}: WatchStatusButtonsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWatchStatus = async (newStatus: string) => {
    // If clicking the current status, remove from list
    const statusToSet = status === newStatus ? null : newStatus;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalId: itemId,
          mediaType,
          status: statusToSet,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update watch status');
      }
      
      setStatus(statusToSet);
      router.refresh();
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
      
      <div className="grid grid-cols-2 gap-2">
        {watchStatusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => updateWatchStatus(option.value)}
            disabled={loading}
            className={`px-2 py-2 rounded text-sm transition ${
              status === option.value
                ? option.color.split(' ')[0] // Only use the base color when active
                : 'bg-gray-700 hover:bg-gray-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}