"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  mediaType: "anime" | "movie";
  itemTitle: string;
  itemImage?: string | null;
  colorTheme?: "indigo" | "red";
  existingReview?: {
    id: string;
    title: string;
    content: string;
    rating: number;
  } | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  itemId,
  mediaType,
  itemTitle,
  itemImage,
  colorTheme = "indigo",
  existingReview = null,
}: ReviewModalProps) {
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const themeColors = {
    indigo: {
      primary: "bg-indigo-600 hover:bg-indigo-700",
      accent: "text-indigo-400",
      border: "border-indigo-500",
      ringFocus: "focus:ring-indigo-500",
      shadow: "shadow-indigo-900/20",
      hover: "hover:border-indigo-500",
      star: "text-indigo-400 hover:text-indigo-300",
      starActive: "text-yellow-400",
    },
    red: {
      primary: "bg-red-600 hover:bg-red-700",
      accent: "text-red-400",
      border: "border-red-500",
      ringFocus: "focus:ring-red-500",
      shadow: "shadow-red-900/20",
      hover: "hover:border-red-500",
      star: "text-red-400 hover:text-red-300",
      starActive: "text-yellow-400",
    },
  };

  const colors = themeColors[colorTheme];

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    } else {
      document.removeEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Focus trap inside modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a review title");
      return;
    }

    if (!content.trim()) {
      setError("Please enter review content");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: existingReview ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: existingReview?.id,
          itemId,
          mediaType,
          title: title.trim(),
          content: content.trim(),
          rating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Success - refresh the page to show the new review
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[90vh] overflow-auto bg-gray-900 rounded-xl border border-gray-800 shadow-2xl relative flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-gray-900/90 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white">
            {existingReview ? "Edit Review" : "Write a Review"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Item Preview */}
          <div className="flex items-center mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="w-16 h-24 relative flex-shrink-0 rounded-lg overflow-hidden">
              {itemImage ? (
                <Image
                  src={itemImage}
                  alt={itemTitle}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-white font-medium">{itemTitle}</h3>
              <p className="text-sm text-gray-400 capitalize">
                {mediaType === "anime" ? "Anime" : "Movie"}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full"
                    aria-label={`Rate ${star} out of 10`}
                  >
                    <svg
                      className={`w-8 h-8 ${
                        rating >= star ? colors.starActive : colors.star
                      } transition-colors`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-2xl font-bold text-white">{rating}/10</span>
              </div>
            </div>

            {/* Review Title */}
            <div className="mb-4">
              <label
                htmlFor="review-title"
                className="block text-white font-medium mb-2"
              >
                Review Title
              </label>
              <input
                type="text"
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your thoughts"
                className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 ${colors.ringFocus} ${colors.hover}`}
                required
              />
            </div>

            {/* Review Content */}
            <div className="mb-6">
              <label
                htmlFor="review-content"
                className="block text-white font-medium mb-2"
              >
                Your Review
              </label>
              <textarea
                id="review-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with this title..."
                className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 ${colors.ringFocus} ${colors.hover} min-h-[150px]`}
                rows={6}
                required
              ></textarea>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 ${colors.primary} text-white font-medium rounded-lg transition-colors ${colors.shadow}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Submitting...
                  </span>
                ) : existingReview ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}