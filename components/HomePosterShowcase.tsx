// components/HomePosterShowcase.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Define types
interface MediaItem {
  id: string | number;
  title: string;
  image: string | null;
  type: "anime" | "movie" | "tv";
}

export default function HomePosterShowcase({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [showcaseMedia, setShowcaseMedia] = useState<MediaItem[]>([]);
  
  // Function to shuffle media with image validation
  const shuffleMedia = () => {
    // Filter media that has valid images
    const mediaWithImages = initialMedia.filter(item => Boolean(item.image));
    
    if (mediaWithImages.length < 4) {
      // If not enough items with images, just use what we have
      setShowcaseMedia(mediaWithImages);
      return;
    }
    
    // Ensure we have variety by taking at least one from each media type if available
    let shuffled: MediaItem[] = [];
    
    // Try to get one from each category
    const anime = mediaWithImages.filter(item => item.type === "anime");
    const movies = mediaWithImages.filter(item => item.type === "movie");
    const tvShows = mediaWithImages.filter(item => item.type === "tv");
    
    // Add one random item from each category that has items
    if (anime.length) shuffled.push(anime[Math.floor(Math.random() * anime.length)]);
    if (movies.length) shuffled.push(movies[Math.floor(Math.random() * movies.length)]);
    if (tvShows.length) shuffled.push(tvShows[Math.floor(Math.random() * tvShows.length)]);
    
    // If we need more items to reach 4, fill from the remaining pool
    const usedIds = new Set(shuffled.map(item => `${item.type}-${item.id}`));
    const remaining = mediaWithImages.filter(
      item => !usedIds.has(`${item.type}-${item.id}`)
    );
    
    // Shuffle the remaining items
    const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
    
    // Fill up to 4 items
    while (shuffled.length < 4 && shuffledRemaining.length > 0) {
      shuffled.push(shuffledRemaining.pop()!);
    }
    
    // Final shuffle of the selected items
    shuffled = shuffled.sort(() => 0.5 - Math.random());
    
    setShowcaseMedia(shuffled);
  };
  
  // Initialize and set up interval
  useEffect(() => {
    shuffleMedia(); // Initial shuffle
    
    // Set up interval for reshuffling (every 8 seconds)
    const intervalId = setInterval(shuffleMedia, 8000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [initialMedia]);
  
  return (
    <div className="relative w-full h-[400px] sm:h-[500px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-4 transform rotate-6 hover:rotate-0 transition-transform duration-500">
          {showcaseMedia.map((item, index) => (
            <Link 
              href={`/${item.type === 'anime' ? 'anime' : item.type === 'tv' ? 'tvshows' : 'movies'}/${item.id}`} 
              key={`${item.type}-${item.id}-${index}`}
            >
              <div className={`h-64 w-44 rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 ${
                index % 2 === 1 ? 'translate-y-8' : index === 2 ? '-translate-y-8' : ''
              }`}>
                {item.image && (
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    width={176} 
                    height={256} 
                    className="object-cover h-full w-full"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
    </div>
  );
}