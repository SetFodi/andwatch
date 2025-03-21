// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "../../lib/db";
import { User } from "../../lib/models/User";
import CategorySectionClient from "./CategorySectionClient";
import ProfileHeader from "./ProfileHeader";
import { animeApi, tmdbApi } from "../../lib/services/api";
import { processBatch, getOrSetCache } from "../../lib/utils/mediaCache";

// Set revalidation period for the page
export const revalidate = 3600; // 1 hour

// Helper functions with userRating and status
async function getAnimeDetails(externalId: string, userWatchItem?: any) {
  return getOrSetCache(
    externalId,
    "anime",
    async () => {
      try {
        const data = await animeApi.getAnimeById(externalId);
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
        const data = await tmdbApi.getMovieById(externalId);
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
        const data = await tmdbApi.getTVShowById(externalId);
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

  await connectDB();

  const userDoc = await User.findById(session.user?.id);

  if (!userDoc) {
    return (
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
    );
  }

  const user = {
    avatar: userDoc.avatar || undefined,
    displayName: userDoc.displayName || undefined,
    username: userDoc.username || undefined,
    email: userDoc.email,
  };

  // Filter items by status and media type
  const watchingAnime = userDoc.watchlist.filter(item => item.status === "watching" && item.mediaType === "anime");
  const watchingMovies = userDoc.watchlist.filter(item => item.status === "watching" && item.mediaType === "movie");
  const watchingTVShows = userDoc.watchlist.filter(item => item.status === "watching" && item.mediaType === "tv");
  
  const planToWatchAnime = userDoc.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "anime");
  const planToWatchMovies = userDoc.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "movie");
  const planToWatchTVShows = userDoc.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "tv");
  
  const completedAnime = userDoc.watchlist.filter(item => item.status === "completed" && item.mediaType === "anime");
  const completedMovies = userDoc.watchlist.filter(item => item.status === "completed" && item.mediaType === "movie");
  const completedTVShows = userDoc.watchlist.filter(item => item.status === "completed" && item.mediaType === "tv");
  
  // Filter for rating-only items (no status)
  const ratingOnlyItems = userDoc.watchlist.filter(item => 
    !item.status && item.userRating 
  );

  // Fetch details for anime items using batching
  const watchingAnimeDetails = await processBatch(
    watchingAnime,
    item => getAnimeDetails(item.externalId, item),
    5
  );
  
  const planAnimeDetails = await processBatch(
    planToWatchAnime,
    item => getAnimeDetails(item.externalId, item),
    5
  );
  
  const completedAnimeDetails = await processBatch(
    completedAnime,
    item => getAnimeDetails(item.externalId, item),
    5
  );
  
  const ratingOnlyAnimeDetails = await processBatch(
    ratingOnlyItems.filter(item => item.mediaType === "anime"),
    item => getAnimeDetails(item.externalId, item),
    5
  );
  
  // Fetch details for movie items
  const watchingMovieDetails = await processBatch(
    watchingMovies,
    item => getMovieDetails(item.externalId, item),
    5
  );
  
  const planMovieDetails = await processBatch(
    planToWatchMovies,
    item => getMovieDetails(item.externalId, item),
    5
  );
  
  const completedMovieDetails = await processBatch(
    completedMovies,
    item => getMovieDetails(item.externalId, item),
    5
  );
  
  const ratingOnlyMovieDetails = await processBatch(
    ratingOnlyItems.filter(item => item.mediaType === "movie"),
    item => getMovieDetails(item.externalId, item),
    5
  );
  
  // Fetch details for TV show items
  const watchingTVShowDetails = await processBatch(
    watchingTVShows,
    item => getTVShowDetails(item.externalId, item),
    5
  );
  
  const planTVShowDetails = await processBatch(
    planToWatchTVShows,
    item => getTVShowDetails(item.externalId, item),
    5
  );
  
  const completedTVShowDetails = await processBatch(
    completedTVShows,
    item => getTVShowDetails(item.externalId, item),
    5
  );
  
  const ratingOnlyTVShowDetails = await processBatch(
    ratingOnlyItems.filter(item => item.mediaType === "tv"),
    item => getTVShowDetails(item.externalId, item),
    5
  );

  // Combine items by category for displaying
  const watchingItems = [
    ...watchingAnimeDetails, 
    ...watchingMovieDetails, 
    ...watchingTVShowDetails
  ];
  
  const planningItems = [
    ...planAnimeDetails, 
    ...planMovieDetails, 
    ...planTVShowDetails
  ];
  
  const completedItems = [
    ...completedAnimeDetails, 
    ...completedMovieDetails, 
    ...completedTVShowDetails
  ];

  // Add rating-only items to planning
  const ratingOnlyForPlanning = [
    ...ratingOnlyAnimeDetails,
    ...ratingOnlyMovieDetails,
    ...ratingOnlyTVShowDetails
  ];
  
  // Add them to planning since they don't have a status
  planningItems.push(...ratingOnlyForPlanning);

  // Calculate totals for display
  const totalWatching = watchingAnime.length + watchingMovies.length + watchingTVShows.length;
  const totalPlanning = planToWatchAnime.length + planToWatchMovies.length + planToWatchTVShows.length + ratingOnlyItems.length;
  const totalCompleted = completedAnime.length + completedMovies.length + completedTVShows.length;

  return (
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
          />
        </main>
      </div>
    </div>
  );
}
