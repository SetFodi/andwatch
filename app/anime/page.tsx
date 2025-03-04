// app/anime/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { animeApi } from "../../lib/services/api";
import { Suspense } from "react";
import { awaited } from "next/dist/server/web/spec-extension/adapters/next-request";

// Skeleton loader component
function AnimeCardSkeleton() {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg animate-pulse">
      <div className="bg-gray-700 h-64 w-full mb-3 rounded"></div>
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
    </div>
  );
}

// Map anime genres from Jikan API
const animeGenres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 14, name: "Horror" },
  { id: 7, name: "Mystery" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 36, name: "Slice of Life" },
  { id: 30, name: "Sports" },
  { id: 37, name: "Supernatural" },
  { id: 41, name: "Suspense" },
];

export default async function AnimeList({ 
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
  
  // Fetch anime data based on filters
  let animeData: any;
  if (searchQuery) {
    animeData = await animeApi.searchAnime(searchQuery, page);
  } else if (genreId) {
    animeData = await animeApi.getAnimeByGenre(genreId, page);
  } else {
    animeData = await animeApi.getTopAnime(page);
  }
  
  const animeList = animeData?.data || [];
  const pagination = animeData?.pagination || { 
    current_page: 1, 
    last_visible_page: 1,
    has_next_page: false 
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">
          {searchQuery ? `Search: ${searchQuery}` : 
           genreId ? `${animeGenres.find(g => g.id === genreId)?.name || 'Genre'} Anime` : 
           'Top Anime'}
        </h1>
        
        <div className="flex gap-2">
          <form className="relative">
            <input 
              type="text" 
              name="q" 
              placeholder="Search anime..." 
              defaultValue={searchQuery || ''}
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
      
      {/* Filters */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Genres</h2>
        <div className="flex flex-wrap gap-2 bg-gray-800 p-4 rounded-lg">
          <Link 
            href="/anime" 
            className={`px-3 py-1 rounded transition ${!genreId ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            All
          </Link>
          {animeGenres.map((genre) => (
            <Link 
              key={genre.id} 
              href={`/anime?genre=${genre.id}`}
              className={`px-3 py-1 rounded transition ${genreId === genre.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(20)].map((_, i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </div>
      }>
        {animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animeList.map((anime: any) => (
                <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className="block">
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full flex flex-col">
                    <div className="h-64 bg-gray-700 relative">
                      {anime.images?.jpg?.image_url ? (
                        <Image 
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          width={400}
                          height={600}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image Available
                        </div>
                      )}
                      {anime.score && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          ★ {anime.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                      <h2 className="text-xl font-semibold line-clamp-1">{anime.title}</h2>
                      <p className="text-sm text-gray-400 line-clamp-2 mt-1">{anime.synopsis}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {anime.genres?.slice(0, 3).map((genre: any) => (
                          <span key={genre.mal_id} className="px-2 py-1 bg-gray-700 rounded text-xs">
                            {genre.name}
                          </span>
                        ))}
                        {anime.genres && anime.genres.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                            +{anime.genres.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-3 flex justify-between items-center text-sm text-gray-400">
                        <span>{anime.type || "TV"}</span>
                        <span>{anime.episodes ? `${anime.episodes} eps` : "? eps"}</span>
                        <span>{anime.status}</span>
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
                      pathname: '/anime',
                      query: {
                        ...(searchQuery ? { q: searchQuery } : {}),
                        ...(genreId ? { genre: genreId } : {}),
                        page: pagination.current_page - 1
                      }
                    }}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
                  >
                    Previous
                  </Link>
                )}
                
                <span className="px-4 py-2 bg-gray-800 rounded">
                  Page {pagination.current_page} of {pagination.last_visible_page}
                </span>
                
                {pagination.has_next_page && (
                  <Link 
                    href={{
                      pathname: '/anime',
                      query: {
                        ...(searchQuery ? { q: searchQuery } : {}),
                        ...(genreId ? { genre: genreId } : {}),
                        page: pagination.current_page + 1
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
            <h3 className="text-xl font-semibold mb-2">No anime found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria.</p>
            <Link href="/anime" className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition">
              View All Anime
            </Link>
          </div>
        )}
      </Suspense>
    </div>
  );
}