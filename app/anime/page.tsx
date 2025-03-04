// app/anime/page.jsx (or page.tsx)
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { animeApi } from "../../lib/services/api";

// Enhanced skeleton loader with shimmer effect
function AnimeCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-800/40 border border-gray-700/50 h-full flex flex-col animate-pulse">
      <div className="relative h-60 bg-gray-700/50"></div>
      <div className="p-4 flex-grow flex flex-col space-y-3">
        <div className="h-6 bg-gray-700/50 rounded-full w-3/4" />
        <div className="h-4 bg-gray-700/50 rounded-full w-full" />
        <div className="h-4 bg-gray-700/50 rounded-full w-5/6" />
      </div>
    </div>
  );
}

const animeGenres = [
  { id: 1, name: "Action", color: "from-red-500/80 to-orange-500/80" },
  { id: 2, name: "Adventure", color: "from-emerald-500/80 to-cyan-500/80" },
  { id: 4, name: "Comedy", color: "from-amber-500/80 to-yellow-500/80" },
  { id: 8, name: "Drama", color: "from-purple-500/80 to-fuchsia-500/80" },
  { id: 10, name: "Fantasy", color: "from-blue-500/80 to-indigo-500/80" },
  { id: 14, name: "Horror", color: "from-gray-700/80 to-slate-800/80" },
  { id: 7, name: "Mystery", color: "from-indigo-600/80 to-violet-600/80" },
  { id: 22, name: "Romance", color: "from-pink-500/80 to-rose-500/80" },
  { id: 24, name: "Sci-Fi", color: "from-cyan-500/80 to-sky-500/80" },
  { id: 36, name: "Slice of Life", color: "from-teal-500/80 to-emerald-500/80" },
  { id: 30, name: "Sports", color: "from-orange-500/80 to-amber-500/80" },
  { id: 37, name: "Supernatural", color: "from-violet-600/80 to-purple-600/80" },
];

export default async function AnimeList({ searchParams }) {
  // Parse search parameters
  const genre = searchParams?.genre || null;
  const genreId = genre ? parseInt(genre, 10) : null;
  const q = searchParams?.q || null;
  const pageParam = searchParams?.page || "1";
  const page = parseInt(pageParam, 10) || 1;

  // Fetch anime data
  let animeData;
  try {
    if (q) {
      animeData = await animeApi.searchAnime(q, page);
    } else if (genreId) {
      animeData = await animeApi.getAnimeByGenre(genreId, page);
    } else {
      animeData = await animeApi.getTopAnime(page);
    }
  } catch (error) {
    console.error("Error fetching anime data:", error);
    animeData = { 
      data: [], 
      pagination: { current_page: 1, last_visible_page: 1, has_next_page: false } 
    };
  }

  const animeList = animeData?.data || [];
  const pagination = animeData?.pagination || {
    current_page: 1,
    last_visible_page: 1,
    has_next_page: false,
  };

  const selectedGenre = genreId ? animeGenres.find(g => g.id === genreId) : null;
  const pageTitle = q
    ? `Search: ${q}`
    : genreId
    ? `${selectedGenre?.name || "Genre"} Anime`
    : "Discover Anime";

  // Helper function to get genre color
  function getGenreColor(genreId) {
    return animeGenres.find(g => g.id === genreId)?.color || "from-indigo-500/80 to-blue-500/80";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950/50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className={`mb-8 p-8 rounded-3xl shadow-2xl overflow-hidden relative
                      bg-gradient-to-tr ${selectedGenre?.color || "from-indigo-600/30 to-blue-600/30"}
                      border border-gray-700/30`}>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white">
              {pageTitle}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mt-2">
              {q
                ? `Results for "${q}"`
                : genreId
                ? `Curated collection of ${selectedGenre?.name || ""} anime`
                : "Explore premium anime selections handpicked for you"}
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-gray-800/20 rounded-2xl p-6 mb-8 border border-gray-700/20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <form className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  placeholder="Search anime..."
                  defaultValue={q || ""}
                  className="w-full bg-gray-900/30 text-white rounded-xl px-5 py-3 pl-12 
                          border border-gray-700/50"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            
            <div className="w-full md:w-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                <Link
                  href="/anime"
                  className={`px-4 py-2 rounded-xl text-sm
                          ${!genreId 
                            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white" 
                            : "bg-gray-700/30 text-gray-300 border border-gray-700/30"}`}
                >
                  All Genres
                </Link>
                {animeGenres.slice(0, 8).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/anime?genre=${genre.id}`}
                    className={`px-4 py-2 rounded-xl text-sm
                            ${genreId === genre.id 
                              ? `bg-gradient-to-r ${genre.color} text-white` 
                              : "bg-gray-700/30 text-gray-300 border border-gray-700/30"}`}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Anime Grid */}
        {animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {animeList.map((anime) => {
                const primaryGenreId = anime.genres && anime.genres[0] ? anime.genres[0].mal_id : null;
                const primaryGenreColor = primaryGenreId ? getGenreColor(primaryGenreId) : "from-indigo-500/80 to-blue-500/80";
                
                return (
                  <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                    <div className="rounded-2xl overflow-hidden bg-gray-800/30
                                  border border-gray-700/30 hover:border-indigo-500/50
                                  h-full flex flex-col hover:shadow-xl">
                      <div className="relative h-60 overflow-hidden">
                        {anime.images?.jpg?.image_url && (
                          <>
                            <Image
                              src={anime.images.jpg.image_url}
                              alt={anime.title || "Anime"}
                              width={400}
                              height={600}
                              className="object-cover w-full h-full"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${primaryGenreColor} opacity-30`} />
                          </>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80">
                          <h3 className="text-white text-lg font-semibold line-clamp-1">
                            {anime.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            {anime.score && (
                              <div className="flex items-center text-sm text-amber-400">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {anime.score.toFixed(1)}
                              </div>
                            )}
                            <span className="text-xs text-gray-300 bg-gray-700/30 px-2 py-1 rounded-lg">
                              {anime.type || 'TV'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-grow">
                        <p className="text-gray-300 text-sm line-clamp-3">
                          {anime.synopsis || 'No synopsis available'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {anime.genres?.slice(0, 2).map((genre) => (
                            <span key={genre.mal_id} className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex gap-2">
                {pagination.current_page > 1 && (
                  <Link
                    href={`/anime?page=${pagination.current_page - 1}${q ? `&q=${q}` : ''}${genreId ? `&genre=${genreId}` : ''}`}
                    className="px-4 py-2 bg-gray-800/30 text-gray-300 rounded-lg border border-gray-700/30"
                  >
                    Previous
                  </Link>
                )}
                <div className="px-4 py-2 bg-gray-800/30 text-gray-300 rounded-lg border border-gray-700/30">
                  Page {pagination.current_page}
                </div>
                {pagination.has_next_page && (
                  <Link
                    href={`/anime?page=${pagination.current_page + 1}${q ? `&q=${q}` : ''}${genreId ? `&genre=${genreId}` : ''}`}
                    className="px-4 py-2 bg-gray-800/30 text-gray-300 rounded-lg border border-gray-700/30"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-12">
            <div className="text-6xl text-gray-500/50">🎌</div>
            <h3 className="text-2xl font-light text-gray-300 mt-4">No matches found</h3>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              Try adjusting your search filters or explore our trending anime selections
            </p>
          </div>
        )}
      </div>
    </div>
  );
}