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
  
  // Function to shuffle media
  const shuffleMedia = () => {
    const shuffled = [...initialMedia]
      .filter(item => item.image) // Ensure all items have images
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, 4); // Take first 4
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