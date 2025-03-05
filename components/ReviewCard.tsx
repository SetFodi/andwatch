"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: {
    id: string;
    title: string;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      displayName?: string;
      username?: string;
      avatar?: string;
      email: string;
    };
  };
  isCurrentUser: boolean;
  colorTheme?: "indigo" | "red";
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewCard({
  review,
  isCurrentUser,
  colorTheme = "indigo",
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const colors = {
    indigo: {
      accent: "text-indigo-400",
      border: "border-indigo-500",
      hover: "hover:bg-indigo-900/20",
      highlight: "text-indigo-400",
    },
    red: {
      accent: "text-red-400",
      border: "border-red-500",
      hover: "hover:bg-red-900/20",
      highlight: "text-red-400",
    },
  };

  const theme = colors[colorTheme];
  
  // Format the date
  const formattedDate = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
  
  // Get user display name (fallback chain)
  const userDisplayName = review.user.displayName || review.user.username || review.user.email.split('@')[0];
  
  // Get user avatar or first letter
  const userInitial = userDisplayName.charAt(0).toUpperCase();
  
  // Function to truncate content if it's too long
  const isLongContent = review.content.length > 300;
  const truncatedContent = isLongContent && !expanded 
    ? review.content.substring(0, 300) + "..." 
    : review.content;

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl mb-6">
      {/* Review Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-700/50 flex items-center justify-center">
            {review.user.avatar ? (
              <Image
                src={review.user.avatar}
                alt={userDisplayName}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-sm font-medium text-white">{userInitial}</span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-white font-medium">{userDisplayName}</p>
            <p className="text-xs text-gray-400">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center bg-gray-700/50 px-2 py-1 rounded-lg">
            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white font-medium">{review.rating}/10</span>
          </div>
          
          {/* Actions dropdown for current user */}
          {isCurrentUser && !showConfirmation && (
            <div className="relative ml-2 group">
              <button className="p-1 text-gray-400 hover:text-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <div className="absolute right-0 mt-1 w-36 bg-gray-900 border border-gray-800 rounded-lg shadow-xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <button
                  onClick={onEdit}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-t-lg"
                >
                  Edit Review
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-b-lg"
                >
                  Delete Review
                </button>
              </div>
            </div>
          )}
          
          {/* Delete confirmation */}
          {isCurrentUser && showConfirmation && (
            <div className="flex items-center ml-2 space-x-2">
              <span className="text-sm text-red-400">Delete?</span>
              <button
                onClick={onDelete}
                className="p-1 text-red-400 hover:text-red-300"
                aria-label="Confirm delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="p-1 text-gray-400 hover:text-white"
                aria-label="Cancel delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Review Title */}
      <h3 className="text-xl font-semibold text-white mb-3">{review.title}</h3>
      
      {/* Review Content */}
      <div className="text-gray-300 mb-4 whitespace-pre-line">
        {truncatedContent}
        {isLongContent && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`block mt-2 ${theme.highlight} text-sm`}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
      
      {/* Edited information */}
      {review.updatedAt !== review.createdAt && (
        <p className="text-xs text-gray-500 mt-4">
          Edited {formatDistanceToNow(new Date(review.updatedAt), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}