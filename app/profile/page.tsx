// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import connectDB from "../../lib/db";
import { User } from "../../lib/models/User";
import Link from "next/link";
import Image from "next/image";
import { animeApi, movieApi } from "../../lib/services/api";

// Helper function to get anime or movie details
async function getItemDetails(externalId: string, mediaType: string) {
  try {
    if (mediaType === "anime") {
      const data = await animeApi.getAnimeById(externalId);
      if (!data || !data.data) return null;
      
      return {
        id: data.data.mal_id,
        title: data.data.title,
        image: data.data.images?.jpg?.image_url || null,
        score: data.data.score,
        type: "anime",
        year: data.data.year || (data.data.aired?.from ? new Date(data.data.aired.from).getFullYear() : null),
        url: `/anime/${data.data.mal_id}`
      };
    } else if (mediaType === "movie") {
      const data = await movieApi.getMovieById(externalId);
      if (!data || !data.id) return null;
      
      return {
        id: data.id,
        title: data.title,
        image: data.poster_path ? movieApi.getImageUrl(data.poster_path) : null,
        score: data.vote_average,
        type: "movie",
        year: data.release_date ? new Date(data.release_date).getFullYear() : null,
        url: `/movies/${data.id}`
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching ${mediaType} ${externalId}:`, error);
    return null;
  }
}

export default async function Profile() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  await connectDB();
  
  // Get user data
  const user = await User.findById(session.user?.id);
  
  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        <p className="text-red-400">User data not found. Please try signing in again.</p>
      </div>
    );
  }

  // Filter watchlist into categories
  const watching = user.watchlist.filter(item => item.status === "watching");
  const planToWatch = user.watchlist.filter(item => item.status === "plan_to_watch");
  const completed = user.watchlist.filter(item => item.status === "completed");
  
  // Fetch details for the first few items in each category
  const watchingDetails = await Promise.all(
    watching.slice(0, 4).map(item => getItemDetails(item.externalId, item.mediaType))
  );
  
  const planToWatchDetails = await Promise.all(
    planToWatch.slice(0, 4).map(item => getItemDetails(item.externalId, item.mediaType))
  );
  
  const completedDetails = await Promise.all(
    completed.slice(0, 4).map(item => getItemDetails(item.externalId, item.mediaType))
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">My Profile</h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-700">
              {user.avatar ? (
                <Image 
                  src={user.avatar} 
                  alt={user.displayName || "User"} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white text-3xl font-bold">
                  {(user.displayName || user.email).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.displayName || user.username || user.email.split('@')[0]}</h2>
              <p className="text-gray-400">{user.email}</p>
              <div className="mt-2 space-x-3">
                <Link href="/profile/edit" className="text-blue-400 hover:underline">
                  Edit Profile
                </Link>
                <Link href="/profile/settings" className="text-blue-400 hover:underline">
                  Settings
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-700 pt-4">
            <div className="grid grid-cols-3 text-center">
              <div>
                <div className="text-3xl font-bold">{watching.length}</div>
                <div className="text-gray-400">Watching</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{completed.length}</div>
                <div className="text-gray-400">Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{user.watchlist.length}</div>
                <div className="text-gray-400">Total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Watch Lists */}
      <div className="space-y-10">
        {/* Currently Watching */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Currently Watching</h2>
            <Link href="/profile/watching" className="text-blue-400 hover:underline">
              View All
            </Link>
          </div>
          
          {watchingDetails.filter(Boolean).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {watchingDetails.filter(Boolean).map((item: any) => (
                <Link href={item.url} key={`${item.type}-${item.id}`}>
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full">
                    <div className="h-48 bg-gray-700 relative">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {item.score && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          ★ {item.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-400 capitalize">{item.type}</span>
                        {item.year && <span className="text-gray-400">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-gray-400">You're not watching anything yet.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link href="/anime" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
                  Browse Anime
                </Link>
                <Link href="/movies" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">
                  Browse Movies
                </Link>
              </div>
            </div>
          )}
        </section>
        
        {/* Plan to Watch */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Plan to Watch</h2>
            <Link href="/profile/planning" className="text-blue-400 hover:underline">
              View All
            </Link>
          </div>
          
          {planToWatchDetails.filter(Boolean).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {planToWatchDetails.filter(Boolean).map((item: any) => (
                <Link href={item.url} key={`${item.type}-${item.id}`}>
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full">
                    <div className="h-48 bg-gray-700 relative">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {item.score && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          ★ {item.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-400 capitalize">{item.type}</span>
                        {item.year && <span className="text-gray-400">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-gray-400">You don't have anything in your plan to watch list yet.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link href="/anime" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
                  Browse Anime
                </Link>
                <Link href="/movies" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">
                  Browse Movies
                </Link>
              </div>
            </div>
          )}
        </section>
        
        {/* Completed */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Completed</h2>
            <Link href="/profile/completed" className="text-blue-400 hover:underline">
              View All
            </Link>
          </div>
          
          {completedDetails.filter(Boolean).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {completedDetails.filter(Boolean).map((item: any) => (
                <Link href={item.url} key={`${item.type}-${item.id}`}>
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105 h-full">
                    <div className="h-48 bg-gray-700 relative">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={item.title} 
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {item.score && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          ★ {item.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-400 capitalize">{item.type}</span>
                        {item.year && <span className="text-gray-400">{item.year}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-gray-400">You haven't completed anything yet.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link href="/anime" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition">
                  Browse Anime
                </Link>
                <Link href="/movies" className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition">
                  Browse Movies
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}