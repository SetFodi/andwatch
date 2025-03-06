// app/movies/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { movieApi } from "../../../lib/services/api";
import { notFound } from "next/navigation";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import Link from "next/link";
import Image from "next/image";
import WatchStatusButtons from "../../../components/WatchStatusButtons";
import UserRating from "../../../components/UserRating";
import ReviewsSection from "@/components/ReviewsSection";

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
  return genre?.color || "from-red-600 to-rose-600";
}

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

async function getUserWatchItem(userId: string, movieId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;
   
    return user.watchlist.find(
      item => item.externalId === movieId && item.mediaType === 'movie'
    );
  } catch (error) {
    console.error("Error fetching user watch status:", error);
    return null;
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Await params to resolve the Promise
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const movie = await getMovieDetails(resolvedParams.id);
 
  if (!movie) {
    notFound();
  }
  
  // Get user's watch status and rating if logged in
  let userWatchItem = null;
  if (session?.user?.id) {
    userWatchItem = await getUserWatchItem(session.user.id, resolvedParams.id);
  }
  
  // Format runtime to hours and minutes
  const hours = Math.floor((movie.runtime || 0) / 60);
  const minutes = (movie.runtime || 0) % 60;
  const formattedRuntime = `${hours > 0 ? `${hours}h` : ""} ${minutes > 0 ? `${minutes}m` : ""}`.trim();
  
  // Get primary genre for theme color
  const primaryGenreId = movie.genres?.[0]?.id;
  const genreColorClass = primaryGenreId ? getGenreColor(primaryGenreId) : "from-red-600 to-rose-600";
  
  // Format release date
  const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : "Unknown";
  
  // Format budget and revenue
  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short'
    }).format(amount);
  };

  // Find director and featured cast
  const director = movie.credits?.crew?.find((person: any) => person.job === "Director");
  const featuredCast = movie.credits?.cast?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-red-950">
      {/* Hero section with backdrop image */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden z-0">
          {movie.backdrop_path ? (
            <Image
              src={movieApi.getImageUrl(movie.backdrop_path) || ''}
              alt={movie.title}
              fill
              className="object-cover opacity-20"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900"></div>
          
          {/* Cinematic film strip decorations */}
          <div className="absolute left-0 top-0 w-2 h-full bg-black flex flex-col justify-between">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-900"></div>
            ))}
          </div>
          <div className="absolute right-0 top-0 w-2 h-full bg-black flex flex-col justify-between">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-900"></div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 py-20 px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Poster Column */}
            <div className="w-full lg:w-1/3 flex flex-col">
              <div className={`rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 
                             relative group transition-all duration-300 
                             hover:shadow-red-500/20 hover:border-transparent`}>
                <div className={`absolute inset-0 bg-gradient-to-tr ${genreColorClass} 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                
                {movie.poster_path ? (
                  <div className="aspect-[2/3] relative">
                    <Image 
                      src={movieApi.getImageUrl(movie.poster_path) || ''}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center text-gray-500">
                    <svg className="w-24 h-24 opacity-25" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Stats Panel */}
              <div className="mt-8 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Information
                </h3>
                
                <div className="space-y-3 text-sm">
                  {movie.release_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Release Date</span>
                      <span className="text-white font-medium">{releaseDate}</span>
                    </div>
                  )}
                  
                  {formattedRuntime && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Runtime</span>
                      <span className="text-white font-medium">{formattedRuntime}</span>
                    </div>
                  )}
                  
                  {movie.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white font-medium">{movie.status}</span>
                    </div>
                  )}
                  
                  {movie.budget > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget</span>
                      <span className="text-white font-medium">{formatCurrency(movie.budget)}</span>
                    </div>
                  )}
                  
                  {movie.revenue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue</span>
                      <span className="text-white font-medium">{formatCurrency(movie.revenue)}</span>
                    </div>
                  )}
                  
                  {movie.production_companies && movie.production_companies.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Production</span>
                      <span className="text-white font-medium text-right">
                        {movie.production_companies.slice(0, 2).map((c: any) => c.name).join(", ")}
                        {movie.production_companies.length > 2 ? ` + ${movie.production_companies.length - 2} more` : ''}
                      </span>
                    </div>
                  )}
                  
                  {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Languages</span>
                      <span className="text-white font-medium">
                        {movie.spoken_languages.map((l: any) => l.english_name).join(", ")}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Popularity Stats */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-white">{movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{movie.vote_count ? `${movie.vote_count.toLocaleString()} votes` : ""}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Popularity</span>
                    <span className="text-white font-medium">{movie.popularity ? movie.popularity.toFixed(0) : "N/A"}</span>
                  </div>
                </div>
              </div>
              
              {/* User Actions Section */}
              {session && (
                <div className="mt-6 bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    My List
                  </h3>
                  
                  <WatchStatusButtons 
                    itemId={resolvedParams.id}
                    mediaType="movie"
                    currentStatus={userWatchItem?.status || null}
                    colorTheme="red"
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
                      mediaType="movie"
                      currentRating={userWatchItem?.userRating || null}
                      colorTheme="red"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Column */}
            <div className="w-full lg:w-2/3">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                  {movie.title}
                </h1>
                
                {movie.tagline && (
                  <h2 className="text-2xl text-gray-400 mb-3 italic">"{movie.tagline}"</h2>
                )}
                
                {/* Genre Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres?.map((genre: any) => {
                    const genreColor = getGenreColor(genre.id);
                    return (
                      <Link 
                        key={genre.id} 
                        href={`/movies?genre=${genre.id}`}
                        className={`px-4 py-2 rounded-full text-sm font-medium 
                                  bg-gradient-to-r ${genreColor} text-white
                                  transition-all duration-200 hover:shadow-lg`}
                      >
                        {genre.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
              
              {/* Synopsis */}
              <div className="mb-10">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Synopsis
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed text-base">
                    {movie.overview || "No synopsis available for this movie."}
                  </p>
                </div>
              </div>
              
              {/* Crew & Cast */}
              <div className="mb-10">
                <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Cast & Crew
                  </h3>
                  
                  {director && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-indigo-300 mb-2">Director</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full overflow-hidden relative">
                          {director.profile_path ? (
                            <Image
                              src={movieApi.getImageUrl(director.profile_path) || ''}
                              alt={director.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-white font-medium">{director.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {featuredCast.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-indigo-300 mb-4">Featured Cast</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {featuredCast.map((person: any) => (
                          <div 
                            key={person.id} 
                            className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700 
                                      transition-all duration-300 shadow-lg"
                          >
                            <div className="flex">
                              <div className="w-16 h-20 relative">
                                {person.profile_path ? (
                                  <Image
                                    src={movieApi.getImageUrl(person.profile_path) || ''}
                                    alt={person.name}
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
              
              {/* Similar Movies */}
              {movie.similar && movie.similar.results?.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                      </svg>
                      You Might Also Like
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {movie.similar.results.slice(0, 4).map((similarMovie: any) => (
                        <Link href={`/movies/${similarMovie.id}`} key={similarMovie.id}>
                          <div className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700 
                                        hover:border-red-500 hover:shadow-lg transition-all duration-300 h-full">
                            <div className="relative aspect-[3/4]">
                              {similarMovie.poster_path ? (
                                <>
                                  <Image
                                    src={movieApi.getImageUrl(similarMovie.poster_path) || ''}
                                    alt={similarMovie.title}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <h4 className="text-white font-medium text-sm line-clamp-2">{similarMovie.title}</h4>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-center">
                      <Link 
                        href="/movies" 
                        className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 
                                   text-white rounded-lg transition-colors duration-200"
                      >
                        Discover More Movies
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Trailer */}
              {movie.videos && movie.videos.results?.length > 0 && (
                <div className="mb-10">
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Trailer
                    </h3>
                    
                    {/* Find official trailer or fallback to first video */}
                    {(() => {
                      const trailer = movie.videos.results.find((v: any) => 
                        v.type === "Trailer" && v.site === "YouTube"
                      ) || movie.videos.results[0];
                      
                      if (trailer && trailer.key) {
                        return (
                          <div className="relative rounded-lg overflow-hidden aspect-video shadow-xl">
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${trailer.key}`}
                              title={`${movie.title} Trailer`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        );
                      }
                      
                      return (
                        <div className="text-center py-4 text-gray-400">
                          No trailer available
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              <ReviewsSection
                itemId={resolvedParams.id}
                mediaType="movie"
                itemTitle={movie.title}
                itemImage={movie.poster_path ? movieApi.getImageUrl(movie.poster_path) || undefined : undefined}
                session={!!session}
                userId={session?.user?.id}
                colorTheme="red"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}