// app/profile/watching/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import { animeApi, movieApi } from "../../../lib/services/api";
import ProfileCategoryClient from "../../../components/ProfileCategoryClient";

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

// Process watchlist items to include details from external APIs
async function processWatchlist(watchlist: any[]) {
  // Filter for watching status
  const watchingItems = watchlist.filter(item => item.status === "watching");
  
  // Create an array to store promises for fetching details
  const detailPromises = watchingItems.map(async (item) => {
    try {
      // Different APIs for anime and movies
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
          updatedAt: item.updatedAt,
          episodes: animeDetails.data.episodes,
          progress: item.progress || 0,
          totalEpisodes: animeDetails.data.episodes || 0,
          genres: animeDetails.data.genres?.map((g: any) => g.name) || [],
        };
      } else {
        const movieDetails = await movieApi.getMovieById(item.externalId);
        if (!movieDetails) return null;
        
        return {
          id: item.externalId,
          title: movieDetails.title,
          image: movieDetails.poster_path ? movieApi.getImageUrl(movieDetails.poster_path) : null,
          score: movieDetails.vote_average,
          type: "movie" as const,
          year: movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : null,
          url: `/movies/${item.externalId}`,
          userRating: item.userRating,
          status: item.status,
          addedAt: item.addedAt,
          updatedAt: item.updatedAt,
          genres: movieDetails.genres?.map((g: any) => g.name) || [],
        };
      }
    } catch (error) {
      console.error(`Error fetching details for ${item.mediaType} ${item.externalId}:`, error);
      return null;
    }
  });
  
  // Resolve all promises and filter out nulls
  const processedItems = (await Promise.all(detailPromises)).filter(Boolean);
  
  return processedItems;
}

export default async function WatchingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/profile/watching");
  }
  
  const userData = await getUserData(session.user.id);
  
  if (!userData) {
    notFound();
  }
  
  const watchingItems = await processWatchlist(userData.watchlist || []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProfileCategoryClient 
          items={watchingItems} 
          categoryName="Watching" 
          colorTheme="from-blue-600 to-indigo-600"
          categoryIcon="play"
          userId={session.user.id}
        />
      </div>
    </div>
  );
}