// app/movies/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { movieApi } from "../../../lib/services/api";
import { notFound } from "next/navigation";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";
import MovieDetailsClient from "./MovieDetailsClient";

async function getMovieDetails(id: string) {
  try {
    const data = await movieApi.getMovieById(id);
    if (!data || data.success === false) {
      return null;
    }
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

async function getUserWatchItem(userId: string, movieId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;
    
    return user.watchlist.find(
      item => item.externalId === movieId && item.mediaType === 'movie'
    );
  } catch (error) {
    console.error("Error fetching user watch status:", error);
    return null;
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const movie = await getMovieDetails(params.id);
  
  if (!movie) {
    notFound();
  }

  // Get user's watch status and rating if logged in
  let userWatchItem = null;
  if (session?.user?.id) {
    userWatchItem = await getUserWatchItem(session.user.id, params.id);
  }

  // Pass the fetched data to the client component
  return (
    <MovieDetailsClient 
      movie={movie} 
      id={params.id}
      userWatchItem={userWatchItem}
      session={!!session} // Just pass if user is logged in or not
    />
  );
}