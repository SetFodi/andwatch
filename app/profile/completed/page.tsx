// app/profile/completed/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import connectDB, { checkDbConnection } from "../../../lib/db";
import { User } from "../../../lib/models/User";
import { animeApi, tmdbApi } from "../../../lib/services/api";
import ProfileCategoryClient from "../../../components/ProfileCategoryClient";
import { processBatch, getOrSetCache } from "../../../lib/utils/mediaCache";
import ConnectionErrorBoundary from "../../../components/ConnectionErrorBoundary";

// Set revalidation period for the page
export const revalidate = 3600; // 1 hour

// Fetch userData with watchlist using error handling
async function getUserData(userId: string) {
  try {
    // Check DB connection first
    const dbStatus = await checkDbConnection();
    if (dbStatus.status !== 'connected') {
      throw new Error(`Database connection issue: ${dbStatus.message || 'Unknown error'}`);
    }
    
    await connectDB();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

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

// Helper to fetch a single item's details with retry logic
async function fetchItemDetails(item: any) {
  return getOrSetCache(
    item.externalId,
    item.mediaType,
    async () => {
      try {
        if (item.mediaType === "anime") {
          const animeDetails = await fetchWithRetry(() => animeApi.getAnimeById(item.externalId));
          if (!animeDetails?.data) return null;
          
          return {
            id: item.externalId,
            title: animeDetails.data.title,
            image: animeDetails.data.images?.jpg?.image_url || null,
            score: animeDetails.data.score,
            type: "anime" as const,
            year: animeDetails.data.year || (animeDetails.data.aired?.from ? new Date(animeDetails.data.aired.from).getFullYear() : null),
            url: `/anime/${item.externalId}`,
            userRating: item.userRating,
            status: item.status,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt || item.addedAt,
            completedAt: item.completedAt || item.updatedAt || item.addedAt,
            episodes: animeDetails.data.episodes,
            genres: animeDetails.data.genres?.map((g: any) => g.name) || [],
          };
        } else if (item.mediaType === "movie") {
          const movieDetails = await fetchWithRetry(() => tmdbApi.getMovieById(item.externalId));
          if (!movieDetails) return null;
          
          return {
            id: item.externalId,
            title: movieDetails.title,
            image: movieDetails.poster_path ? tmdbApi.getImageUrl(movieDetails.poster_path) : null,
            score: movieDetails.vote_average,
            type: "movie" as const,
            year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : null,
            url: `/movies/${item.externalId}`,
            userRating: item.userRating,
            status: item.status,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt || item.addedAt,
            completedAt: item.completedAt || item.updatedAt || item.addedAt,
            genres: movieDetails.genres?.map((g: any) => g.name) || [],
            runtime: movieDetails.runtime || null,
          };
        } else if (item.mediaType === "tv") {
          const tvDetails = await fetchWithRetry(() => tmdbApi.getTVShowById(item.externalId));
          if (!tvDetails) return null;
          
          return {
            id: item.externalId,
            title: tvDetails.name,
            image: tvDetails.poster_path ? tmdbApi.getImageUrl(tvDetails.poster_path) : null,
            score: tvDetails.vote_average,
            type: "tv" as const,
            year: tvDetails.first_air_date ? new Date(tvDetails.first_air_date).getFullYear() : null,
            url: `/tvshows/${item.externalId}`,
            userRating: item.userRating,
            status: item.status,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt || item.addedAt,
            completedAt: item.completedAt || item.updatedAt || item.addedAt,
            genres: tvDetails.genres?.map((g: any) => g.name) || [],
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching ${item.mediaType} ${item.externalId}:`, error);
        return null;
      }
    }
  );
}

// Process watchlist items to include details from external APIs
async function processWatchlist(watchlist: any[], limit = 50) {
  // Filter for completed status
  const completedItems = watchlist.filter(item => item.status === "completed");
  
  // Limit items to prevent overloading
  const limitedItems = completedItems.slice(0, limit);
  
  // Process in smaller batches for better reliability
  return processBatch(limitedItems, fetchItemDetails, 2);
}

export default async function CompletedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/completed");
  }
  
  let userData;
  let error = null;
  let completedItems = [];
  let totalItems = 0;
  
  try {
    userData = await getUserData(session.user.id);
    
    if (!userData) {
      notFound();
    }
    
    // Calculate total before limiting
    totalItems = (userData.watchlist || []).filter(item => item.status === "completed").length;
    
    // Process a limited set of items for the initial load
    completedItems = await processWatchlist(userData.watchlist || []);
    
  } catch (err) {
    console.error("Error in CompletedPage:", err);
    error = err.message || "An error occurred while loading your completed list.";
  }
  
  return (
    <ConnectionErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Data</h2>
              <p className="text-white mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-red-600/30 hover:bg-red-600/50 text-white rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <ProfileCategoryClient 
              items={completedItems} 
              categoryName="Completed" 
              colorTheme="from-emerald-600 to-teal-600"
              categoryIcon="check"
              userId={session.user.id}
              totalCount={totalItems}
            />
          )}
        </div>
      </div>
    </ConnectionErrorBoundary>
  );
}