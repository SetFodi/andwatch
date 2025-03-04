// app/[type]/add/page.tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddItem({ params }: { params: { type: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemType = params.type === "anime" ? "anime" : "movie";
  
  // Basic genres for both types
  const availableGenres = itemType === "anime"
    ? ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"]
    : ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"];
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const form = new FormData(e.currentTarget);
    const formData = {
      title: form.get("title") as string,
      type: itemType,
      synopsis: form.get("synopsis") as string,
      genres: selectedGenres,
      releaseDate: form.get("releaseDate") as string || null,
      posterUrl: form.get("posterUrl") as string || "",
    };
    
    // Add type-specific fields
    if (itemType === "anime") {
      Object.assign(formData, {
        episodes: form.get("episodes") ? parseInt(form.get("episodes") as string) : null,
      });
    } else {
      Object.assign(formData, {
        duration: form.get("duration") ? parseInt(form.get("duration") as string) : null,
      });
    }
    
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add item");
      }
      
      // Redirect to the item list page
      router.push(`/${itemType}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 capitalize">Add New {itemType}</h1>
      
      {error && (
        <div className="mb-8 p-4 bg-red-600/20 border border-red-600 rounded text-red-200">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-300 mb-2 font-medium">
            Title*
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            placeholder={`${itemType === "anime" ? "Demon Slayer" : "The Godfather"}`}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="synopsis" className="block text-gray-300 mb-2 font-medium">
            Synopsis
          </label>
          <textarea
            id="synopsis"
            name="synopsis"
            rows={4}
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            placeholder="A brief summary..."
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 font-medium">
            Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <button
                type="button"
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedGenres.includes(genre)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="releaseDate" className="block text-gray-300 mb-2 font-medium">
            Release Date
          </label>
          <input
            id="releaseDate"
            name="releaseDate"
            type="date"
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
          />
        </div>
        
        {itemType === "anime" ? (
          <div className="mb-6">
            <label htmlFor="episodes" className="block text-gray-300 mb-2 font-medium">
              Episodes
            </label>
            <input
              id="episodes"
              name="episodes"
              type="number"
              min="1"
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
              placeholder="12"
            />
          </div>
        ) : (
          <div className="mb-6">
            <label htmlFor="duration" className="block text-gray-300 mb-2 font-medium">
              Duration (minutes)
            </label>
            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
              placeholder="120"
            />
          </div>
        )}
        
        <div className="mb-8">
          <label htmlFor="posterUrl" className="block text-gray-300 mb-2 font-medium">
            Poster URL
          </label>
          <input
            id="posterUrl"
            name="posterUrl"
            type="url"
            className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            placeholder="https://example.com/poster.jpg"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading ? "Adding..." : `Add ${itemType}`}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-700 rounded font-semibold hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}