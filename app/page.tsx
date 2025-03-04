import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="text-center animate-fade-in z-10">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight tracking-tight mb-6 bg-gradient-to-r from-rose-400 via-white to-indigo-400 bg-clip-text text-transparent transition-all duration-500 hover:from-rose-500 hover:via-gray-200 hover:to-indigo-500">
          Welcome to AndWatch
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
          Your gateway to unforgettable stories—immerse yourself in anime adventures or cinematic brilliance.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="flex flex-col sm:flex-row gap-8 z-10">
        <Link href="/anime">
          <div className="relative group p-8 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-2xl shadow-xl hover:shadow-indigo-600/40 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-indigo-900/30 rounded-2xl group-hover:bg-indigo-800/50 transition-opacity duration-500"></div>
            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <h2 className="relative text-2xl sm:text-3xl font-semibold text-white z-10 mb-2">Anime List</h2>
            <p className="relative text-sm sm:text-base text-indigo-100 z-10">Journey through vibrant worlds and epic tales.</p>
            {/* Animated Icon */}
            <svg
              className="absolute bottom-4 right-4 w-8 h-8 text-indigo-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link href="/movies">
          <div className="relative group p-8 bg-gradient-to-br from-rose-700 to-rose-900 rounded-2xl shadow-xl hover:shadow-rose-600/40 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105">
            {/* Decorative Overlay */}
            <div className="absolute inset-0 bg-rose-900/30 rounded-2xl group-hover:bg-rose-800/50 transition-opacity duration-500"></div>
            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 bg-rose-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            <h2 className="relative text-2xl sm:text-3xl font-semibold text-white z-10 mb-2">Movies List</h2>
            <p className="relative text-sm sm:text-base text-rose-100 z-10">Uncover cinematic treasures and timeless classics.</p>
            {/* Animated Icon */}
            <svg
              className="absolute bottom-4 right-4 w-8 h-8 text-rose-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Enhanced Footer */}
      <footer className="mt-16 text-sm text-gray-400 animate-fade-in-up z-10">
        <p>Crafted with <span className="text-rose-400 animate-pulse">❤️</span> for story enthusiasts</p>
      </footer>
    </div>
  );
}