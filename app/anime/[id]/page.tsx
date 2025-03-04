import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { animeApi } from "../../../lib/services/api";
import { notFound } from "next/navigation";
import WatchStatusButtons from "../../../components/WatchStatusButtons";
import UserRating from "../../../components/UserRating";
import connectDB from "../../../lib/db";
import { User } from "../../../lib/models/User";

async function getAnimeDetails(id: string) {
  try {
    const data = await animeApi.getAnimeById(id);
    if (!data || !data.data) {
      return null;
    }
    return data.data;
  } catch (error) {
    console.error("Error fetching anime details:", error);
    return null;
  }
}

async function getUserWatchItem(userId: string, animeId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) return null;
    
    return user.watchlist.find(
      (item: any) => item.externalId === animeId && item.mediaType === "anime"
    );
  } catch (error) {
    console.error("Error fetching user watch status:", error);
    return null;
  }
}

export default async function AnimeDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const anime = await getAnimeDetails(params.id);
  
  if (!anime) {
    notFound();
  }

  // Get user's watch status and rating if logged in
  let userWatchItem = null;
  if (session?.user?.id) {
    userWatchItem = await getUserWatchItem(session.user.id, params.id);
  }

  // Format aired dates
  const startDate = anime.aired?.from ? new Date(anime.aired.from).toLocaleDateString() : "?";
  const endDate = anime.aired?.to ? new Date(anime.aired.to).toLocaleDateString() : 
                  (anime.status === "Currently Airing" ? "Present" : "?");

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - Image and info */}
        <div className="w-full md:w-1/3">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="aspect-[3/4] relative mb-4">
              {anime.images?.jpg?.large_image_url ? (
                <Image 
                  src={anime.images.jpg.large_image_url}
                  alt={anime.title}
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 rounded-lg">
                  No Image Available
                </div>
              )}
            </div>
            {/* Closing div for aspect-[3/4] moved inside the conditional block */}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Information</h3>
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <span className="text-gray-400">Type:</span>
                  <span className="col-span-2">{anime.type || "Unknown"}</span>
                  
                  <span className="text-gray-400">Episodes:</span>
                  <span className="col-span-2">{anime.episodes || "Unknown"}</span>
                  
                  <span className="text-gray-400">Status:</span>
                  <span className="col-span-2">{anime.status || "Unknown"}</span>
                  
                  <span className="text-gray-400">Aired:</span>
                  <span className="col-span-2">{startDate} to {endDate}</span>
                  
                  <span className="text-gray-400">Season:</span>
                  <span className="col-span-2 capitalize">
                    {anime.season ? `${anime.season} ${anime.year}` : "Unknown"}
                  </span>
                  
                  <span className="text-gray-400">Studios:</span>
                  <span className="col-span-2">
                    {anime.studios && anime.studios.length > 0 
                      ? anime.studios.map((s: any) => s.name).join(", ") 
                      : "Unknown"}
                  </span>
                  
                  <span className="text-gray-400">Source:</span>
                  <span className="col-span-2">{anime.source || "Unknown"}</span>
                  
                  <span className="text-gray-400">Rating:</span>
                  <span className="col-span-2">{anime.rating || "Unknown"}</span>
                </div>
              </div>
              
              {/* User actions section */}
              {session && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">My List</h3>
                  
                  <WatchStatusButtons 
                    itemId={params.id}
                    mediaType="anime"
                    currentStatus={userWatchItem?.status || null}
                  />
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">My Rating</h4>
                    <UserRating 
                      itemId={params.id}
                      mediaType="anime"
                      currentRating={userWatchItem?.userRating || null}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related anime */}
          {anime.relations && anime.relations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Related Anime</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <ul className="space-y-2">
                  {anime.relations.map((relation: any, index: number) => (
                    <li key={index}>
                      <div className="font-medium text-gray-300">{relation.relation}:</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {relation.entry.map((entry: any) => (
                          entry.type === "anime" ? (
                            <Link 
                              key={entry.mal_id} 
                              href={`/anime/${entry.mal_id}`}
                              className="text-blue-400 hover:underline"
                            >
                              {entry.name}
                            </Link>
                          ) : (
                            <span key={entry.mal_id} className="text-gray-400">
                              {entry.name}
                            </span>
                          )
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* User reviews section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold">User Reviews</h3>
              {session && (
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition">
                  Write a Review
                </button>
              )}
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
              {!session && (
                <Link href="/auth/signin" className="block mt-4 text-blue-400 hover:underline">
                  Sign in to write a review
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Details */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
          {anime.title_english && anime.title_english !== anime.title && (
            <h2 className="text-xl text-gray-400 mb-4">{anime.title_english}</h2>
          )}
          
          <div className="flex items-center mb-6">
            <div className="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">{anime.score ? anime.score.toFixed(2) : "N/A"}</span>
              <span className="text-gray-400 ml-1">({anime.scored_by ? `${anime.scored_by.toLocaleString()} users` : "0 users"})</span>
            </div>
            
            <div className="text-gray-400 mr-4">
              Ranked #{anime.rank || "N/A"}
            </div>
            
            <div className="text-gray-400">
              Popularity #{anime.popularity || "N/A"}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {anime.genres &&
              anime.genres.map((genre: any) => (
                <Link 
                  key={genre.mal_id} 
                  href={`/anime?genre=${genre.mal_id}`}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition"
                >
                  {genre.name}
                </Link>
              ))}
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Synopsis</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {anime.synopsis || "No synopsis available."}
              </p>
            </div>
          </div>
          
          {anime.trailer && anime.trailer.youtube_id && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Trailer</h3>
              <div className="bg-gray-800 rounded-lg p-4 aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${anime.title} trailer`}
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Characters */}
          {anime.characters && anime.characters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Characters</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {anime.characters.slice(0, 8).map((character: any) => (
                  <div key={character.character.mal_id} className="bg-gray-800 rounded-lg overflow-hidden flex flex-col h-full">
                    <div className="h-40 relative">
                      {character.character.images?.jpg?.image_url ? (
                        <Image 
                          src={character.character.images.jpg.image_url}
                          alt={character.character.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-grow">
                      <h4 className="font-semibold line-clamp-1">{character.character.name}</h4>
                      <p className="text-sm text-gray-400 line-clamp-1">{character.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommendations */}
          {anime.recommendations && anime.recommendations.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">You Might Also Like</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {anime.recommendations.slice(0, 4).map((rec: any) => (
                  <Link href={`/anime/${rec.entry.mal_id}`} key={rec.entry.mal_id}>
                    <div className="bg-gray-800 rounded-lg overflow-hidden transition hover:transform hover:scale-105">
                      <div className="h-40 relative">
                        {rec.entry.images?.jpg?.image_url ? (
                          <Image 
                            src={rec.entry.images.jpg.image_url}
                            alt={rec.entry.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold line-clamp-1">{rec.entry.title}</h4>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}