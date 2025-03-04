// movies/[id]/page.tsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MovieDetails({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Placeholder data (fetch from MongoDB in real app)
  const movie = { 
    id: params.id, 
    title: "Inception", 
    synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8,
    genres: ["Action", "Sci-Fi", "Thriller"],
    releaseDate: "2010-07-16",
    duration: 148, // minutes
    posterUrl: "/placeholder-poster.jpg", // Replace with actual poster URL
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"]
  };

  const updateWatchStatus = async (newStatus: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: params.id,
          status: newStatus,
          type: "movie"
        }),
      });

      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update watch status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-700 rounded-lg aspect-[2/3] relative overflow-hidden">
            {movie.posterUrl ? (
              <Image 
                src={movie.posterUrl} 
                alt={movie.title} 
                layout="fill" 
                objectFit="cover"
                className="rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Poster Available
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((genre) => (
              <span key={genre} className="px-2 py-1 bg-gray-700 rounded text-sm">
                {genre}
              </span>
            ))}
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 text-gray-300">
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
              <span>•</span>
              <span>{movie.duration} min</span>
              <span>•</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.rating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
          <p className="text-gray-300 mb-6">{movie.synopsis}</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Director</h2>
            <p className="text-gray-300">{movie.director}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cast</h2>
            <p className="text-gray-300">{movie.cast.join(", ")}</p>
          </div>
          
          {session && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button 
                onClick={() => updateWatchStatus("watching")}
                disabled={loading}
                className={`px-4 py-2 rounded transition ${status === "watching" 
                  ? "bg-green-700" : "bg-green-600 hover:bg-green-700"}`}
              >
                Watching
              </button>
              <button 
                onClick={() => updateWatchStatus("planToWatch")}
                disabled={loading}
                className={`px-4 py-2 rounded transition ${status === "planToWatch" 
                  ? "bg-yellow-700" : "bg-yellow-600 hover:bg-yellow-700"}`}
              >
                Plan to Watch
              </button>
              <button 
                onClick={() => updateWatchStatus("watched")}
                disabled={loading}
                className={`px-4 py-2 rounded transition ${status === "watched" 
                  ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                Watched
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}