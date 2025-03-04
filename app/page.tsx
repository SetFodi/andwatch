import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center animate-fade-in">
        <h1 className="text-5xl sm:text-6xl font-extralight tracking-tight mb-6 bg-gradient-to-r from-rose-400 via-white to-indigo-400 bg-clip-text text-transparent">
          Welcome to AndWatch
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Discover your next obsession—whether it’s gripping movies or captivating anime.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="flex flex-col sm:flex-row gap-8">
        <Link href="/anime">
          <div className="relative group p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-2">
            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-indigo-900/20 rounded-xl group-hover:bg-indigo-800/30 transition-opacity duration-300"></div>
            <h2 className="relative text-2xl font-medium text-white z-10">Anime List</h2>
            <p className="relative text-sm text-indigo-200 mt-2 z-10">Explore vibrant worlds and unforgettable stories.</p>
            {/* Subtle Icon */}
            <svg className="absolute bottom-4 right-4 w-8 h-8 text-indigo-400 opacity-50 group-hover:opacity-80 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link href="/movies">
          <div className="relative group p-8 bg-gradient-to-br from-rose-600 to-rose-800 rounded-xl shadow-lg hover:shadow-rose-500/30 transition-all duration-300 transform hover:-translate-y-2">
            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-rose-900/20 rounded-xl group-hover:bg-rose-800/30 transition-opacity duration-300"></div>
            <h2 className="relative text-2xl font-medium text-white z-10">Movies List</h2>
            <p className="relative text-sm text-rose-200 mt-2 z-10">Dive into cinematic masterpieces and hidden gems.</p>
            {/* Subtle Icon */}
            <svg className="absolute bottom-4 right-4 w-8 h-8 text-rose-400 opacity-50 group-hover:opacity-80 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Optional Footer Note */}
      <p className="mt-16 text-sm text-gray-500 animate-fade-in-up">
        Built with ❤️ for entertainment lovers
      </p>
    </div>
  );
}