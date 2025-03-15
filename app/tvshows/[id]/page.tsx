// app/tvshows/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { tmdbApi } from "../../../lib/services/api";
import { notFound } from "next/navigation";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import Link from "next/link";
import Image from "next/image";
import WatchStatusButtons from "../../../components/WatchStatusButtons";
import UserRating from "../../../components/UserRating";
import ReviewsSection from "@/components/ReviewsSection";

// Replace the tvGenres array with this improved version
const tvGenres = [
  { id: 10759, name: "Action & Adventure", color: "bg-red-600", textColor: "text-white font-semibold" },
  { id: 16, name: "Animation", color: "bg-blue-500", textColor: "text-red font-semibold" },
  { id: 35, name: "Comedy", color: "bg-yellow-500", textColor: "text-black font-bold" },
  { id: 80, name: "Crime", color: "bg-slate-800", textColor: "text-white font-semibold" },
  { id: 18, name: "Drama", color: "bg-purple-600", textColor: "text-white font-semibold" },
  { id: 10751, name: "Family", color: "bg-emerald-600", textColor: "text-white font-semibold" },
  { id: 9648, name: "Mystery", color: "bg-indigo-800", textColor: "text-white font-semibold" },
  { id: 10765, name: "Sci-Fi & Fantasy", color: "bg-cyan-600", textColor: "text-white font-semibold" },
  { id: 10768, name: "War & Politics", color: "bg-amber-800", textColor: "text-white font-semibold" },
];

function getGenreStyles(genreId) {
  const genre = tvGenres.find((g) => g.id === genreId);
  return {
    bgColor: genre?.color || "bg-gray-700",
    textColor: genre?.textColor || "text-white font-semibold"
  };
}

async function getTVShowDetails(id: string) {
  try {
    const data = await tmdbApi.getTVShowById(id);
    if (!data || data.success === false) return null;
    return data;
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    return null;
  }
}

async function getUserWatchItem(userId: string, tvShowId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;
    return user.watchlist.find(
      (item) => item.externalId === tvShowId && item.mediaType === "tv"
    );
  } catch (error) {
    console.error("Error fetching user watch status:", error);
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const tvShow = await getTVShowDetails(resolvedParams.id);

  if (!tvShow) {
    notFound();
  }

  let userWatchItem = null;
  if (session?.user?.id) {
    userWatchItem = await getUserWatchItem(session.user.id, resolvedParams.id);
  }

  const firstAirDate = tvShow.first_air_date
    ? new Date(tvShow.first_air_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";
  const lastAirDate = tvShow.last_air_date
    ? new Date(tvShow.last_air_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : tvShow.status === "Returning Series"
    ? "Present"
    : "Unknown";

  const primaryGenreId = tvShow.genres?.[0]?.id;
  const genreColorClass = primaryGenreId ? getGenreStyles(primaryGenreId) : "from-gray-700 to-gray-600";

  const formatEpisodeRuntime = (runtimes: number[]) => {
    if (!runtimes || runtimes.length === 0) return "N/A";
    const avg = runtimes.reduce((a, b) => a + b, 0) / runtimes.length;
    const hours = Math.floor(avg / 60);
    const minutes = Math.round(avg % 60);
    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
  };

  const creator = tvShow.created_by?.[0];
  const featuredCast = tvShow.credits?.cast?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-950">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          {tvShow.backdrop_path && (
            <Image
              src={tmdbApi.getImageUrl(tvShow.backdrop_path) || ""}
              alt={tvShow.name}
              fill
              className="object-cover opacity-20"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900"></div>
        </div>

        <div className="relative z-10 py-20 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/3 flex flex-col">
              <div
                className={`rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 
                            relative group transition-all duration-300 
                            hover:shadow-blue-500/20 hover:border-transparent`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-tr ${genreColorClass} 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
                ></div>
                {tvShow.poster_path ? (
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={tmdbApi.getImageUrl(tvShow.poster_path) || ""}
                      alt={tvShow.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <div className="mt-8 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">First Air Date</span>
                    <span className="text-white font-medium">{firstAirDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Air Date</span>
                    <span className="text-white font-medium">{lastAirDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seasons</span>
                    <span className="text-white font-medium">{tvShow.number_of_seasons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Episodes</span>
                    <span className="text-white font-medium">{tvShow.number_of_episodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Runtime</span>
                    <span className="text-white font-medium">{formatEpisodeRuntime(tvShow.episode_run_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-medium">{tvShow.status}</span>
                  </div>
                  {tvShow.networks?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network</span>
                      <span className="text-white font-medium">{tvShow.networks[0].name}</span>
                    </div>
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-white">{tvShow.vote_average.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{tvShow.vote_count.toLocaleString()} votes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Popularity</span>
                    <span className="text-white font-medium">{tvShow.popularity.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {session && (
                <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    My List
                  </h3>
                  <WatchStatusButtons
                    itemId={resolvedParams.id}
                    mediaType="tv"
                    currentStatus={userWatchItem?.status || null}
                    colorTheme="blue"
                  />
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="font-bold text-white mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      My Rating
                    </h4>
                    <UserRating
                      itemId={resolvedParams.id}
                      mediaType="tv"
                      currentRating={userWatchItem?.userRating || null}
                      colorTheme="blue"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-2/3">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{tvShow.name}</h1>
                {tvShow.tagline && <h2 className="text-2xl text-gray-400 mb-3 italic">"{tvShow.tagline}"</h2>}
                <div className="flex flex-wrap gap-2 mb-6">
{tvShow.genres?.map((genre) => {
  const { bgColor, textColor } = getGenreStyles(genre.id);
  return (
    <Link
      key={genre.id}
      href={`/tvshows?genre=${genre.id}`}
      className={`px-4 py-2 rounded-full text-sm ${bgColor} ${textColor} transition-all hover:opacity-90 inline-block shadow-md`}
    >
      {genre.name}
    </Link>
  );
})}
                </div>
              </div>

              <div className="mb-10">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Synopsis
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {tvShow.overview || "No synopsis available for this TV show."}
                  </p>
                </div>
              </div>

              <div className="mb-10">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Cast & Crew
                  </h3>
                  {creator && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-blue-300 mb-2">Creator</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full overflow-hidden relative">
                          {creator.profile_path ? (
                            <Image
                              src={tmdbApi.getImageUrl(creator.profile_path) || ""}
                              alt={creator.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium">{creator.name}</span>
                      </div>
                    </div>
                  )}
                  {featuredCast.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-4">Featured Cast</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {featuredCast.map((person: any) => (
                          <div
                            key={person.id}
                            className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700 transition-all duration-300 shadow-lg"
                          >
                            <div className="flex">
                              <div className="w-16 h-20 relative">
                                {person.profile_path ? (
                                  <Image
                                    src={tmdbApi.getImageUrl(person.profile_path) || ""}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="p-3 flex-1">
                                <p className="font-medium text-white text-sm line-clamp-1">{person.name}</p>
                                <p className="text-xs text-gray-400 line-clamp-1">{person.character}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {tvShow.similar?.results?.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                      </svg>
                      You Might Also Like
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tvShow.similar.results.slice(0, 4).map((similarShow: any) => (
                        <Link href={`/tvshows/${similarShow.id}`} key={similarShow.id}>
                          <div className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 hover:shadow-lg transition-all duration-300 h-full">
                            <div className="relative aspect-[3/4]">
                              {similarShow.poster_path ? (
                                <>
                                  <Image
                                    src={tmdbApi.getImageUrl(similarShow.poster_path) || ""}
                                    alt={similarShow.name}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  No Image
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h4 className="text-white font-medium text-sm line-clamp-2">{similarShow.name}</h4>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link
                        href="/tvshows"
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        <p className="text-white">Discover More TV Shows</p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {tvShow.videos?.results?.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Trailer
                    </h3>
                    {(() => {
                      const trailer =
                        tvShow.videos.results.find((v: any) => v.type === "Trailer" && v.site === "YouTube") ||
                        tvShow.videos.results[0];
                      if (trailer && trailer.key) {
                        return (
                          <div className="relative rounded-lg overflow-hidden aspect-video shadow-xl">
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${trailer.key}`}
                              title={`${tvShow.name} Trailer`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        );
                      }
                      return <div className="text-center py-4 text-gray-400">No trailer available</div>;
                    })()}
                  </div>
                </div>
              )}

              <ReviewsSection
                itemId={resolvedParams.id}
                mediaType="tv"
                itemTitle={tvShow.name}
                itemImage={tvShow.poster_path ? tmdbApi.getImageUrl(tvShow.poster_path) : null}
                session={!!session}
                userId={session?.user?.id || null}
                colorTheme="blue"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}