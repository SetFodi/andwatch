import Image from "next/image";
import Link from "next/link";
import { animeApi, tmdbApi } from "../lib/services/api";
import HomePosterShowcase from "../components/HomePosterShowcase";

async function getHomePageMedia() {
  try {
    // Fetch top anime
    const animeData = await animeApi.getTopAnime(1);
    const topAnime = animeData.data?.slice(0, 8).map(anime => ({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      type: "anime"
    })) || [];

    // Fetch popular movies
    const movieData = await tmdbApi.getPopularMovies(1);
    const popularMovies = movieData.results?.slice(0, 8).map(movie => ({
      id: movie.id,
      title: movie.title,
      image: tmdbApi.getImageUrl(movie.poster_path),
      type: "movie"
    })) || [];

    // Fetch popular TV shows
    const tvData = await tmdbApi.getPopularTVShows(1);
    const popularTV = tvData.results?.slice(0, 8).map(show => ({
      id: show.id,
      title: show.name,
      image: tmdbApi.getImageUrl(show.poster_path),
      type: "tv"
    })) || [];

    return {
      anime: topAnime,
      movies: popularMovies,
      tvShows: popularTV
    };
  } catch (error) {
    console.error("Failed to fetch media data:", error);
    return { anime: [], movies: [], tvShows: [] };
  }
}

export default async function Home() {
  const { anime, movies, tvShows } = await getHomePageMedia();
  
  // Combine all media
  const allMedia = [...anime, ...movies, ...tvShows].filter(item => item.image);

  // For trending section (static, server-side only)
  const trendingMedia = allMedia
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left space-y-6 animate-fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight tracking-tight bg-gradient-to-r from-rose-400 via-white to-indigo-400 bg-clip-text text-transparent">
                Track What You Watch
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-xl leading-relaxed">
                Organize your entertainment life. Track anime, movies, and TV shows in one beautiful interface. Rate, review, and never lose track of your favorites.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                <Link href="/auth/signup" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg text-white font-medium hover:from-indigo-500 hover:to-violet-500 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-1">
                  Get Started
                </Link>
                <Link href="/search" className="px-8 py-3 bg-gray-800/80 border border-gray-700/50 rounded-lg text-gray-200 font-medium hover:bg-gray-700/80 hover:text-white transition-all duration-300 transform hover:-translate-y-1">
                  Explore Content
                </Link>
              </div>
            </div>
            
            {/* Client Component for Randomizing Posters */}
            <div className="lg:w-1/2 animate-fade-in-up">
              <HomePosterShowcase initialMedia={allMedia} />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 bg-gradient-to-b from-black/30 to-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Trending Now
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {trendingMedia.map((item) => (
              <Link 
                href={`/${item.type === 'anime' ? 'anime' : item.type === 'tv' ? 'tvshows' : 'movies'}/${item.id}`}
                key={`trending-${item.type}-${item.id}`}
                className="group"
              >
                <div className="bg-gray-900/50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:ring-2 hover:ring-indigo-500/50">
                  <div className="aspect-[2/3] relative">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill
                        sizes="(max-width: 640px) 40vw, (max-width: 768px) 25vw, 15vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <div className="px-1 py-0.5 text-xs rounded inline-block bg-gray-900/80 text-gray-300 capitalize">
                        {item.type === 'tv' ? 'TV Show' : item.type}
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/search" 
              className="inline-flex items-center px-5 py-2 bg-gray-800/70 hover:bg-gray-700/70 rounded-lg text-gray-300 hover:text-white transition-colors border border-gray-700/40 hover:border-indigo-500/50"
            >
              Discover More
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Your Entertainment, Organized
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Organize Watchlists</h3>
              <p className="text-gray-400">Create custom collections to track what you're watching, plan to watch, or have completed.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/10 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-rose-600 to-pink-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Rate & Review</h3>
              <p className="text-gray-400">Share your opinions and keep track of what you loved, liked, or didn't enjoy.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-900/70 backdrop-blur-lg border border-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Discover New Content</h3>
              <p className="text-gray-400">Find your next favorite series or film with personalized recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900/70 to-gray-950/70 border border-gray-800/50 rounded-2xl p-8 md:p-12 backdrop-blur-md shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-4">Ready to organize your watch experience?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Join thousands of users who track, rate, and discover new content with AndWatch.</p>
            <Link href="/auth/signup" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500">
        <p>AndWatch © {new Date().getFullYear()} • Crafted with ❤️ for entertainment enthusiasts</p>
      </footer>
    </div>
  );
}