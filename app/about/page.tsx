// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">
        About AndWatch
      </h1>

      {/* Main Content */}
      <div className="bg-gray-900/70 border border-gray-800/50 rounded-xl p-8 backdrop-blur-sm">
        <p className="text-gray-300 text-lg mb-6">
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">AndWatch</span>, your ultimate companion for tracking and discovering anime and movies. Our mission is to help you organize your watchlists, rate your favorite content, and explore new titles—all wrapped in a beautiful, user-friendly interface.
        </p>

        <p className="text-gray-400 mb-6">
          Whether you’re an anime enthusiast or a movie buff, AndWatch is designed to make your viewing experience seamless and enjoyable. Create personal collections, track your progress, and stay connected with the stories you love.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-medium text-white mb-3">Features</h2>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                Track anime and movies effortlessly
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                Create and manage watchlists
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                Rate and review your favorites
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-medium text-white mb-3">Get Started</h2>
            <p className="text-gray-400 mb-4">
              Ready to dive in? Sign up or log in to start tracking your anime and movie journey today!
            </p>
            <div className="flex space-x-4">
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 hover:border-indigo-500/50 text-gray-300 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md hover:shadow-indigo-500/20 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Team or Contact (Optional) */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Built with ❤️ by the Andromeda |{" "}
          <Link href="mailto:lukafartenadze@gmail.com" className="text-indigo-400 hover:text-indigo-300">
            Contact Us
          </Link>
        </p>
      </div>
    </div>
  );
}