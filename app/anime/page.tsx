import Link from "next/link";
import Image from "next/image";
import { animeApi } from "../../lib/services/api";

export default async function AnimeList({ searchParams }) {
  const genre = searchParams?.genre || null;
  const genreId = genre ? parseInt(genre, 10) : null;
  const q = searchParams?.q || null;
  const pageParam = searchParams?.page || "1";
  const page = parseInt(pageParam, 10) || 1;

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

  const commonGenres = [
    { id: 1, name: "Action" },
    { id: 2, name: "Adventure" },
    { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" },
    { id: 10, name: "Fantasy" },
    { id: 22, name: "Romance" },
    { id: 24, name: "Sci-Fi" }
  ];

  const pageTitle = q
    ? `Search: ${q}`
    : genreId
    ? `${commonGenres.find(g => g.id === genreId)?.name || "Genre"} Anime`
    : "Discover";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        {/* Enhanced Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl font-extralight tracking-wide mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {pageTitle}
          </h1>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-white to-transparent mb-8"></div>

          <div className="flex flex-col md:flex-row md:items-center gap-8">
            {/* Enhanced Search Box */}
            <form className="w-full md:w-96 relative group">
              <input
                type="text"
                name="q"
                placeholder="Search anime..."
                defaultValue={q || ""}
                className="w-full bg-gray-950/80 border border-gray-800/50 py-3 pl-5 pr-12 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 placeholder-gray-600"
              />
              <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            {/* Enhanced Genre Filter */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/anime"
                className={`px-5 py-2 text-sm rounded-full transition-all duration-300 ${!genreId ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-900/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-indigo-500"}`}
              >
                All
              </Link>
              {commonGenres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/anime?genre=${genre.id}`}
                  className={`px-5 py-2 text-sm rounded-full transition-all duration-300 ${genreId === genre.id ? "bg-indigo-600 text-white shadow-lg" : "bg-gray-900/50 border border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-indigo-500"}`}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Grid */}
        {animeList.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 animate-fade-in-up">
              {animeList.map((anime) => (
                <Link href={`/anime/${anime.mal_id}`} key={anime.mal_id} className="group">
                  <div className="flex flex-col h-full transition-transform duration-500 hover:-translate-y-2">
                    <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-lg bg-gray-900">
                      {anime.images?.jpg?.image_url ? (
                        <Image
                          src={anime.images.jpg.image_url}
                          alt={anime.title || "Anime"}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium mt-4 mb-1 line-clamp-1 transition-colors duration-300 group-hover:text-indigo-400">
                      {anime.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-400 space-x-2">
                      <span>{anime.type || 'TV'}</span>
                      <span>•</span>
                      <span>{anime.year || '--'}</span>
                      {anime.score && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-300">{anime.score.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Enhanced Pagination */}
            <div className="mt-16 flex justify-center">
              <div className="flex items-center space-x-8 bg-gray-900/50 py-3 px-6 rounded-full shadow-lg">
                {pagination.current_page > 1 && (
                  <Link
                    href={`/anime?page=${pagination.current_page - 1}${q ? `&q=${q}` : ''}${genreId ? `&genre=${genreId}` : ''}`}
                    className="text-sm text-gray-300 hover:text-indigo-400 flex items-center transition-colors duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Link>
                )}
                <span className="text-sm text-gray-400">
                  Page {pagination.current_page} of {pagination.last_visible_page}
                </span>
                {pagination.has_next_page && (
                  <Link
                    href={`/anime?page=${pagination.current_page + 1}${q ? `&q=${q}` : ''}${genreId ? `&genre=${genreId}` : ''}`}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-light mb-3 text-gray-200">No results found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Try adjusting your search or explore other categories
            </p>
          </div>
        )}
      </div>
    </div>
  );
}