// app/profile/completed/all/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import connectDB, { checkDbConnection } from "../../../../lib/db";
import { User } from "../../../../lib/models/User";
import { animeApi, tmdbApi } from "../../../../lib/services/api";
import ProfileCategoryClient from "../../../../components/ProfileCategoryClient";
import { processBatch, getOrSetCache } from "../../../../lib/utils/mediaCache";
import ConnectionErrorBoundary from "../../../../components/ConnectionErrorBoundary";

// Set longer revalidation period for this full view
export const revalidate = 7200; // 2 hours

// Increase the timeout limit for this route since it's loading all items
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// Optimized batch sizes for full loading
const BATCH_SIZE = 5; // Process in smaller batches to avoid timeouts
const MAX_CONCURRENT_BATCHES = 5; // Process multiple batches concurrently

// Fetch userData with watchlist - optimized version for loading all items
async function getUserData(userId: string) {
  try {
    // Check DB connection first with longer timeout
    const dbStatus = await Promise.race([
      checkDbConnection(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection check timeout')), 5000))
    ]);
    
    if (dbStatus.status !== 'connected') {
      throw new Error(`Database connection issue: ${dbStatus.message || 'Unknown error'}`);
    }
    
    // Connect with longer timeout for this heavy operation
    await Promise.race([
      connectDB(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 8000))
    ]);
    
    // Only retrieve necessary fields to reduce data size
    const user = await User.findById(userId)
      .select('watchlist.externalId watchlist.mediaType watchlist.status watchlist.userRating watchlist.addedAt watchlist.updatedAt watchlist.completedAt')
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

// Helper function with error handling and exponential backoff for API requests
async function fetchWithRetry(fetchFn) {
  const MAX_RETRIES = 3;
  let lastError;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      lastError = error;
      
      // Only wait if we're going to retry, with exponential backoff
      if (attempt < MAX_RETRIES) {
        const backoffTime = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  // If we get here, all retries failed
  return null; // Return null instead of throwing to allow partial results
}

// Optimized item details fetcher with minimal fields for better performance
async function fetchItemDetails(item: any) {
  return getOrSetCache(
    item.externalId,
    item.mediaType,
    async () => {
      try {
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
            genres: (animeDetails.data.genres?.map((g: any) => g.name) || []).slice(0, 5), // Limit genres
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
            genres: (movieDetails.genres?.map((g: any) => g.name) || []).slice(0, 5), // Limit genres
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
            genres: (tvDetails.genres?.map((g: any) => g.name) || []).slice(0, 5), // Limit genres
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching ${item.mediaType} ${item.externalId}:`, error);
        return null; // Return null instead of throwing to allow partial results
      }
    }
  );
}

// Improved process method to handle all items with better performance
async function processAllCompletedItems(watchlist: any[]) {
  // Filter for completed status
  const completedItems = watchlist.filter(item => item.status === "completed");
  
  // Calculate total
  const totalItems = completedItems.length;
  
  // Create smaller batches that we can process in parallel
  const batches: any[][] = [];
  for (let i = 0; i < completedItems.length; i += BATCH_SIZE) {
    batches.push(completedItems.slice(i, i + BATCH_SIZE));
  }
  
  // Process batches of batches in parallel for better performance
  const processedItems = [];
  for (let i = 0; i < batches.length; i += MAX_CONCURRENT_BATCHES) {
    const currentBatches = batches.slice(i, i + MAX_CONCURRENT_BATCHES);
    
    // Process these batches in parallel
    const batchResults = await Promise.all(
      currentBatches.map(batch => processBatch(batch, fetchItemDetails, 1))
    );
    
    // Combine results from all batches
    for (const result of batchResults) {
      processedItems.push(...result);
    }
    
    // Short delay between batch processing to avoid rate limits
    if (i + MAX_CONCURRENT_BATCHES < batches.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Filter out null items (failed fetches)
  return processedItems.filter(item => item !== null);
}

export default async function CompletedAllPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/completed/all");
  }
  
  let userData;
  let error = null;
  let completedItems = [];
  let totalItems = 0;
  
  try {
    // Set a global timeout for the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
    
    const fetchDataPromise = async () => {
      // Get user data
      userData = await getUserData(session.user.id);
      
      if (!userData) {
        notFound();
      }
      
      // Count total items
      totalItems = (userData.watchlist || []).filter(item => item.status === "completed").length;
      
      // Process all items
      completedItems = await processAllCompletedItems(userData.watchlist || []);
      
      return { completedItems, totalItems };
    };
    
    // Race between timeout and data fetching
    await Promise.race([fetchDataPromise(), timeoutPromise]);
    
  } catch (err) {
    console.error("Error in CompletedAllPage:", err);
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
              isFullLoad={true}
            />
          )}
        </div>
      </div>
    </ConnectionErrorBoundary>
  );
}