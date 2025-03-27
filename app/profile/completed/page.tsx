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

// Set a very conservative limit for initial load
const INITIAL_LOAD_LIMIT = 15; // Reduced from 50
const BATCH_SIZE = 1; // Reduced to the absolute minimum
const FULL_LOAD_PARAM = "fullLoad"; // URL parameter to indicate full load request

// Fetch userData with watchlist using error handling - with extra precautions
async function getUserData(userId: string) {
  try {
    // Check DB connection first
    const dbStatus = await checkDbConnection();
    if (dbStatus.status !== 'connected') {
      console.error("MongoDB connection check failed before user data fetch");
      throw new Error(`Database connection issue: ${dbStatus.message || 'Unknown error'}`);
    }
    
    // Add a small delay to ensure connection is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Connect with timeout
    const connectPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    // Use lean() and only select the necessary fields to reduce data load
    const user = await User.findById(userId)
      .select('watchlist.externalId watchlist.mediaType watchlist.status watchlist.userRating watchlist.addedAt watchlist.updatedAt watchlist.completedAt watchlist.progress')
      .lean();
    
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

// Simplified item details fetcher that gets only essential fields
async function fetchItemDetails(item: any) {
  return getOrSetCache(
    item.externalId,
    item.mediaType,
    async () => {
      try {
        // For improved reliability, add a tiny delay between fetches
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (item.mediaType === "anime") {
          const animeDetails = await fetchWithRetry(() => animeApi.getAnimeById(item.externalId));
          if (!animeDetails?.data) return null;
          
          // Return minimal data structure
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
            genres: (animeDetails.data.genres?.map((g: any) => g.name) || []).slice(0, 3), // Limit genres
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
            genres: (movieDetails.genres?.map((g: any) => g.name) || []).slice(0, 3), // Limit genres
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
            genres: (tvDetails.genres?.map((g: any) => g.name) || []).slice(0, 3), // Limit genres
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

// Process watchlist items to include details from external APIs - super conservative approach
async function processWatchlist(watchlist: any[], limit: number | null = INITIAL_LOAD_LIMIT) {
  // Filter for completed status
  const completedItems = watchlist.filter(item => item.status === "completed");
  
  // Limit items to prevent overloading - use a very small number initially unless fullLoad is true
  const limitedItems = limit ? completedItems.slice(0, limit) : completedItems;
  
  // Process with minimal batch size to reduce strain
  return processBatch(limitedItems, fetchItemDetails, BATCH_SIZE);
}

export default async function CompletedPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/completed");
  }
  
  // Check if this is a full load request
  const isFullLoad = searchParams[FULL_LOAD_PARAM] === "true";
  
  let userData;
  let error = null;
  let completedItems = [];
  let totalItems = 0;
  
  try {
    // Wrap the entire data fetching in a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out after 20 seconds')), 20000)
    );

    const fetchDataPromise = async () => {
      // Get user data
      userData = await getUserData(session.user.id);
      
      if (!userData) {
        notFound();
      }
      
      // Calculate total count
      totalItems = (userData.watchlist || []).filter(item => item.status === "completed").length;
      
      // Process only a subset initially, or all items if fullLoad is true
      completedItems = await processWatchlist(userData.watchlist || [], isFullLoad ? null : INITIAL_LOAD_LIMIT);
      
      return { userData, completedItems, totalItems };
    };

    // Race between timeout and data fetching
    const { completedItems: items, totalItems: total } = await Promise.race([
      fetchDataPromise(),
      timeoutPromise,
    ]);
    
    completedItems = items;
    totalItems = total;
    
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
              displayLoadMoreLink={!isFullLoad && completedItems.length < totalItems}
              fullLoadUrl={`/profile/completed?${FULL_LOAD_PARAM}=true`}
              isFullLoad={isFullLoad}
            />
          )}
        </div>
      </div>
    </ConnectionErrorBoundary>
  );
}