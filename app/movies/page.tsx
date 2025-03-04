// app/movies/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { movieApi } from "../../lib/services/api";

// Skeleton loader component
function MovieCardSkeleton() {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg animate-pulse">
      <div className="bg-gray-700 h-64 w-full mb-3 rounded"></div>
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}

export default async function MoviesList({
  searchParams,
}: {
  // Use a plain object type for searchParams
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Extract search params using direct property access
  const q = typeof searchParams.q === "string" ? searchParams.q : null;
  const pageParam =
    typeof searchParams.page === "string"
      ? Math.max(1, parseInt(searchParams.page))
      : 1;

  // Fetch movie data from TMDB API
  let movieData: any;
  try {
    if (q) {
      movieData = await movieApi.searchMovies(q, pageParam);
    } else {
      movieData = await movieApi.getTopRatedMovies(pageParam);
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    movieData = { results: [], page: 1, total_pages: 1 };
  }

  const movies = movieData?.results || [];
  console.log(
    "Movie List Data:",
    movies.map((movie: any) => ({
      title: movie.title,
      imageUrl: movieApi.getImageUrl(movie.poster_path),
    }))
  );
  const pagination = {
    current_page: movieData?.page || 1,
    total_pages: movieData?.total_pages || 1,
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">
          {q ? `Search: ${q}` : "Top Rated Movies"}
        </h1>

        <div className="flex gap-2">
          <form className="relative">
            <input
              type="text"
              name="q"
              placeholder="Search movies..."
              defaultValue={q || ""}
              className="bg-gray-700 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(20)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie: any) => (
                <Link href={`/movies/${movie.id}`} key={movie.id} className="block">
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full flex flex-col">
                    <div className="h-64 bg-gray-700 relative">
                      {movieApi.getImageUrl(movie.poster_path) ? (
                        <Image
                          src={movieApi.getImageUrl(movie.poster_path)!}
                          alt={movie.title || "Movie Image"}
                          width={400}
                          height={600}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image Available
                        </div>
                      )}
                      {movie.vote_average && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          ★ {movie.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="text-xl font-semibold line-clamp-1">{movie.title}</h2>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{movie.overview}</p>
                      <div className="mt-auto pt-3 text-sm text-gray-400">
                        <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {pagination.current_page > 1 && (
                  <Link
                    href={{
                      pathname: "/movies",
                      query: { ...(q ? { q } : {}), page: pagination.current_page - 1 },
                    }}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                  >
                    Previous
                  </Link>
                )}

                <span className="px-4 py-2 bg-gray-800 rounded">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>

                {pagination.current_page < pagination.total_pages && (
                  <Link
                    href={{
                      pathname: "/movies",
                      query: { ...(q ? { q } : {}), page: pagination.current_page + 1 },
                    }}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria.</p>
            <Link href="/movies" className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition">
              View All Movies
            </Link>
          </div>
        )}
      </Suspense>
    </div>
  );
}
