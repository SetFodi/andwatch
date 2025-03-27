// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB, { checkDbConnection } from "../../lib/db";
import { User } from "../../lib/models/User";
import CategorySectionClient from "./CategorySectionClient";
import ProfileHeader from "./ProfileHeader";
import ConnectionErrorBoundary from "../../components/ConnectionErrorBoundary";
import { animeApi, tmdbApi } from "../../lib/services/api";
import { processBatch, getOrSetCache } from "../../lib/utils/mediaCache";

// Set revalidation period for the page
export const revalidate = 3600; // 1 hour

// Helper function with error handling for API requests
async function fetchWithRetry(fetchFn) {
  const MAX_RETRIES = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      lastError = error;
      
      // Only wait if we're going to retry
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
}

// Helper functions with userRating and status
async function getAnimeDetails(externalId: string, userWatchItem?: any) {
  return getOrSetCache(
    externalId,
    "anime",
    async () => {
      try {
        const data = await fetchWithRetry(() => animeApi.getAnimeById(externalId));
        if (!data || !data.data) return null;
        return {
          id: data.data.mal_id,
          title: data.data.title,
          image: data.data.images?.jpg?.image_url || null,
          score: data.data.score || null,
          type: "anime",
          year: data.data.year || (data.data.aired?.from ? new Date(data.data.aired.from).getFullYear() : null),
          url: `/anime/${data.data.mal_id}`,
          userRating: userWatchItem?.userRating || null,
          status: userWatchItem?.status || null,
          progress: userWatchItem?.progress || 0,
          totalEpisodes: data.data.episodes || 0,
          episodes: data.data.episodes || 0,
          genres: data.data.genres?.map((g: any) => g.name) || [],
          addedAt: userWatchItem?.addedAt,
          updatedAt: userWatchItem?.updatedAt,
          completedAt: userWatchItem?.completedAt,
        };
      } catch (error) {
        console.error(`Error fetching anime ${externalId}:`, error);
        return null;
      }
    }
  );
}

async function getMovieDetails(externalId: string, userWatchItem?: any) {
  return getOrSetCache(
    externalId,
    "movie",
    async () => {
      try {
        const data = await fetchWithRetry(() => tmdbApi.getMovieById(externalId));
        if (!data || !data.id) return null;
        return {
          id: data.id,
          title: data.title,
          image: data.poster_path ? tmdbApi.getImageUrl(data.poster_path) : null,
          score: data.vote_average || null,
          type: "movie",
          year: data.release_date ? new Date(data.release_date).getFullYear() : null,
          url: `/movies/${data.id}`,
          userRating: userWatchItem?.userRating || null,
          status: userWatchItem?.status || null,
          runtime: data.runtime || null,
          genres: data.genres?.map((g: any) => g.name) || [],
          addedAt: userWatchItem?.addedAt,
          updatedAt: userWatchItem?.updatedAt,
          completedAt: userWatchItem?.completedAt,
        };
      } catch (error) {
        console.error(`Error fetching movie ${externalId}:`, error);
        return null;
      }
    }
  );
}

async function getTVShowDetails(externalId: string, userWatchItem?: any) {
  return getOrSetCache(
    externalId,
    "tv",
    async () => {
      try {
        const data = await fetchWithRetry(() => tmdbApi.getTVShowById(externalId));
        if (!data || !data.id) return null;
        return {
          id: data.id,
          title: data.name,
          image: data.poster_path ? tmdbApi.getImageUrl(data.poster_path) : null,
          score: data.vote_average || null,
          type: "tv",
          year: data.first_air_date ? new Date(data.first_air_date).getFullYear() : null,
          url: `/tvshows/${data.id}`,
          userRating: userWatchItem?.userRating || null,
          status: userWatchItem?.status || null,
          episodes: data.number_of_episodes || null,
          progress: userWatchItem?.progress || 0,
          totalEpisodes: data.number_of_episodes || 0,
          genres: data.genres?.map((g: any) => g.name) || [],
          addedAt: userWatchItem?.addedAt,
          updatedAt: userWatchItem?.updatedAt,
          completedAt: userWatchItem?.completedAt,
        };
      } catch (error) {
        console.error(`Error fetching TV show ${externalId}:`, error);
        return null;
      }
    }
  );
}

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  let userDoc;
  let error = null;
  let dbStatus = null;

  try {
    // Check database connection first
    dbStatus = await checkDbConnection();
    if (dbStatus.status !== 'connected') {
      throw new Error(`Database connection issue: ${dbStatus.message || 'Unknown error'}`);
    }
    
    await connectDB();
    userDoc = await User.findById(session.user?.id).lean();
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    error = "We're having trouble connecting to our database. Please try again in a moment.";
  }

  if (error) {
    return (
      <ConnectionErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black p-8">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-red-900/20 via-red-800/20 to-red-950/30 border border-red-700/30 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-4 text-red-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">{error}</p>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-800/50 hover:bg-red-700/50 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ConnectionErrorBoundary>
    );
  }

  if (!userDoc) {
    return (
      <ConnectionErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black p-8">
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-red-900/20 via-red-800/20 to-red-950/30 border border-red-700/30 p-8 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center space-x-4 text-red-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">User data not found. Please try signing in again.</p>
            </div>
          </div>
        </div>
      </ConnectionErrorBoundary>
    );
  }

  const user = {
    avatar: userDoc.avatar || undefined,
    displayName: userDoc.displayName || undefined,
    username: userDoc.username || undefined,
    email: userDoc.email,
  };

  // Make sure watchlist exists to prevent errors
  const watchlist = userDoc.watchlist || [];

  // Get a limited subset for initial rendering (up to 10 items per category)
  const limitPerCategory = 10;
  
  // Filter items by status and media type - limit to the first 10 for performance
  const watchingAnime = watchlist.filter(item => item.status === "watching" && item.mediaType === "anime").slice(0, limitPerCategory);
  const watchingMovies = watchlist.filter(item => item.status === "watching" && item.mediaType === "movie").slice(0, limitPerCategory);
  const watchingTVShows = watchlist.filter(item => item.status === "watching" && item.mediaType === "tv").slice(0, limitPerCategory);
  
  const planToWatchAnime = watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "anime").slice(0, limitPerCategory);
  const planToWatchMovies = watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "movie").slice(0, limitPerCategory);
  const planToWatchTVShows = watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "tv").slice(0, limitPerCategory);
  
  const completedAnime = watchlist.filter(item => item.status === "completed" && item.mediaType === "anime").slice(0, limitPerCategory);
  const completedMovies = watchlist.filter(item => item.status === "completed" && item.mediaType === "movie").slice(0, limitPerCategory);
  const completedTVShows = watchlist.filter(item => item.status === "completed" && item.mediaType === "tv").slice(0, limitPerCategory);
  
  // Filter for rating-only items (no status) - limited for performance
  const ratingOnlyItems = watchlist
    .filter(item => !item.status && item.userRating)
    .slice(0, limitPerCategory);

  // Use a very small batch size (2) to reduce database load
  const batchSize = 2;

  // Fetch details for items in each category
  const [
    watchingAnimeDetails,
    planAnimeDetails,
    completedAnimeDetails,
    watchingMovieDetails,
    planMovieDetails,
    completedMovieDetails,
    watchingTVShowDetails,
    planTVShowDetails,
    completedTVShowDetails,
    ratingOnlyItemsDetails
  ] = await Promise.all([
    // Process anime items
    processBatch(watchingAnime, item => getAnimeDetails(item.externalId, item), batchSize),
    processBatch(planToWatchAnime, item => getAnimeDetails(item.externalId, item), batchSize),
    processBatch(completedAnime, item => getAnimeDetails(item.externalId, item), batchSize),
    
    // Process movie items
    processBatch(watchingMovies, item => getMovieDetails(item.externalId, item), batchSize),
    processBatch(planToWatchMovies, item => getMovieDetails(item.externalId, item), batchSize),
    processBatch(completedMovies, item => getMovieDetails(item.externalId, item), batchSize),
    
    // Process TV show items
    processBatch(watchingTVShows, item => getTVShowDetails(item.externalId, item), batchSize),
    processBatch(planToWatchTVShows, item => getTVShowDetails(item.externalId, item), batchSize),
    processBatch(completedTVShows, item => getTVShowDetails(item.externalId, item), batchSize),
    
    // Process rating-only items
    processBatch(
      ratingOnlyItems,
      async (item) => {
        if (item.mediaType === "anime") {
          return getAnimeDetails(item.externalId, item);
        } else if (item.mediaType === "movie") {
          return getMovieDetails(item.externalId, item);
        } else if (item.mediaType === "tv") {
          return getTVShowDetails(item.externalId, item);
        }
        return null;
      },
      batchSize
    )
  ]);
  
  // Combine items by category for displaying
  const watchingItems = [
    ...watchingAnimeDetails, 
    ...watchingMovieDetails, 
    ...watchingTVShowDetails
  ].filter(Boolean); // Remove any null items
  
  const planningItems = [
    ...planAnimeDetails, 
    ...planMovieDetails, 
    ...planTVShowDetails,
    ...ratingOnlyItemsDetails // Add rating-only items to planning since they don't have a status
  ].filter(Boolean);
  
  const completedItems = [
    ...completedAnimeDetails, 
    ...completedMovieDetails, 
    ...completedTVShowDetails
  ].filter(Boolean);

  // Get total counts from the actual data (not just what we've loaded)
  const totalWatching = watchlist.filter(item => item.status === "watching").length;
  const totalPlanning = watchlist.filter(item => item.status === "plan_to_watch").length + 
    watchlist.filter(item => !item.status && item.userRating).length;
  const totalCompleted = watchlist.filter(item => item.status === "completed").length;

  return (
    <ConnectionErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 md:p-8 lg:p-12 text-white">
        <div className="max-w-7xl mx-auto">
          <ProfileHeader
            user={user}
            totalWatching={totalWatching}
            totalPlanning={totalPlanning}
            totalCompleted={totalCompleted}
          />
          <main className="mt-10">
            <CategorySectionClient
              watching={watchingItems}
              planning={planningItems}
              completed={completedItems}
              totalWatching={totalWatching}
              totalPlanning={totalPlanning}
              totalCompleted={totalCompleted}
            />
          </main>
        </div>
      </div>
    </ConnectionErrorBoundary>
  );
}