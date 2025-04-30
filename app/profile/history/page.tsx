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

// Pagination settings
const PAGE_SIZE = 20; // Items per page
const BATCH_SIZE = 2; // Process in batches for better performance

// Fetch user data with watchlist
async function getUserData(userId: string) {
  try {
    // Check DB connection first
    const dbStatus = await checkDbConnection();
    if (dbStatus.status !== 'connected') {
      throw new Error(`Database connection issue: ${dbStatus.message || 'Unknown error'}`);
    }
    
    await connectDB();
    
    // Only select the necessary fields to reduce data load
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

// Item details fetcher
async function fetchItemDetails(item: any) {
  return getOrSetCache(
    item.externalId,
    item.mediaType,
    async () => {
      try {
        // Add a tiny delay between fetches
        await new Promise(resolve => setTimeout(resolve, 50));
        
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
            lastModified: item.updatedAt || item.addedAt,
            genres: (animeDetails.data.genres?.map((g: any) => g.name) || []).slice(0, 3),
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
            lastModified: item.updatedAt || item.addedAt,
            genres: (movieDetails.genres?.map((g: any) => g.name) || []).slice(0, 3),
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
            lastModified: item.updatedAt || item.addedAt,
            genres: (tvDetails.genres?.map((g: any) => g.name) || []).slice(0, 3),
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

// Process history items with pagination
async function processWatchHistory(watchlist: any[], page: number = 1, pageSize: number = PAGE_SIZE) {
  // Include all items that have been updated or have activity
  const historyItems = watchlist.filter(item => item.updatedAt);
  
  // Sort by most recent activity first
  historyItems.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.addedAt).getTime();
    const dateB = new Date(b.updatedAt || b.addedAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
  
  // Calculate pagination parameters
  const totalItems = historyItems.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get the items for the current page
  const paginatedItems = historyItems.slice(startIndex, endIndex);
  
  // Process in batches for better performance
  return {
    items: await processBatch(paginatedItems, fetchItemDetails, BATCH_SIZE),
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / pageSize)
  };
}

export default async function WatchHistoryPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/history");
  }
  
  // Get the page from the search parameters, default to 1
  const pageParam = searchParams.page;
  const page = typeof pageParam === 'string' ? parseInt(pageParam, 10) || 1 : 1;
  
  let userData;
  let error = null;
  let historyData = {
    items: [],
    totalItems: 0,
    currentPage: page,
    totalPages: 1
  };
  
  try {
    // Wrap the entire data fetching in a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out after 15 seconds')), 15000)
    );

    const fetchDataPromise = async () => {
      // Get user data
      userData = await getUserData(session.user.id);
      
      if (!userData) {
        notFound();
      }
      
      // Process the watchlist with pagination for history view
      historyData = await processWatchHistory(userData.watchlist || [], page);
      
      return { userData, historyData };
    };

    // Race between timeout and data fetching
    await Promise.race([
      fetchDataPromise(),
      timeoutPromise,
    ]);
    
  } catch (err) {
    console.error("Error in WatchHistoryPage:", err);
    error = err.message || "An error occurred while loading your watch history.";
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
              items={historyData.items} 
              categoryName="Watch History" 
              colorTheme="from-amber-600 to-orange-600"
              categoryIcon="history"
              userId={session.user.id}
              totalCount={historyData.totalItems}
              currentPage={historyData.currentPage}
              totalPages={historyData.totalPages}
              isPaginated={true}
              isHistory={true}
              displayLoadMoreLink={true}
              fullLoadUrl="/profile/history/all"
            />
          )}
        </div>
      </div>
    </ConnectionErrorBoundary>
  );
}
