// app/movies/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { movieApi } from "../../lib/services/api";

// Skeleton loader component with custom design
function MovieCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl border border-gray-700 hover:border-red-500 transition-all duration-300 animate-pulse">
      <div className="relative h-60">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800"></div>
      </div>
      <div className="p-4">
        <div className="h-5 bg-gray-700 rounded-full w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-700 rounded-full w-full mb-2"></div>
        <div className="h-3 bg-gray-700 rounded-full w-5/6"></div>
        <div className="mt-4 flex justify-between">
          <div className="h-6 w-14 bg-gray-700 rounded-full"></div>
          <div className="h-6 w-14 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// Custom movie genres with associated colors
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
  const genre = movieGenres.find(g => g.id === genreId);
  return genre?.color || "from-gray-700 to-gray-600";
}

export default async function MoviesList({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await (resolve) the searchParams proxy before using it
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : null;
  const genreIdParam = typeof resolvedSearchParams.genre === "string" ? resolvedSearchParams.genre : null;
  const genreId = genreIdParam ? parseInt(genreIdParam) : null;
  const pageParam =
    typeof resolvedSearchParams.page === "string"
      ? Math.max(1, parseInt(resolvedSearchParams.page))
      : 1;

  // Fetch movie data from TMDB API
  let movieData: any;
  try {
    if (q) {
      movieData = await movieApi.searchMovies(q, pageParam);
    } else if (genreId) {
      movieData = await movieApi.getMoviesByGenre(genreId, pageParam);
    } else {
      movieData = await movieApi.getTopRatedMovies(pageParam);
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

  const selectedGenre = genreId ? movieGenres.find(g => g.id === genreId) : null;
  const pageTitle = q
    ? `Search: ${q}`
    : genreId
    ? `${selectedGenre?.name || "Genre"} Movies`
    : "Discover Movies";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-950">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Hero section with dynamic background based on selected genre */}
        <div className={`mb-10 p-8 rounded-2xl shadow-2xl overflow-hidden relative
                       bg-gradient-to-r ${selectedGenre?.color || "from-red-700 to-rose-600"}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-md">
              {pageTitle}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {q
                ? `Showing results for "${q}"`
                : genreId
                ? `Explore the best ${selectedGenre?.name || ""} films from around the world`
                : "Discover your next favorite films, from classics to new releases."}
            </p>
          </div>
          
          {/* Decorative film elements */}
          <div className="absolute -right-16 -top-16 w-64 h-64 border-8 border-white/10 rounded-full"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 border-8 border-white/5 rounded-full"></div>
        </div>

        {/* Search & Filter Container */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 mb-10 shadow-xl border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {/* Search form with animated focus effect */}
            <form className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  name="q"
                  placeholder="Search movies..."
                  defaultValue={q || ""}
                  className="w-full bg-gray-900/80 text-white rounded-lg px-5 py-4 pl-12 
                           border border-gray-700 focus:border-red-500 focus:ring-red-500 
                           focus:ring-2 outline-none transition-all duration-300"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-400 transition-colors duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 
                           text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Genre pills with gradient backgrounds */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3 text-white">Popular Genres</h2>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/movies"
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
                          ${!genreId 
                            ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/20" 
                            : "bg-gray-700 hover:bg-gray-600 text-gray-200"}`}
              >
                All Genres
              </Link>
              {movieGenres.map((currentGenre) => (
                <Link
                  key={currentGenre.id}
                  href={`/movies?genre=${currentGenre.id}`}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200
                            ${genreId === currentGenre.id 
                              ? `bg-gradient-to-r ${currentGenre.color} text-white shadow-lg shadow-red-600/20` 
                              : "bg-gray-700 hover:bg-gray-600 text-gray-200"}`}
                >
                  {currentGenre.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Results grid with enhanced card design */}
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
                {movies.map((movie: any, index: number) => {
                  // Get primary genre for card accent color
                  const primaryGenreId = movie.genre_ids?.[0];
                  const genreColorClass = primaryGenreId ? getGenreColor(primaryGenreId) : "from-red-600 to-rose-600";
                  
                  // Format release year
                  const releaseYear = movie.release_date 
                    ? new Date(movie.release_date).getFullYear() 
                    : null;
                  
                  return (
                    <Link href={`/movies/${movie.id}`} key={movie.id}>
                      <div className="group rounded-xl overflow-hidden bg-gray-800/40 backdrop-blur-sm shadow-xl 
                                    border border-gray-700 hover:border-red-500 hover:shadow-red-500/20
                                    transition-all duration-300 h-full flex flex-col">
                        {/* Card Header with Gradient Overlay */}
                        <div className="relative h-60 overflow-hidden">
                          {movie.poster_path ? (
                            <>
                              <Image
                                src={movieApi.getImageUrl(movie.poster_path)!}
                                alt={movie.title || "Movie Image"}
                                width={400}
                                height={600}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className={`absolute inset-0 opacity-40 bg-gradient-to-t ${genreColorClass} 
                                              group-hover:opacity-60 transition-opacity duration-300`}></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-700">
                              <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Rating Badge */}
                          {movie.vote_average && (
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white 
                                          px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {movie.vote_average.toFixed(1)}
                            </div>
                          )}
                          
                          {/* Year Badge */}
                          {releaseYear && (
                            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white 
                                          px-2 py-1 rounded-lg text-xs font-medium">
                              {releaseYear}
                            </div>
                          )}
                          
                          {/* Watch Now Overlay - appears on hover */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                                        flex items-center justify-center transition-opacity duration-300">
                            <span className="px-4 py-2 bg-red-600 text-white rounded-full font-bold 
                                          transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                              View Details
                            </span>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-5 flex-grow flex flex-col">
                          <h2 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors duration-200">
                            {movie.title || "Untitled"}
                          </h2>
                          
                          <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                            {movie.overview || "No description available"}
                          </p>
                          
                          {/* Genre Tags */}
                          <div className="mt-auto flex flex-wrap gap-2">
                            {movie.genre_ids?.slice(0, 3).map((genreId: number) => {
                              const genre = movieGenres.find(g => g.id === genreId);
                              if (!genre) return null;
                              
                              return (
                                <span 
                                  key={`${movie.id}-genre-${genreId}`} 
                                  className={`px-2 py-1 text-xs font-medium rounded-md 
                                            bg-gradient-to-r ${genre.color} text-white`}
                                >
                                  {genre.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination with film strip design */}
              <div className="mt-12 flex justify-center">
                <div className="relative flex gap-4 px-8 py-6 bg-gray-800/60 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl">
                  {/* Film strip decoration */}
                  <div className="absolute left-0 top-0 h-full w-3 bg-black flex flex-col justify-between py-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-3 w-full bg-gray-800"></div>
                    ))}
                  </div>
                  <div className="absolute right-0 top-0 h-full w-3 bg-black flex flex-col justify-between py-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-3 w-full bg-gray-800"></div>
                    ))}
                  </div>
                  
                  {pagination.current_page > 1 && (
                    <Link
                      href={{
                        pathname: "/movies",
                        query: {
                          ...(q ? { q } : {}),
                          ...(genreId ? { genre: genreId } : {}),
                          page: pagination.current_page - 1,
                        },
                      }}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl
                               border border-gray-700 hover:border-red-500 transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Link>
                  )}

                  <div className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl border border-gray-700">
                    Page {pagination.current_page} of {Math.min(pagination.total_pages, 500)}
                  </div>

                  {pagination.current_page < Math.min(pagination.total_pages, 500) && (
                    <Link
                      href={{
                        pathname: "/movies",
                        query: {
                          ...(q ? { q } : {}),
                          ...(genreId ? { genre: genreId } : {}),
                          page: pagination.current_page + 1,
                        },
                      }}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl
                               border border-gray-700 hover:border-red-500 transition-all duration-200 flex items-center gap-2"
                    >
                      Next
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/70 backdrop-blur-sm p-12 rounded-xl text-center border border-gray-700 shadow-xl">
              <svg className="w-20 h-20 mx-auto mb-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-3">No movies found</h3>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                We couldn't find any movies matching your search criteria. Try adjusting your filters or search query.
              </p>
              <Link href="/movies" className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl
                                           hover:from-red-700 hover:to-rose-700 shadow-lg shadow-red-700/30 transition-all duration-200">
                Explore All Movies
              </Link>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  );
}