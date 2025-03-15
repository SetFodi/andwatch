"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReviewCard from "./ReviewCard";
import ReviewModal from "./ReviewModal";

interface ReviewsSectionProps {
  itemId: string;
  mediaType: "anime" | "movie";
  itemTitle: string;
  itemImage?: string | null;
  session: boolean;
  userId?: string;
  colorTheme?: "indigo" | "red";
}

export default function ReviewsSection({
  itemId,
  mediaType,
  itemTitle,
  itemImage,
  session,
  userId,
  colorTheme = "indigo",
}: ReviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<"recent" | "rating">("recent");

  const colors = {
    indigo: {
      primary: "bg-indigo-600 hover:bg-indigo-700",
      secondary: "text-indigo-400",
      icon: "text-indigo-400",
    },
    red: {
      primary: "bg-red-600 hover:bg-red-700",
      secondary: "text-red-400",
      icon: "text-red-400",
    },
  };

  const theme = colors[colorTheme];

  // Fetch reviews on initial load
  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/reviews?itemId=${itemId}&mediaType=${mediaType}&sort=${sortOrder}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReviews();
  }, [itemId, mediaType, sortOrder]);

  // Handle edit review
  const handleEditReview = (review: any) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete review");
      }
      
      // Remove the deleted review from the state
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (err) {
      console.error("Error deleting review:", err);
      setError("Failed to delete review. Please try again later.");
    }
  };

  // Close modal and reset editing state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          User Reviews {reviews.length > 0 && <span className="ml-2 text-base text-gray-400">({reviews.length})</span>}
        </h3>

        <div className="flex items-center space-x-3">
          {/* Review action button */}
          {session ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm font-medium transition-colors`}
            >
              {reviews.some(review => review.user.id === userId)
                ? "Edit Your Review"
                : "Write a Review"}
            </button>
          ) : null}

          {/* Sort dropdown */}
          {reviews.length > 1 && (
            <div className="relative group">
              <button className="flex items-center text-sm text-gray-400 hover:text-white px-3 py-1.5 bg-gray-800 rounded-lg transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                {sortOrder === "recent" ? "Most Recent" : "Highest Rated"}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-gray-800 rounded-lg shadow-xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <button
                  onClick={() => setSortOrder("recent")}
                  className={`w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-t-lg ${sortOrder === "recent" ? "bg-gray-800" : ""}`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setSortOrder("rating")}
                  className={`w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-b-lg ${sortOrder === "rating" ? "bg-gray-800" : ""}`}
                >
                  Highest Rated
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <svg
            className={`animate-spin h-8 w-8 ${theme.icon}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-10">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 ${theme.primary} text-white rounded-lg text-sm font-medium transition-colors`}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && reviews.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-400 mb-4">No reviews yet. Be the first to share your thoughts!</p>

          {!session ? (
            <Link
              href="/auth/signin"
              className={`inline-block px-6 py-3 ${theme.primary} text-white rounded-lg font-medium transition-colors`}
            >
              <p className="text-white">Sign in to write a review</p>
            </Link>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`inline-block px-6 py-3 ${theme.primary} text-white rounded-lg font-medium transition-colors`}
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Reviews list */}
      {!isLoading && !error && reviews.length > 0 && (
        <>
          {/* Reviews summary */}
          <div className="bg-gray-800/60 rounded-lg p-4 mb-6 flex items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-white">{averageRating}</span>
                  <span className="text-sm text-gray-400 ml-2">/ 10</span>
                </div>
                <p className="text-sm text-gray-400">
                  Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
            
            {/* Rating distribution would go here if needed */}
          </div>

          {/* Review cards */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isCurrentUser={userId === review.user.id}
                colorTheme={colorTheme}
                onEdit={() => handleEditReview(review)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        itemId={itemId}
        mediaType={mediaType}
        itemTitle={itemTitle}
        itemImage={itemImage}
        colorTheme={colorTheme}
        existingReview={editingReview}
      />
    </div>
  );
}