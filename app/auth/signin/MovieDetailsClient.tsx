// app/movies/[id]/MovieDetailsClient.tsx
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { movieApi } from "../../../lib/services/api";

async function getMovieDetails(id: string) {
  try {
    const data = await movieApi.getMovieById(id);
    if (!data || data.success === false) {
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

async function getInitialWatchStatus(userId: string, movieId: string) {
  try {
    const response = await fetch(
      `/api/user/watchlist?userId=${userId}&itemId=${movieId}&type=movie`
    );
    if (!response.ok) throw new Error("Failed to fetch watch status");
    const data = await response.json();
    return data.status || null;
  } catch (error) {
    console.error("Error fetching initial watch status:", error);
    return null;
  }
}

export default function MovieDetailsClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [watchStatus, setWatchStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      console.log("Fetching movie details for id:", id);
      const movieData = await getMovieDetails(id);
      console.log("Fetched movie data:", movieData);

      if (!movieData) {
        // If no movie data is found, redirect back to /movies
        router.push("/movies");
        return;
      }
      setMovie(movieData);

      if (session?.user?.id) {
        const initialStatus = await getInitialWatchStatus(session.user.id, id);
        setWatchStatus(initialStatus);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, session, router]);

  const updateWatchStatus = async (newStatus: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await fetch("/api/user/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: id,
          status: newStatus,
          type: "movie",
        }),
      });
      if (response.ok) {
        setWatchStatus(newStatus);
      } else {
        throw new Error("Failed to update watch status");
      }
    } catch (error) {
      console.error("Failed to update watch status:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  if (!movie) {
    return <div className="p-8 text-center text-gray-400">Movie not found</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="bg-gray-700 rounded-lg aspect-[2/3] relative overflow-hidden">
            {movieApi.getImageUrl(movie.poster_path) ? (
              <Image
                src={movieApi.getImageUrl(movie.poster_path)!}
                alt={movie.title}
                fill
                className="rounded-lg object-cover"
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
            {movie.genres.map((genre: any) => (
              <span key={genre.id} className="px-2 py-1 bg-gray-700 rounded text-sm">
                {genre.name}
              </span>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 text-gray-300">
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span>•</span>
              <span>{movie.runtime} min</span>
              <span>•</span>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">Synopsis</h2>
          <p className="text-gray-300 mb-6">{movie.overview}</p>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Director</h2>
            <p className="text-gray-300">
              {movie.credits?.crew.find((c: any) => c.job === "Director")?.name || "Unknown"}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Cast</h2>
            <p className="text-gray-300">
              {movie.credits?.cast.slice(0, 3).map((c: any) => c.name).join(", ") || "Unknown"}
            </p>
          </div>

          {session && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => updateWatchStatus("watching")}
                disabled={updateLoading}
                className={`px-4 py-2 rounded transition ${
                  watchStatus === "watching" ? "bg-green-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Watching
              </button>
              <button
                onClick={() => updateWatchStatus("plan_to_watch")}
                disabled={updateLoading}
                className={`px-4 py-2 rounded transition ${
                  watchStatus === "plan_to_watch" ? "bg-yellow-700" : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                Plan to Watch
              </button>
              <button
                onClick={() => updateWatchStatus("completed")}
                disabled={updateLoading}
                className={`px-4 py-2 rounded transition ${
                  watchStatus === "completed" ? "bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
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
