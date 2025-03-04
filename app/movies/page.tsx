// app/movies/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { movieApi } from "../../lib/services/api";
import { Suspense } from "react";
import { awaited } from "next/dist/server/web/spec-extension/adapters/next-request";

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

// Popular movie genres from TMDB
const movieGenres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
];

export default async function MoviesList({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const session = await getServerSession(authOptions);
  
  // Correctly await and extract searchParams
  const awaitedParams = await awaited(searchParams);
  
  // Get genre filter from searchParams
  let genreId: number | null = null;
  const genreParam = awaitedParams.genre;
  if (typeof genreParam === 'string') {
    genreId = parseInt(genreParam);
  }
  
  // Get search query from searchParams
  let searchQuery: string | null = null;
  const queryParam = awaitedParams.q;
  if (typeof queryParam === 'string') {
    searchQuery = queryParam;
  }
  
  // Get page from searchParams
  let page = 1;
  const pageParam = awaitedParams.page;
  if (typeof pageParam === 'string') {
    const parsedPage = parseInt(pageParam);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }
  
  // Fetch movie data based on filters
  let movieData: any;
  if (searchQuery) {
    movieData = await movieApi.searchMovies(searchQuery, page);
  } else if (genreId) {
    movieData = await movieApi.getMoviesByGenre(genreId, page);
  } else {
    movieData = await movieApi.getPopularMovies(page);
  }
  
  const moviesList = movieData?.results || [];
  const totalPages = movieData?.total_pages || 1;
  const currentPage = movieData?.page || 1;
  const hasNextPage = currentPage < totalPages && currentPage < 500; // TMDB API limit

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">
          {searchQuery ? `Search: ${searchQuery}` : 
           genreId ? `${movieGenres.find(g => g.id === genreId)?.name || 'Genre'} Movies` : 
           'Popular Movies'}
        </h1>
        
        <div className="flex gap-2">
          <form className="relative">
            <input 
              type="text" 
              name="q" 
              placeholder="Search movies..." 
              defaultValue={searchQuery || ''}
              className="bg-gray-700 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r"
            >
              Search
            </button>
          </form>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Genres</h2>
        <div className="flex flex-wrap gap-2 bg-gray-800 p-4 rounded-lg">
          <Link 
            href="/movies" 
            className={`px-3 py-1 rounded transition ${!genreId ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            All
          </Link>
          {movieGenres.map((genre) => (
            <Link 
              key={genre.id} 
              href={`/movies?genre=${genre.id}`}
              className={`px-3 py-1 rounded transition ${genreId === genre.id ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(20)].map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      }>
        {moviesList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {moviesList.map((movie: any) => (
                <Link href={`/movies/${movie.id}`} key={movie.id} className="block">
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full flex flex-col">
                    <div className="h-64 bg-gray-700 relative">
                      {movie.poster_path ? (
                        <Image 
                          src={movieApi.getImageUrl(movie.poster_path) || ''}
                          alt={movie.title}
                          width={400}
                          height={600}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image Available
                        </div>
                      )}
                      {movie.vote_average > 0 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                          ★ {movie.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="text-xl font-semibold line-clamp-1">{movie.title}</h2>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{movie.overview}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {movie.genre_ids?.slice(0, 3).map((genreId: number) => {
                          const genre = movieGenres.find(g => g.id === genreId);
                          return genre ? (
                            <span key={genre.id} className="px-2 py-1 bg-gray-700 rounded text-xs">
                              {genre.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                      
                      <div className="mt-auto pt-3 text-sm text-gray-400">
                        {movie.release_date ? (
                          <span>{new Date(movie.release_date).getFullYear()}</span>
                        ) : (
                          <span>Release date unknown</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link 
                    href={{
                      pathname: '/movies',
                      query: {
                        ...(searchQuery ? { q: searchQuery } : {}),
                        ...(genreId ? { genre: genreId } : {}),
                        page: currentPage - 1
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                  >
                    Previous
                  </Link>
                )}
                
                <span className="px-4 py-2 bg-gray-800 rounded">
                  Page {currentPage} of {Math.min(totalPages, 500)}
                </span>
                
                {hasNextPage && (
                  <Link 
                    href={{
                      pathname: '/movies',
                      query: {
                        ...(searchQuery ? { q: searchQuery } : {}),
                        ...(genreId ? { genre: genreId } : {}),
                        page: currentPage + 1
                      }
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
            <Link href="/movies" className="px-6 py-3 bg-red-600 rounded hover:bg-red-700 transition">
              View All Movies
            </Link>
          </div>
        )}
      </Suspense>
    </div>
  );
}