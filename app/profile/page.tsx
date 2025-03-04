// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "../../lib/db";
import { User } from "../../lib/models/User";
import Link from "next/link";
import Image from "next/image";
import { animeApi, movieApi } from "../../lib/services/api";

// Helper function to get anime details
async function getAnimeDetails(externalId: string) {
  try {
    const data = await animeApi.getAnimeById(externalId);
    if (!data || !data.data) return null;
    
    return {
      id: data.data.mal_id,
      title: data.data.title,
      image: data.data.images?.jpg?.image_url || null,
      score: data.data.score,
      type: "anime",
      year: data.data.year || (data.data.aired?.from ? new Date(data.data.aired.from).getFullYear() : null),
      url: `/anime/${data.data.mal_id}`
    };
  } catch (error) {
    console.error(`Error fetching anime ${externalId}:`, error);
    return null;
  }
}

// Helper function to get movie details
async function getMovieDetails(externalId: string) {
  try {
    const data = await movieApi.getMovieById(externalId);
    if (!data || !data.id) return null;
    
    return {
      id: data.id,
      title: data.title,
      image: data.poster_path ? movieApi.getImageUrl(data.poster_path) : null,
      score: data.vote_average,
      type: "movie",
      year: data.release_date ? new Date(data.release_date).getFullYear() : null,
      url: `/movies/${data.id}`
    };
  } catch (error) {
    console.error(`Error fetching movie ${externalId}:`, error);
    return null;
  }
}

// Media Card Component
function MediaCard({ item }: { item: any }) {
  if (!item) return null;
  
  return (
    <Link href={item.url} key={`${item.type}-${item.id}`}>
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full border border-gray-700">
        <div className="h-56 bg-gray-700 relative">
          {item.image ? (
            <Image 
              src={item.image} 
              alt={item.title} 
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {item.score && (
            <div className="absolute top-2 right-2 bg-opacity-80 bg-gray-900 text-white px-2 py-1 rounded-full text-sm font-medium">
              ★ {item.score.toFixed(1)}
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent h-16"></div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <div className="flex justify-between mt-1 text-sm">
            <span className="text-gray-400 capitalize">{item.type}</span>
            {item.year && <span className="text-gray-400">{item.year}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Empty State Component
function EmptyState({ mediaType }: { mediaType: "anime" | "movie" | "both" }) {
  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg text-center shadow-md">
      <p className="text-gray-300 mb-4">
        {mediaType === "both" 
          ? "You don't have anything in this list yet."
          : `You don't have any ${mediaType}s in this list yet.`}
      </p>
      <div className="mt-2 flex justify-center gap-3">
        {(mediaType === "anime" || mediaType === "both") && (
          <Link href="/anime" className="px-4 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition text-white font-medium">
            Browse Anime
          </Link>
        )}
        {(mediaType === "movie" || mediaType === "both") && (
          <Link href="/movies" className="px-4 py-2 bg-rose-600 rounded-full hover:bg-rose-700 transition text-white font-medium">
            Browse Movies
          </Link>
        )}
      </div>
    </div>
  );
}

// Category Section Component
function CategorySection({ 
  title, 
  items, 
  viewAllLink,
  mediaType
}: { 
  title: string, 
  items: any[], 
  viewAllLink: string,
  mediaType: "anime" | "movie" | "both"
}) {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          {title}
          <span className="ml-3 text-gray-400 text-sm font-normal">
            {items.filter(Boolean).length} {items.filter(Boolean).length === 1 ? "item" : "items"}
          </span>
        </h2>
        <Link href={viewAllLink} className="text-indigo-400 hover:text-indigo-300 hover:underline">
          View All
        </Link>
      </div>
      
      {items.filter(Boolean).length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {items.filter(Boolean).map((item: any, index: number) => (
            <MediaCard key={index} item={item} />
          ))}
        </div>
      ) : (
        <EmptyState mediaType={mediaType} />
      )}
    </section>
  );
}

export default async function Profile() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  await connectDB();
  
  // Get user data
  const user = await User.findById(session.user?.id);
  
  if (!user) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Profile</h1>
        <div className="bg-red-900 bg-opacity-20 border border-red-700 p-6 rounded-lg">
          <p className="text-red-400">User data not found. Please try signing in again.</p>
        </div>
      </div>
    );
  }

  // Filter watchlist into categories and media types
  const watchingAnime = user.watchlist.filter(item => item.status === "watching" && item.mediaType === "anime");
  const watchingMovies = user.watchlist.filter(item => item.status === "watching" && item.mediaType === "movie");
  
  const planToWatchAnime = user.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "anime");
  const planToWatchMovies = user.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "movie");
  
  const completedAnime = user.watchlist.filter(item => item.status === "completed" && item.mediaType === "anime");
  const completedMovies = user.watchlist.filter(item => item.status === "completed" && item.mediaType === "movie");
  
  // Fetch details for each category (limit to 5 items each)
  const watchingAnimeDetails = await Promise.all(
    watchingAnime.slice(0, 5).map(item => getAnimeDetails(item.externalId))
  );
  
  const watchingMovieDetails = await Promise.all(
    watchingMovies.slice(0, 5).map(item => getMovieDetails(item.externalId))
  );
  
  const planAnimeDetails = await Promise.all(
    planToWatchAnime.slice(0, 5).map(item => getAnimeDetails(item.externalId))
  );
  
  const planMovieDetails = await Promise.all(
    planToWatchMovies.slice(0, 5).map(item => getMovieDetails(item.externalId))
  );
  
  const completedAnimeDetails = await Promise.all(
    completedAnime.slice(0, 5).map(item => getAnimeDetails(item.externalId))
  );
  
  const completedMovieDetails = await Promise.all(
    completedMovies.slice(0, 5).map(item => getMovieDetails(item.externalId))
  );

  // Calculate totals for stats
  const totalAnime = watchingAnime.length + planToWatchAnime.length + completedAnime.length;
  const totalMovies = watchingMovies.length + planToWatchMovies.length + completedMovies.length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Profile Header */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative h-28 w-28 rounded-full overflow-hidden bg-gray-700 shadow-lg border-4 border-gray-700">
              {user.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt={user.displayName || "User"} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-4xl font-bold">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-grow">
              <h1 className="text-3xl font-bold text-white">{user.displayName || user.username || user.email.split('@')[0]}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="mt-3 space-x-3">
                <Link href="/profile/edit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white text-sm transition inline-block">
                  Edit Profile
                </Link>
                <Link href="/profile/settings" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white text-sm transition inline-block">
                  Settings
                </Link>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md hover:shadow-lg transition">
              <div className="text-3xl font-bold text-white">{watchingAnime.length + watchingMovies.length}</div>
              <div className="text-gray-400 text-sm">Currently Watching</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-indigo-400">{watchingAnime.length} Anime</span> • 
                <span className="text-rose-400">{watchingMovies.length} Movies</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md hover:shadow-lg transition">
              <div className="text-3xl font-bold text-white">{planToWatchAnime.length + planToWatchMovies.length}</div>
              <div className="text-gray-400 text-sm">Plan to Watch</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-indigo-400">{planToWatchAnime.length} Anime</span> • 
                <span className="text-rose-400">{planToWatchMovies.length} Movies</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md hover:shadow-lg transition">
              <div className="text-3xl font-bold text-white">{completedAnime.length + completedMovies.length}</div>
              <div className="text-gray-400 text-sm">Completed</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-indigo-400">{completedAnime.length} Anime</span> • 
                <span className="text-rose-400">{completedMovies.length} Movies</span>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md hover:shadow-lg transition">
              <div className="text-3xl font-bold text-white">{totalAnime + totalMovies}</div>
              <div className="text-gray-400 text-sm">Total</div>
              <div className="mt-2 flex gap-2 text-xs">
                <span className="text-indigo-400">{totalAnime} Anime</span> • 
                <span className="text-rose-400">{totalMovies} Movies</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="mb-8 border-b border-gray-700">
        <div className="flex overflow-x-auto space-x-8 pb-2">
          <button className="text-white font-semibold pb-2 border-b-2 border-indigo-500 whitespace-nowrap">All Content</button>
          <button className="text-gray-400 hover:text-gray-200 pb-2 whitespace-nowrap">Anime</button>
          <button className="text-gray-400 hover:text-gray-200 pb-2 whitespace-nowrap">Movies</button>
          <button className="text-gray-400 hover:text-gray-200 pb-2 whitespace-nowrap">Stats</button>
          <button className="text-gray-400 hover:text-gray-200 pb-2 whitespace-nowrap">Activity</button>
        </div>
      </div>
      
      {/* Currently Watching Sections */}
      <h2 className="text-3xl font-bold mb-6 text-white">Currently Watching</h2>
      
      {/* Watching Anime */}
      {watchingAnime.length > 0 && (
        <CategorySection 
          title="Anime" 
          items={watchingAnimeDetails} 
          viewAllLink="/profile/watching/anime"
          mediaType="anime"
        />
      )}
      
      {/* Watching Movies */}
      {watchingMovies.length > 0 && (
        <CategorySection 
          title="Movies" 
          items={watchingMovieDetails} 
          viewAllLink="/profile/watching/movies"
          mediaType="movie" 
        />
      )}
      
      {/* If both are empty */}
      {watchingAnime.length === 0 && watchingMovies.length === 0 && (
        <div className="mb-12">
          <EmptyState mediaType="both" />
        </div>
      )}
      
      {/* Plan to Watch Sections */}
      <h2 className="text-3xl font-bold mb-6 text-white mt-6">Plan to Watch</h2>
      
      {/* Plan to Watch Anime */}
      {planToWatchAnime.length > 0 && (
        <CategorySection 
          title="Anime" 
          items={planAnimeDetails} 
          viewAllLink="/profile/planning/anime"
          mediaType="anime"
        />
      )}
      
      {/* Plan to Watch Movies */}
      {planToWatchMovies.length > 0 && (
        <CategorySection 
          title="Movies" 
          items={planMovieDetails} 
          viewAllLink="/profile/planning/movies"
          mediaType="movie"
        />
      )}
      
      {/* If both are empty */}
      {planToWatchAnime.length === 0 && planToWatchMovies.length === 0 && (
        <div className="mb-12">
          <EmptyState mediaType="both" />
        </div>
      )}
      
      {/* Completed Sections */}
      <h2 className="text-3xl font-bold mb-6 text-white mt-6">Completed</h2>
      
      {/* Completed Anime */}
      {completedAnime.length > 0 && (
        <CategorySection 
          title="Anime" 
          items={completedAnimeDetails} 
          viewAllLink="/profile/completed/anime"
          mediaType="anime"
        />
      )}
      
      {/* Completed Movies */}
      {completedMovies.length > 0 && (
        <CategorySection 
          title="Movies" 
          items={completedMovieDetails} 
          viewAllLink="/profile/completed/movies"
          mediaType="movie"
        />
      )}
      
      {/* If both are empty */}
      {completedAnime.length === 0 && completedMovies.length === 0 && (
        <div className="mb-12">
          <EmptyState mediaType="both" />
        </div>
      )}
    </div>
  );
}