"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface MediaCardProps {
  item: {
    id?: string | number;
    title?: string;
    image?: string | null;
    score?: number | null;
    type?: "anime" | "movie";
    year?: number | null;
    url?: string;
    userRating?: number | null;
    status?: string | null;
  } | null;
}

export default function MediaCard({ item }: MediaCardProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  if (!item) return null;

  // Determine status style and data
  const getStatusData = (status?: string) => {
    switch (status) {
      case "watching":
        return { 
          bgColor: "bg-green-600", 
          hoverBgColor: "hover:bg-green-700",
          gradient: "from-green-500 to-emerald-600",
          label: "Watching",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          )
        };
      case "completed":
        return { 
          bgColor: "bg-blue-600", 
          hoverBgColor: "hover:bg-blue-700",
          gradient: "from-blue-500 to-indigo-600",
          label: "Completed",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case "on-hold":
        return { 
          bgColor: "bg-yellow-600", 
          hoverBgColor: "hover:bg-yellow-700",
          gradient: "from-yellow-500 to-amber-600",
          label: "On Hold",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case "dropped":
        return { 
          bgColor: "bg-gray-600", 
          hoverBgColor: "hover:bg-gray-700",
          gradient: "from-gray-500 to-gray-600",
          label: "Dropped",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      case "plan_to_watch":
        return { 
          bgColor: "bg-purple-600", 
          hoverBgColor: "hover:bg-purple-700",
          gradient: "from-purple-500 to-violet-600",
          label: "Plan to Watch",
          icon: (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )
        };
      default:
        return { 
          bgColor: "bg-gray-600", 
          hoverBgColor: "hover:bg-gray-700",
          gradient: "from-gray-500 to-slate-600",
          label: "Unknown",
          icon: null
        };
    }
  };

  const statusData = getStatusData(item.status);

  // Handle remove action
  const handleRemove = async () => {
    if (!item.id || !item.type) {
      console.error("Missing item ID or type for removal");
      alert("Cannot remove item due to missing data.");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${item.title || "this item"}" from your watchlist?`)) return;

    try {
      setIsRemoving(true);
      const response = await fetch("/api/user/watchlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          externalId: String(item.id),
          mediaType: item.type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove item");
      }

      router.refresh(); // Refresh the page to reflect the updated watchlist
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 group"
    >
      <Link href={item.url || "#"} className="block">
        <div className="relative h-72 overflow-hidden">
          {/* Media Image with Fallback */}
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title || "Media Item"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}

          {/* Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
          
          {/* Rating Badge */}
          {item.score && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center shadow-lg border border-white/10"
            >
              <svg className="w-3.5 h-3.5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{item.score.toFixed(1)}</span>
            </motion.div>
          )}

          {/* Status Badge */}
          {item.status && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`absolute top-3 left-3 text-white text-xs font-medium px-2.5 py-1 rounded-lg shadow-md flex items-center space-x-1.5 bg-gradient-to-r ${statusData.gradient}`}
            >
              {statusData.icon && <span>{statusData.icon}</span>}
              <span>{statusData.label}</span>
            </motion.div>
          )}

          {/* User Rating */}
          {item.userRating && (
            <div className="absolute bottom-16 right-3 bg-indigo-600/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-1.5 border border-indigo-400/30">
              <svg className="w-3.5 h-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-bold">{item.userRating}</span>
              <span className="opacity-75">/10</span>
            </div>
          )}

          {/* Title and Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300">
            <h3 className="text-white font-semibold text-base line-clamp-1 group-hover:text-indigo-200 drop-shadow-md">
              {item.title || "Untitled"}
            </h3>
            <div className="mt-1 flex justify-between text-xs">
              <span className="capitalize text-indigo-200 font-medium bg-indigo-950/60 px-2 py-0.5 rounded backdrop-blur-sm">
                {item.type || "unknown"}
              </span>
              {item.year && (
                <span className="text-gray-300 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                  {item.year}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-3 bg-gray-900/90 backdrop-blur-sm border-t border-gray-800/50 flex justify-between items-center"
      >
        <div className="flex items-center space-x-1 text-xs text-gray-400">
          <span className={`w-2 h-2 rounded-full ${item.status ? `bg-${statusData.bgColor.split('-')[1]}` : 'bg-gray-600'}`}></span>
          <span className="font-medium">{item.status ? statusData.label : 'Not Started'}</span>
        </div>
        
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className={`flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg ${isRemoving ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          {isRemoving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Removing...
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}