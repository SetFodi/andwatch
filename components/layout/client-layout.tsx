"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import GlobalLoadingProvider from "@/components/ui/global-loading";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<{
    avatar?: string;
    displayName?: string;
  } | null>(null);

  // Fetch user data including avatar when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [session, status]);

  // Generate the avatar URL if it exists, adding cache busting
  const avatarUrl = userData?.avatar 
    ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${userData.avatar}?t=${Date.now()}` 
    : null;
  
  // Display name fallback chain
  const displayName = userData?.displayName || session?.user?.name || session?.user?.email?.split('@')[0] || "User";
  
  // First letter for avatar fallback
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <GlobalLoadingProvider>
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
            {/* Search Button */}
            <Link href="/search" className="relative p-2.5 text-gray-400 hover:text-white transition-colors duration-200 rounded-xl hover:bg-gray-800/50 group">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="absolute inset-0 rounded-xl ring-2 ring-indigo-500/0 group-hover:ring-indigo-500/50 transition-all duration-300"></span>
            </Link>

            {status === "authenticated" ? (
              <div className="flex items-center">
                {/* Profile Menu Dropdown */}
                <div className="relative group">
                  <button className="flex items-center focus:outline-none">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-700/50 flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/20 transition-all duration-300">
                      {avatarUrl ? (
                        <Image 
                          src={avatarUrl} 
                          alt={displayName} 
                          width={36} 
                          height={36} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // On error, revert to initials
                            console.error("Error loading avatar", e);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {firstLetter}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-64 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800/70 rounded-xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50 backdrop-blur-sm overflow-hidden">
                    <div className="py-3 px-4 border-b border-gray-800/50 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-700/50 flex items-center justify-center">
                        {avatarUrl ? (
                          <Image 
                            src={avatarUrl} 
                            alt={displayName} 
                            width={40} 
                            height={40} 
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {firstLetter}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{displayName}</span>
                        <span className="text-xs text-gray-400 truncate">{session?.user?.email}</span>
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
            href={status === "authenticated" ? "/profile" : "/auth/signin"} 
            icon={status === "authenticated" ? <ProfileIcon /> : <SignInIcon />} 
            label={status === "authenticated" ? "Profile" : "Sign In"} 
          />
        </div>
      </div>

      {/* Add bottom padding on mobile for the fixed navigation */}
      <main className="flex-1 md:pb-0 pb-16">
        {children}
      </main>

{/* Enhanced Footer */}
<footer className="border-t border-gray-900/50 bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-sm py-5 relative overflow-hidden">
  {/* Decorative elements */}
  <div className="absolute inset-0 opacity-5">
    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl"></div>
    <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"></div>
  </div>
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Logo section */}
      <div className="col-span-1">
        <Link href="/" className="flex items-center mb-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-500 mr-1.5" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-base font-semibold">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">and</span>watch
          </span>
        </Link>
        <p className="text-gray-500 text-xs leading-relaxed">Track your anime and movies beautifully. Create personal collections and discover new content.</p>
        
        {/* Social links with actual URLs */}
        <div className="flex space-x-3 mt-3">
          <a href="https://www.instagram.com/fartenadzeluka/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a href="https://www.facebook.com/luka.fartenadze.1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </a>
          <a href="https://github.com/SetFodi" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
      
      {/* Quick Links */}
      <div>
        <h3 className="text-white text-sm font-medium mb-3">Explore</h3>
        <ul className="space-y-1.5 text-xs">
          <li><Link href="/" className="text-gray-400 hover:text-white transition-colors duration-200">Home</Link></li>
          <li><Link href="/anime" className="text-gray-400 hover:text-white transition-colors duration-200">Anime</Link></li>
          <li><Link href="/movies" className="text-gray-400 hover:text-white transition-colors duration-200">Movies</Link></li>
          <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About</Link></li>
        </ul>
      </div>
      
      {/* Account Links */}
      <div>
        <h3 className="text-white text-sm font-medium mb-3">Account</h3>
        <ul className="space-y-1.5 text-xs">
          <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors duration-200">Profile</Link></li>
          <li><Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors duration-200">Sign In</Link></li>
          <li><Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors duration-200">Sign Up</Link></li>
        </ul>
      </div>
    </div>
    
    {/* Bottom copyright */}
    <div className="mt-6 pt-4 border-t border-gray-900/70 flex flex-col sm:flex-row justify-between items-center gap-2">
      <p className="text-gray-500 text-xs">© {new Date().getFullYear()} AndWatch. All rights reserved.</p>
      <p className="text-gray-600 text-xs">Made with ♥ for anime & movie enthusiasts</p>
    </div>
  </div>
</footer>
    </GlobalLoadingProvider>
  );
}

// Desktop Navigation Link Component
function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
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
function MobileNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
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
function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
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

function SignInIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}