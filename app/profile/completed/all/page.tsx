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

// Pagination configuration
const ITEMS_PER_PAGE = 20; // Match this to your grid (5 columns x 4 rows)

// Optimized fetch with single-function retry logic
async function fetchWithRetry(fetchFn) {
  const MAX_RETRIES = 2;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(`Fetch attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      } else {
        return null; // Return null on final failure instead of throwing
      }
    }
  }
}

// More efficient user data fetching
async function getUserData(userId: string) {
  try {
    await connectDB();
    
    // Only retrieve necessary fields
    const user = await User.findById(userId)
      .select('watchlist.externalId watchlist.mediaType watchlist.status watchlist.userRating watchlist.addedAt watchlist.updatedAt watchlist.completedAt watchlist.progress')
      .lean();
    
    if (!user) return null;
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Simplified item details fetcher that returns placeholder on failure
async function fetchItemDetails(item: any) {
  return getOrSetCache(
    item.externalId,
    item.mediaType,
    async () => {
      try {
        if (item.mediaType === "anime") {
          const animeDetails = await fetchWithRetry(() => animeApi.getAnimeById(item.externalId));
          if (!animeDetails?.data) return createPlaceholder(item);
          
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
            genres: (animeDetails.data.genres?.map((g: any) => g.name) || []).slice(0, 5), 
          };
        } else if (item.mediaType === "movie") {
          const movieDetails = await fetchWithRetry(() => tmdbApi.getMovieById(item.externalId));
          if (!movieDetails) return createPlaceholder(item);
          
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
            genres: (movieDetails.genres?.map((g: any) => g.name) || []).slice(0, 5),
          };
        } else if (item.mediaType === "tv") {
          const tvDetails = await fetchWithRetry(() => tmdbApi.getTVShowById(item.externalId));
          if (!tvDetails) return createPlaceholder(item);
          
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
            genres: (tvDetails.genres?.map((g: any) => g.name) || []).slice(0, 5),
          };
        }
        return createPlaceholder(item);
      } catch (error) {
        console.error(`Error fetching ${item.mediaType} ${item.externalId}:`, error);
        return createPlaceholder(item);
      }
    }
  );
}

// Create placeholder to maintain grid layout
function createPlaceholder(item: any) {
  return {
    id: item.externalId,
    title: item.mediaType === "anime" ? "Anime" : item.mediaType === "movie" ? "Movie" : "TV Show",
    image: null,
    score: null,
    type: item.mediaType as "anime" | "movie" | "tv",
    year: null,
    url: `/${item.mediaType === "tv" ? "tvshows" : item.mediaType + "s"}/${item.externalId}`,
    userRating: item.userRating,
    status: item.status,
    isPlaceholder: true, // Flag for UI to show placeholder styling
  };
}

// Process items with pagination in mind
async function processCompletedItems(watchlist: any[], page = 1) {
  // Filter for completed status
  const completedItems = watchlist.filter(item => item.status === "completed");
  
  // Sort by completed date if available (most recent first)
  completedItems.sort((a, b) => {
    const dateA = a.completedAt || a.updatedAt || a.addedAt || new Date(0);
    const dateB = b.completedAt || b.updatedAt || b.addedAt || new Date(0);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  // Calculate pagination
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = completedItems.slice(startIndex, endIndex);
  
  // Process all items in this page
  const processedItems = await processBatch(paginatedItems, fetchItemDetails, 5);
  
  return {
    items: processedItems,
    totalItems: completedItems.length,
    totalPages: Math.ceil(completedItems.length / ITEMS_PER_PAGE),
    currentPage: page
  };
}

export default async function CompletedAllPage({ 
  searchParams = {} 
}: { 
  searchParams?: { page?: string } 
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/completed/all");
  }
  
  // Fix page param handling with proper defaults and type checking
  const pageParam = searchParams?.page || '1';
  const page = !isNaN(parseInt(pageParam)) ? parseInt(pageParam) : 1;
  
  let userData;
  let completedData = { items: [], totalItems: 0, totalPages: 1, currentPage: page };
  let error = null;
  
  try {
    // Get user data
    userData = await getUserData(session.user.id);
    
    if (!userData) {
      notFound();
    }
    
    // Process items with pagination
    completedData = await processCompletedItems(userData.watchlist || [], page);
    
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
              items={completedData.items || []} 
              categoryName="Completed" 
              colorTheme="from-emerald-600 to-teal-600"
              categoryIcon="check"
              userId={session.user.id}
              totalCount={completedData.totalItems}
              isFullLoad={true}
              currentPage={completedData.currentPage}
              totalPages={completedData.totalPages}
              isPaginated={true}
            />
          )}
        </div>
      </div>
    </ConnectionErrorBoundary>
  );
}