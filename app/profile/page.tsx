import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "../../lib/db";
import { User } from "../../lib/models/User";
import CategorySectionClient from "./CategorySectionClient";
import ProfileHeader from "./ProfileHeader";
import { animeApi, movieApi } from "../../lib/services/api";

// Helper functions with userRating and status
async function getAnimeDetails(externalId: string, userWatchItem?: any) {
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
    };
  } catch (error) {
    console.error(`Error fetching anime ${externalId}:`, error);
    return null;
  }
}

async function getMovieDetails(externalId: string, userWatchItem?: any) {
  try {
    const data = await movieApi.getMovieById(externalId);
    if (!data || !data.id) return null;
    return {
      id: data.id,
      title: data.title,
      image: data.poster_path ? movieApi.getImageUrl(data.poster_path) : null,
      score: data.vote_average || null,
      type: "movie",
      year: data.release_date ? new Date(data.release_date).getFullYear() : null,
      url: `/movies/${data.id}`,
      userRating: userWatchItem?.userRating || null,
      status: userWatchItem?.status || null,
    };
  } catch (error) {
    console.error(`Error fetching movie ${externalId}:`, error);
    return null;
  }
}

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in"); // Adjusted to match typical Next.js auth routes
  }

  await connectDB();

  const userDoc = await User.findById(session.user?.id);

  if (!userDoc) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black p-8">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-red-900/20 to-red-800/20 border border-red-700/50 p-6 rounded-2xl shadow-lg">
          <p className="text-red-300 text-lg">User data not found. Please try signing in again.</p>
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

  const watchingAnime = userDoc.watchlist.filter(item => item.status === "watching" && item.mediaType === "anime");
  const watchingMovies = userDoc.watchlist.filter(item => item.status === "watching" && item.mediaType === "movie");
  const planToWatchAnime = userDoc.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "anime");
  const planToWatchMovies = userDoc.watchlist.filter(item => item.status === "plan_to_watch" && item.mediaType === "movie");
  const completedAnime = userDoc.watchlist.filter(item => item.status === "completed" && item.mediaType === "anime");
  const completedMovies = userDoc.watchlist.filter(item => item.status === "completed" && item.mediaType === "movie");

  const watchingAnimeDetails = await Promise.all(
    watchingAnime.map(item => getAnimeDetails(item.externalId, item))
  ).then(results => results.filter(Boolean));
  
  const watchingMovieDetails = await Promise.all(
    watchingMovies.map(item => getMovieDetails(item.externalId, item))
  ).then(results => results.filter(Boolean));
  
  const planAnimeDetails = await Promise.all(
    planToWatchAnime.map(item => getAnimeDetails(item.externalId, item))
  ).then(results => results.filter(Boolean));
  
  const planMovieDetails = await Promise.all(
    planToWatchMovies.map(item => getMovieDetails(item.externalId, item))
  ).then(results => results.filter(Boolean));
  
  const completedAnimeDetails = await Promise.all(
    completedAnime.map(item => getAnimeDetails(item.externalId, item))
  ).then(results => results.filter(Boolean));
  
  const completedMovieDetails = await Promise.all(
    completedMovies.map(item => getMovieDetails(item.externalId, item))
  ).then(results => results.filter(Boolean));

  const watchingItems = [...watchingAnimeDetails, ...watchingMovieDetails];
  const planningItems = [...planAnimeDetails, ...planMovieDetails];
  const completedItems = [...completedAnimeDetails, ...completedMovieDetails];

  const totalWatching = watchingAnime.length + watchingMovies.length;
  const totalPlanning = planToWatchAnime.length + planToWatchMovies.length;
  const totalCompleted = completedAnime.length + completedMovies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 md:p-12 text-white">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader
          user={user}
          totalWatching={totalWatching}
          totalPlanning={totalPlanning}
          totalCompleted={totalCompleted}
        />
        <main className="mt-12">
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