import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import { animeApi, tmdbApi } from "../../../lib/services/api";
import ProfileCategoryClient from "../../../components/ProfileCategoryClient";
import { processBatch, getOrSetCache } from "../../../lib/utils/mediaCache";

// Set revalidation period for the page
export const revalidate = 3600; // 1 hour

// Fetch userData with watchlist
async function getUserData(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// Helper to fetch a single item's details
async function fetchItemDetails(item: any) {
  return getOrSetCache(
    item.externalId,
    item.mediaType,
    async () => {
      try {
        if (item.mediaType === "anime") {
          const animeDetails = await animeApi.getAnimeById(item.externalId);
          if (!animeDetails?.data) return null;
          
          return {
            id: item.externalId,
            title: animeDetails.data.title,
            image: animeDetails.data.images?.jpg?.image_url || null,
            score: animeDetails.data.score,
            type: "anime" as const,
            year: animeDetails.data.year,
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
          const movieDetails = await tmdbApi.getMovieById(item.externalId);
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
          const tvDetails = await tmdbApi.getTVShowById(item.externalId);
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
async function processWatchlist(watchlist: any[]) {
  // Filter for completed status
  const completedItems = watchlist.filter(item => item.status === "completed");
  
  // Process in batches
  return processBatch(completedItems, fetchItemDetails, 5);
}

export default async function CompletedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/completed");
  }
  
  const userData = await getUserData(session.user.id);
  
  if (!userData) {
    notFound();
  }
  
  const completedItems = await processWatchlist(userData.watchlist || []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProfileCategoryClient 
          items={completedItems} 
          categoryName="Completed" 
          colorTheme="from-emerald-600 to-teal-600"
          categoryIcon="check"
          userId={session.user.id}
        />
      </div>
    </div>
  );
}
