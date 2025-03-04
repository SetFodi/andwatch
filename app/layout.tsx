// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import Providers from "./providers";
import Image from "next/image";

export const metadata = {
  title: "AndWatch",
  description: "Track your anime and movies beautifully.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Get the server-side session
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex flex-col">
        {/* Fixed height header with border bottom */}
        <header className="h-16 border-b border-gray-900">
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="font-light text-xl tracking-wide">
              <span className="font-medium">and</span>watch
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/anime" 
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Anime
              </Link>
              <Link 
                href="/movies" 
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Movies
              </Link>
              <Link 
                href="/discover" 
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                Discover
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              {/* Search Button */}
              <button className="p-2 text-gray-400 hover:text-white mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {session ? (
                <div className="flex items-center">
                  {/* Profile Menu Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center focus:outline-none">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center">
                        {session.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || "User"} 
                            width={32} 
                            height={32} 
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-300">
                            {session.user?.name?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-800 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                      <div className="py-1.5 px-4 border-b border-gray-800 text-sm text-gray-300">
                        {session.user?.name || session.user?.email}
                      </div>
                      <div className="py-1">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800">
                          Profile
                        </Link>
                        <Link href="/profile/settings" className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800">
                          Settings
                        </Link>
                        <form action="/api/auth/signout" method="post">
                          <button type="submit" className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800">
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-sm border border-gray-800 px-4 py-2 hover:border-white transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Bar (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-900 bg-black z-50">
          <div className="grid grid-cols-4 h-16">
            <Link href="/" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/anime" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">Anime</span>
            </Link>
            <Link href="/movies" className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              <span className="text-xs mt-1">Movies</span>
            </Link>
            <Link href={session ? "/profile" : "/auth/signin"} className="flex flex-col items-center justify-center text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">{session ? "Profile" : "Sign In"}</span>
            </Link>
          </div>
        </div>

        {/* Add bottom padding on mobile for the fixed navigation */}
        <main className="flex-1 md:pb-0 pb-16">
          <Providers>
            {children}
          </Providers>
        </main>
      </body>
    </html>
  );
}