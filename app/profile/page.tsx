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
import { deduplicateWatchlist } from "../../lib/utils/deduplicateWatchlist";

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

// Create placeholder to maintain grid layout
function createPlaceholder(externalId: string, mediaType: "anime" | "movie" | "tv", userWatchItem?: any) {
  return {
    id: externalId,
    title: mediaType === "anime" ? "Anime" : mediaType === "movie" ? "Movie" : "TV Show",
    image: null,
    score: null,
    type: mediaType,
    year: null,
    url: `/${mediaType === "tv" ? "tvshows" : mediaType === "anime" ? "anime" : "movies"}/${externalId}`,
    userRating: userWatchItem?.userRating || null,
    status: userWatchItem?.status || null,
    isPlaceholder: true, // Flag for UI to show placeholder styling
  };
}

// Helper functions with userRating and status
async function getAnimeDetails(externalId: string, userWatchItem?: any) {
  return getOrSetCache(
    externalId,
    "anime",
    async () => {
      try {
        const data = await fetchWithRetry(() => animeApi.getAnimeById(externalId));
        if (!data || !data.data) return createPlaceholder(externalId, "anime", userWatchItem);
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
        return createPlaceholder(externalId, "anime", userWatchItem);
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
        if (!data || !data.id) return createPlaceholder(externalId, "movie", userWatchItem);
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
        return createPlaceholder(externalId, "movie", userWatchItem);
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
        if (!data || !data.id) return createPlaceholder(externalId, "tv", userWatchItem);
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
        return createPlaceholder(externalId, "tv", userWatchItem);
      }
    }
  );
}

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
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

  // Make sure watchlist exists to prevent errors and deduplicate items
  const rawWatchlist = userDoc.watchlist || [];

  // Deduplicate the watchlist to fix the issue with duplicate items
  const watchlist = deduplicateWatchlist(rawWatchlist);

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

  // Increase batch size for faster loading
  const batchSize = 5;

  // Prioritize loading the first few items of each category for faster initial display
  const priorityBatchSize = 3;

  // First, load just a few items from each category for immediate display
  const priorityPromises = [
    // Priority anime items (first few)
    processBatch(watchingAnime.slice(0, priorityBatchSize), item => getAnimeDetails(item.externalId, item), priorityBatchSize),
    processBatch(planToWatchAnime.slice(0, priorityBatchSize), item => getAnimeDetails(item.externalId, item), priorityBatchSize),
    processBatch(completedAnime.slice(0, priorityBatchSize), item => getAnimeDetails(item.externalId, item), priorityBatchSize),

    // Priority movie items (first few)
    processBatch(watchingMovies.slice(0, priorityBatchSize), item => getMovieDetails(item.externalId, item), priorityBatchSize),
    processBatch(planToWatchMovies.slice(0, priorityBatchSize), item => getMovieDetails(item.externalId, item), priorityBatchSize),
    processBatch(completedMovies.slice(0, priorityBatchSize), item => getMovieDetails(item.externalId, item), priorityBatchSize),

    // Priority TV show items (first few)
    processBatch(watchingTVShows.slice(0, priorityBatchSize), item => getTVShowDetails(item.externalId, item), priorityBatchSize),
    processBatch(planToWatchTVShows.slice(0, priorityBatchSize), item => getTVShowDetails(item.externalId, item), priorityBatchSize),
    processBatch(completedTVShows.slice(0, priorityBatchSize), item => getTVShowDetails(item.externalId, item), priorityBatchSize),
  ];

  // Start loading the remaining items in the background
  const remainingPromises = [
    // Remaining anime items
    processBatch(watchingAnime.slice(priorityBatchSize), item => getAnimeDetails(item.externalId, item), batchSize),
    processBatch(planToWatchAnime.slice(priorityBatchSize), item => getAnimeDetails(item.externalId, item), batchSize),
    processBatch(completedAnime.slice(priorityBatchSize), item => getAnimeDetails(item.externalId, item), batchSize),

    // Remaining movie items
    processBatch(watchingMovies.slice(priorityBatchSize), item => getMovieDetails(item.externalId, item), batchSize),
    processBatch(planToWatchMovies.slice(priorityBatchSize), item => getMovieDetails(item.externalId, item), batchSize),
    processBatch(completedMovies.slice(priorityBatchSize), item => getMovieDetails(item.externalId, item), batchSize),

    // Remaining TV show items
    processBatch(watchingTVShows.slice(priorityBatchSize), item => getTVShowDetails(item.externalId, item), batchSize),
    processBatch(planToWatchTVShows.slice(priorityBatchSize), item => getTVShowDetails(item.externalId, item), batchSize),
    processBatch(completedTVShows.slice(priorityBatchSize), item => getTVShowDetails(item.externalId, item), batchSize),

    // Process rating-only items (lower priority)
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
  ];

  // Wait for priority items to load first
  const priorityResults = await Promise.all(priorityPromises);

  // Start loading remaining items but don't wait for them to complete
  const remainingResultsPromise = Promise.all(remainingPromises);

  // Combine priority results
  const [
    priorityWatchingAnime,
    priorityPlanAnime,
    priorityCompletedAnime,
    priorityWatchingMovies,
    priorityPlanMovies,
    priorityCompletedMovies,
    priorityWatchingTVShows,
    priorityPlanTVShows,
    priorityCompletedTVShows,
  ] = priorityResults;

  // Set initial results with just the priority items
  let watchingAnimeDetails = priorityWatchingAnime;
  let planAnimeDetails = priorityPlanAnime;
  let completedAnimeDetails = priorityCompletedAnime;
  let watchingMovieDetails = priorityWatchingMovies;
  let planMovieDetails = priorityPlanMovies;
  let completedMovieDetails = priorityCompletedMovies;
  let watchingTVShowDetails = priorityWatchingTVShows;
  let planTVShowDetails = priorityPlanTVShows;
  let completedTVShowDetails = priorityCompletedTVShows;
  let ratingOnlyItemsDetails = [];

  // Try to get the remaining results, but don't block rendering if they're not ready
  try {
    const remainingResults = await Promise.race([
      remainingResultsPromise,
      new Promise((resolve) => setTimeout(() => resolve(null), 500)) // 500ms timeout
    ]);

    // If we got results before timeout, merge them with priority results
    if (remainingResults) {
      const [
        remainingWatchingAnime,
        remainingPlanAnime,
        remainingCompletedAnime,
        remainingWatchingMovies,
        remainingPlanMovies,
        remainingCompletedMovies,
        remainingWatchingTVShows,
        remainingPlanTVShows,
        remainingCompletedTVShows,
        remainingRatingOnlyItems
      ] = remainingResults;

      // Merge priority and remaining results
      watchingAnimeDetails = [...priorityWatchingAnime, ...remainingWatchingAnime];
      planAnimeDetails = [...priorityPlanAnime, ...remainingPlanAnime];
      completedAnimeDetails = [...priorityCompletedAnime, ...remainingCompletedAnime];
      watchingMovieDetails = [...priorityWatchingMovies, ...remainingWatchingMovies];
      planMovieDetails = [...priorityPlanMovies, ...remainingPlanMovies];
      completedMovieDetails = [...priorityCompletedMovies, ...remainingCompletedMovies];
      watchingTVShowDetails = [...priorityWatchingTVShows, ...remainingWatchingTVShows];
      planTVShowDetails = [...priorityPlanTVShows, ...remainingPlanTVShows];
      completedTVShowDetails = [...priorityCompletedTVShows, ...remainingCompletedTVShows];
      ratingOnlyItemsDetails = remainingRatingOnlyItems;
    }
  } catch (error) {
    console.error("Error loading remaining items:", error);
    // Continue with just the priority items
    ratingOnlyItemsDetails = [];
  }

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

          {/* Quick Navigation Bar */}
          <div className="mt-6 mb-8 flex flex-wrap gap-3 justify-center">
            <a
              href="/profile/completed"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View All Completed ({totalCompleted})</span>
            </a>
            <a
              href="/profile/watching"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View All Watching ({totalWatching})</span>
            </a>
            <a
              href="/profile/planning"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>View All Planning ({totalPlanning})</span>
            </a>
          </div>
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