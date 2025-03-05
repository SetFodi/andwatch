// app/anime/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { animeApi } from "../../../lib/services/api";
import { notFound } from "next/navigation";
import WatchStatusButtons from "../../../components/WatchStatusButtons";
import UserRating from "../../../components/UserRating";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import ReviewsSection from "@/components/ReviewsSection";

// Map anime genres with updated colors
const animeGenres = [
  { id: 1, name: "Action", color: "from-red-800 to-orange-700" },
  { id: 2, name: "Adventure", color: "from-green-800 to-emerald-700" },
  { id: 4, name: "Comedy", color: "from-yellow-700 to-amber-600" },
  { id: 8, name: "Drama", color: "from-purple-800 to-fuchsia-700" },
  { id: 10, name: "Fantasy", color: "from-blue-800 to-indigo-700" },
  { id: 14, name: "Horror", color: "from-gray-900 to-gray-800" },
  { id: 7, name: "Mystery", color: "from-indigo-900 to-violet-800" },
  { id: 22, name: "Romance", color: "from-pink-700 to-rose-600" },
  { id: 24, name: "Sci-Fi", color: "from-cyan-700 to-blue-700" },
  { id: 36, name: "Slice of Life", color: "from-teal-700 to-emerald-600" },
  { id: 30, name: "Sports", color: "from-orange-800 to-amber-700" },
  { id: 37, name: "Supernatural", color: "from-violet-800 to-purple-700" },
  { id: 41, name: "Suspense", color: "from-slate-800 to-gray-700" },
];

function getGenreColor(genreId: number) {
  const genre = animeGenres.find(g => g.id === genreId);
  return genre?.color || "from-indigo-700 to-violet-700";
}

async function getAnimeDetails(id: string) {
  try {
    const data = await animeApi.getAnimeById(id);
    if (!data || !data.data) {
      return null;
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
}

async function getUserWatchItem(userId: string, animeId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;
    
    return user.watchlist.find(
      item => item.externalId === animeId && item.mediaType === 'anime'
    );
  } catch (error) {
    console.error("Error fetching user watch status:", error);
    return null;
  }
}

export default async function AnimeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const anime = await getAnimeDetails(resolvedParams.id);
  
  if (!anime) {
    notFound();
  }

  let userWatchItem = null;
  if (session?.user?.id) {
    userWatchItem = await getUserWatchItem(session.user.id, resolvedParams.id);
  }

  const startDate = anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : "?";
  const endDate = anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString() : 
                  (anime.status === "Currently Airing" ? "Present" : "?");
  
  const primaryGenreId = anime.genres?.[0]?.mal_id;
  const genreColorClass = primaryGenreId ? getGenreColor(primaryGenreId) : "from-indigo-700 to-violet-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          {anime.images?.jpg?.large_image_url && (
            <Image
              src={anime.images.jpg.large_image_url}
              alt={anime.title}
              fill
              className="object-cover opacity-10 blur-xl"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/80 to-gray-900"></div>
        </div>
        
        <div className="relative z-10 py-20 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/3 flex flex-col">
              <div className={`rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 
                             relative group transition-all duration-300 
                             hover:border-transparent hover:shadow-lg`}>
                <div className={`absolute inset-0 bg-gradient-to-tr ${genreColorClass} 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                
                {anime.images?.jpg?.large_image_url ? (
                  <div className="aspect-[3/4] relative">
                    <Image 
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] bg-gray-800 flex items-center justify-center text-gray-500">
                    <svg className="w-24 h-24 opacity-25" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="mt-8 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Information
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Format</span>
                    <span className="text-white font-medium">{anime.type || "Unknown"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Episodes</span>
                    <span className="text-white font-medium">{anime.episodes || "Unknown"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-white font-medium">{anime.status || "Unknown"}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aired</span>
                    <span className="text-white font-medium">{startDate} to {endDate}</span>
                  </div>
                  
                  {anime.season && anime.year && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Season</span>
                      <span className="text-white font-medium capitalize">{anime.season} {anime.year}</span>
                    </div>
                  )}
                  
                  {anime.studios && anime.studios.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Studios</span>
                      <span className="text-white font-medium text-right">{anime.studios.map(s => s.name).join(", ")}</span>
                    </div>
                  )}
                  
                  {anime.source && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source</span>
                      <span className="text-white font-medium">{anime.source}</span>
                    </div>
                  )}
                  
                  {anime.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="text-white font-medium">{anime.duration}</span>
                    </div>
                  )}
                  
                  {anime.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rating</span>
                      <span className="text-white font-medium">{anime.rating}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-white">{anime.score ? anime.score.toFixed(2) : "N/A"}</span>
                    </div>
                    <span className="text-gray-500 text-sm">{anime.scored_by ? `${anime.scored_by.toLocaleString()} users` : ""}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Ranked</span>
                    <span className="text-white font-medium">#{anime.rank || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Popularity</span>
                    <span className="text-white font-medium">#{anime.popularity || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              {session && (
                <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    My List
                  </h3>
                  
                  <WatchStatusButtons 
                    itemId={resolvedParams.id}
                    mediaType="anime"
                    currentStatus={userWatchItem?.status || null}
                  />
                  
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <h4 className="font-bold text-white mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      My Rating
                    </h4>
                    
                    <UserRating 
                      itemId={resolvedParams.id}
                      mediaType="anime"
                      currentRating={userWatchItem?.userRating || null}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-full lg:w-2/3">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                  {anime.title}
                </h1>
                
                {anime.title_english && anime.title_english !== anime.title && (
                  <h2 className="text-2xl text-gray-400 mb-3">{anime.title_english}</h2>
                )}
                
                {anime.title_japanese && (
                  <h3 className="text-xl text-gray-500 mb-4">{anime.title_japanese}</h3>
                )}
                
                <div className="flex flex-wrap gap-4">
                  {anime.genres?.map((genre) => {
                    const genreColor = getGenreColor(genre.mal_id);
                    return (
                      <Link 
                        key={genre.mal_id} 
                        href={`/anime?genre=${genre.mal_id}`}
                        className={`btn btn-secondary bg-gradient-to-r ${genreColor} hover:shadow-xl`}
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
                    <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 3a2 2 0 002 2m-2-2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7H3a2 2 0 01-2-2V8a2 2 0 012-2h3.9a5.002 5.002 0 0110.2 0H20a2 2 0 012 2v2a2 2 0 01-2 2h-2z" clipRule="evenodd" />
                    </svg>
                    Synopsis
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed text-base">
                    {anime.synopsis || "No synopsis available for this anime."}
                  </p>
                </div>
              </div>
              
              {anime.trailer && anime.trailer.youtube_id && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Trailer
                    </h3>
                    
                    <div className="relative rounded-lg overflow-hidden aspect-video">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                        title={`${anime.title} Trailer`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
              
              {anime.characters && anime.characters.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      Characters
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {anime.characters.slice(0, 8).map((character) => (
                        <div 
                          key={character.character.mal_id} 
                          className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700 
                                    hover:border-indigo-500 transition-all duration-300 shadow-lg"
                        >
                          <div className="flex">
                            <div className="w-16 h-20 relative">
                              {character.character.images?.jpg?.image_url ? (
                                <Image
                                  src={character.character.images.jpg.image_url}
                                  alt={character.character.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="p-3 flex-1">
                              <p className="font-medium text-white text-sm line-clamp-1">{character.character.name}</p>
                              <p className="text-xs text-gray-500 line-clamp-1">{character.role}</p>
                              {character.voice_actors && character.voice_actors.length > 0 && (
                                <p className="text-xs text-indigo-300 mt-1 line-clamp-1">
                                  VA: {character.voice_actors[0].person.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {anime.recommendations && anime.recommendations.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      You Might Also Like
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {anime.recommendations.slice(0, 4).map((rec) => (
                        <Link href={`/anime/${rec.entry.mal_id}`} key={rec.entry.mal_id}>
                          <div className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700 
                                        hover:border-indigo-500 hover:shadow-lg transition-all duration-300 h-full">
                            <div className="relative aspect-[3/4]">
                              {rec.entry.images?.jpg?.image_url ? (
                                <>
                                  <Image
                                    src={rec.entry.images.jpg.image_url}
                                    alt={rec.entry.title}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent"></div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h4 className="text-white font-medium text-sm line-clamp-2">{rec.entry.title}</h4>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Link 
                        href="/anime" 
                        className="inline-block px-4 py-2 bg-indigo-700 hover:bg-indigo-600 
                                   text-white rounded-lg transition-colors duration-200"
                      >
                        Discover More Anime
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {anime.relations && anime.relations.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Related Anime
                    </h3>
                    
                    <div className="space-y-4">
                      {anime.relations.map((relation, index) => (
                        <div key={index} className="bg-gray-800/60 rounded-lg p-4">
                          <h4 className="font-semibold text-indigo-300 mb-2">{relation.relation}</h4>
                          <div className="flex flex-wrap gap-2">
                            {relation.entry.map((entry) => (
                              entry.type === "anime" ? (
                                <Link 
                                  key={entry.mal_id} 
                                  href={`/anime/${entry.mal_id}`}
                                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors duration-200"
                                >
                                  {entry.name}
                                </Link>
                              ) : (
                                <span key={entry.mal_id} className="px-3 py-1 bg-gray-700 rounded text-gray-500 text-sm">
                                  {entry.name}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
<ReviewsSection
  itemId={resolvedParams.id}
  mediaType="anime"
  itemTitle={anime.title}
  itemImage={anime.images?.jpg?.large_image_url}
  session={!!session}
  userId={session?.user?.id}
  colorTheme="indigo"
/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}