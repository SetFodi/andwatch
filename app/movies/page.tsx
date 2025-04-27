// app/movies/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { tmdbApi } from "../../lib/services/api"; // Already correct

// Skeleton loader with enhanced visuals
function MovieCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-gray-900/50 shadow-md border border-gray-800 animate-pulse">
      <div className="relative h-64 bg-gradient-to-b from-gray-800 to-gray-900"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-800 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-800 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-800 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Movie genres with colors
const movieGenres = [
  { id: 28, name: "Action", color: "from-red-600 to-rose-500" },
  { id: 12, name: "Adventure", color: "from-amber-600 to-yellow-500" },
  { id: 16, name: "Animation", color: "from-blue-500 to-sky-400" },
  { id: 35, name: "Comedy", color: "from-yellow-500 to-amber-400" },
  { id: 80, name: "Crime", color: "from-slate-800 to-gray-700" },
  { id: 18, name: "Drama", color: "from-purple-600 to-violet-500" },
  { id: 14, name: "Fantasy", color: "from-emerald-600 to-teal-500" },
  { id: 27, name: "Horror", color: "from-gray-900 to-black" },
  { id: 9648, name: "Mystery", color: "from-indigo-800 to-blue-700" },
  { id: 10749, name: "Romance", color: "from-pink-600 to-rose-500" },
  { id: 878, name: "Sci-Fi", color: "from-cyan-600 to-blue-500" },
  { id: 53, name: "Thriller", color: "from-amber-900 to-yellow-800" },
];

function getGenreColor(genreId: number) {
  const genre = movieGenres.find((g) => g.id === genreId);
  return genre?.color || "from-gray-700 to-gray-600";
}

export default async function MoviesList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : null;
  const genreIdParam = typeof resolvedSearchParams.genre === "string" ? resolvedSearchParams.genre : null;
  const genreId = genreIdParam ? parseInt(genreIdParam) : null;
  const pageParam =
    typeof resolvedSearchParams.page === "string" ? Math.max(1, parseInt(resolvedSearchParams.page)) : 1;

  let movieData: any;
  try {
    if (q) {
      movieData = await tmdbApi.searchMovies(q, pageParam); // Changed from movieApi
    } else if (genreId) {
      movieData = await tmdbApi.getMoviesByGenre(genreId, pageParam); // Changed from movieApi
    } else {
      movieData = await tmdbApi.getTopRatedMovies(pageParam); // Changed from movieApi
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    movieData = { results: [], page: 1, total_pages: 1 };
  }

  const movies = movieData?.results || [];
  const pagination = {
    current_page: movieData?.page || 1,
    total_pages: movieData?.total_pages || 1,
  };

  const selectedGenre = genreId ? movieGenres.find((g) => g.id === genreId) : null;
  const pageTitle = q
    ? `Search: ${q}`
    : genreId
    ? `${selectedGenre?.name || "Genre"} Movies`
    : "Discover Movies";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Enhanced Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-extralight tracking-wide mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-white to-transparent mb-8"></div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <form className="w-full md:w-96 relative group">
              <input
                type="text"
                name="q"
                placeholder="Search movies..."
                defaultValue={q || ""}
                className="w-full bg-gray-950/80 border border-gray-800/50 py-3 pl-5 pr-12 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder-gray-600"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Genre Filter */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/movies"
                className={`px-5 py-2 text-sm rounded-full transition-all duration-300 ${
                  !genreId ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-900/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-indigo-500"
                }`}
              >
                All Genres
              </Link>
              {movieGenres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/movies?genre=${genre.id}`}
                  className={`px-5 py-2 text-sm rounded-full transition-all duration-300 ${
                    genreId === genre.id
                      ? `bg-gradient-to-r ${genre.color} text-white shadow-lg`
                      : "bg-gray-900/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-indigo-500"
                  }`}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(12)].map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          {movies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in-up">
                {movies.map((movie: any) => {
                  const primaryGenreId = movie.genre_ids?.[0];
                  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

                  return (
                    <Link href={`/movies/${movie.id}`} key={movie.id} className="group">
                      <div className="flex flex-col h-full transition-transform duration-500 hover:-translate-y-2">
                        <div className="aspect-[2/3] relative overflow-hidden rounded-lg shadow-lg bg-gray-900">
                          {movie.poster_path ? (
                            <Image
                              src={tmdbApi.getImageUrl(movie.poster_path)!} // Changed from movieApi
                              alt={movie.title || "Movie"}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800">
                              No Image
                            </div>
                          )}
                          {movie.vote_average && (
                            <div className="absolute top-2 right-2 bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                              <div className="flex items-center">
                                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {movie.vote_average.toFixed(1)}
                                <span className="text-[9px] opacity-70 ml-1">TMDB</span>
                              </div>
                            </div>
                          )}
                          {releaseYear && (
                            <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                              {releaseYear}
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-medium mt-4 mb-1 line-clamp-1 transition-colors duration-300 group-hover:text-indigo-400">
                          {movie.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-400 space-x-2">
                          {movie.genre_ids?.slice(0, 2).map((id: number) => {
                            const genre = movieGenres.find((g) => g.id === id);
                            return genre ? <span key={id}>{genre.name}</span> : null;
                          })}
                          {releaseYear && <span>{releaseYear}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Enhanced Pagination */}
              <div className="mt-16 flex justify-center">
                <div className="flex items-center space-x-8 bg-gray-900/50 py-3 px-6 rounded-full shadow-lg">
                  {pagination.current_page > 1 && (
                    <Link
                      href={{
                        pathname: "/movies",
                        query: { ...(q ? { q } : {}), ...(genreId ? { genre: genreId } : {}), page: pagination.current_page - 1 },
                      }}
                      className="text-sm text-gray-300 hover:text-indigo-400 flex items-center transition-colors duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Link>
                  )}
                  <span className="text-sm text-gray-400">
                    Page {pagination.current_page} of {Math.min(pagination.total_pages, 500)}
                  </span>
                  {pagination.current_page < Math.min(pagination.total_pages, 500) && (
                    <Link
                      href={{
                        pathname: "/movies",
                        query: { ...(q ? { q } : {}), ...(genreId ? { genre: genreId } : {}), page: pagination.current_page + 1 },
                      }}
                      className="text-sm text-gray-300 hover:text-indigo-400 flex items-center transition-colors duration-300"
                    >
                      Next
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center animate-fade-in">
              <svg className="w-20 h-20 mx-auto text-gray-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <h3 className="text-2xl font-light mb-3 text-gray-200">No movies found</h3>
              <p className="text-gray-500 max-w-md mx-auto">Try adjusting your search or explore other categories.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}