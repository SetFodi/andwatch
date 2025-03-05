"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface MediaCardProps {
  item: {
    id?: string | number; // Make optional to handle undefined cases
    title?: string;
    image?: string | null;
    score?: number | null;
    type?: "anime" | "movie";
    year?: number | null;
    url?: string;
    userRating?: number | null;
    status?: string | null;
  } | null; // Allow null item
}

export default function MediaCard({ item }: MediaCardProps) {
  const router = useRouter();

  if (!item) return null;

  // Determine status style
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "watching":
        return { bgColor: "bg-green-600", label: "Watching" };
      case "completed":
        return { bgColor: "bg-blue-600", label: "Completed" };
      case "on-hold":
        return { bgColor: "bg-yellow-600", label: "On Hold" };
      case "dropped":
        return { bgColor: "bg-gray-600", label: "Dropped" };
      case "plan_to_watch":
        return { bgColor: "bg-purple-600", label: "Plan to Watch" };
      default:
        return { bgColor: "bg-gray-600", label: "Unknown" };
    }
  };

  const statusStyle = getStatusStyle(item.status);

  // Handle remove action
  const handleRemove = async () => {
    if (!item.id || !item.type) {
      console.error("Missing item ID or type for removal");
      alert("Cannot remove item due to missing data.");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${item.title || "this item"}" from your watchlist?`)) return;

    try {
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
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden shadow-lg border border-gray-700/50"
    >
      <Link href={item.url || "#"}>
        <div className="relative h-72">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title || "Media Item"}
              fill
              className="object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-sm">
              No Image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 hover:opacity-90 transition-opacity duration-300"></div>
          {item.score && (
            <span className="absolute top-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center shadow-md">
              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {item.score.toFixed(1)}
            </span>
          )}
          {item.status && (
            <span
              className={`absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full ${statusStyle.bgColor} shadow-md flex items-center space-x-1`}
            >
              <span>{statusStyle.label}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          )}
          {item.userRating && (
            <span className="absolute bottom-4 right-4 bg-indigo-600/80 text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-1">
              <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {item.userRating}/10
            </span>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-sm line-clamp-1">{item.title || "Untitled"}</h3>
            <div className="text-gray-300 text-xs mt-1 flex justify-between">
              <span className="capitalize">{item.type || "unknown"}</span>
              {item.year && <span>{item.year}</span>}
            </div>
          </div>
        </div>
      </Link>
      {/* Remove Button */}
      <div className="p-2 bg-gray-900/80 border-t border-gray-700/50 flex justify-end">
        <button
          onClick={handleRemove}
          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}