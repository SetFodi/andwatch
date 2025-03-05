// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import Providers from "./providers";
import Image from "next/image";

export const metadata = {
  title: "AndWatch | Track Movies & Anime",
  description: "Track your anime and movies beautifully. Create watchlists, rate content, and discover new favorites.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white min-h-screen flex flex-col font-sans">
        {/* Fixed header with glass effect */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/70 border-b border-gray-800/50">
          <div className="max-w-7xl mx-auto h-16 md:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-indigo-500 mr-2 group-hover:text-indigo-400 transition-colors duration-300" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 text-xl font-semibold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">and</span>watch
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center space-x-1 bg-gray-900/50 rounded-xl p-1 border border-gray-800/30">
                <NavLink href="/anime" icon={<AnimeIcon />} label="Anime" />
                <NavLink href="/movies" icon={<MovieIcon />} label="Movies" />
                <NavLink href="/about" icon={<AboutIcon />} label="About" />
              </div>
            </nav>

{/* User Section */}
<div className="flex items-center space-x-4">
              {/* Search Button (now a Link) */}
              <Link href="/search" className="relative p-2.5 text-gray-400 hover:text-white transition-colors duration-200 rounded-xl hover:bg-gray-800/50 group">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="absolute inset-0 rounded-xl ring-2 ring-indigo-500/0 group-hover:ring-indigo-500/50 transition-all duration-300"></span>
              </Link>

              {session ? (
                <div className="flex items-center">
                  {/* Notification Button */}
                  <button className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 mr-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>

                  {/* Profile Menu Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center focus:outline-none">
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-700/50 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                        {session.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || "User"} 
                            width={36} 
                            height={36} 
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-64 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/70 rounded-xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50 backdrop-blur-sm overflow-hidden">
                      <div className="py-3 px-4 border-b border-gray-800/50 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-700/50 flex items-center justify-center">
                          {session.user?.image ? (
                            <Image 
                              src={session.user.image} 
                              alt={session.user.name || "User"} 
                              width={40} 
                              height={40} 
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {session.user?.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{session.user?.name || "User"}</span>
                          <span className="text-xs text-gray-400 truncate">{session.user?.email}</span>
                        </div>
                      </div>
                      <div className="py-2">
                        <MenuLink href="/profile" label="Profile" icon={<ProfileIcon />} />
                        <div className="px-3 pt-2 mt-1">
                          <form action="/api/auth/signout" method="post" className="w-full">
                            <button type="submit" className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors duration-200">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span>Sign Out</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/signin"
                    className="text-sm px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 hover:border-indigo-500/50 text-gray-300 hover:text-white transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="hidden sm:flex text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md hover:shadow-indigo-500/20 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800/50 bg-black/90 backdrop-blur-md z-50">
          <div className="grid grid-cols-5 h-16">
            <MobileNavLink href="/" icon={<HomeIcon />} label="Home" />
            <MobileNavLink href="/anime" icon={<AnimeIcon />} label="Anime" />
            <MobileNavLink href="/movies" icon={<MovieIcon />} label="Movies" />
            <MobileNavLink href="/about" icon={<AboutIcon />} label="About" />
            <MobileNavLink 
              href={session ? "/profile" : "/auth/signin"} 
              icon={session ? <ProfileIcon /> : <SignInIcon />} 
              label={session ? "Profile" : "Sign In"} 
            />
          </div>
        </div>

        {/* Add bottom padding on mobile for the fixed navigation */}
        <main className="flex-1 md:pb-0 pb-16">
          <Providers>
            {children}
          </Providers>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-900/50 bg-black/30 backdrop-blur-sm py-6 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Link href="/" className="flex items-center mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-indigo-500 mr-2" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-lg font-semibold">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">and</span>watch
                  </span>
                </Link>
                <p className="text-gray-400 text-sm">Track your anime and movies beautifully. Create personal collections and discover new content.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Navigation</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">Home</Link></li>
                  <li><Link href="/anime" className="text-gray-400 hover:text-white transition-colors duration-200">Anime</Link></li>
                  <li><Link href="/movies" className="text-gray-400 hover:text-white transition-colors duration-200">Movies</Link></li>
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-medium mb-4">Account</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors duration-200">Profile</Link></li>
                  <li><Link href="/profile/watchlist" className="text-gray-400 hover:text-white transition-colors duration-200">Watchlist</Link></li>
                  <li><Link href="/profile/settings" className="text-gray-400 hover:text-white transition-colors duration-200">Settings</Link></li>
                  <li><Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors duration-200">Sign In</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-900 mt-8 pt-6">
              <p className="text-gray-500 text-sm text-center">© {new Date().getFullYear()} AndWatch. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/70 transition-all duration-200"
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex flex-col items-center justify-center text-gray-500 hover:text-indigo-400 transition-colors duration-200"
    >
      <span className="mb-1">{icon}</span>
      <span className="text-xs">{label}</span>
    </Link>
  );
}

// Dropdown Menu Link Component
function MenuLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 mx-3 rounded-lg transition-colors duration-200"
    >
      <span className="mr-3 text-gray-400">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

// Icons
function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function AnimeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function MovieIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function WatchlistIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SignInIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}