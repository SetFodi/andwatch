// components/layout/client-layout.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalLoadingProvider from "@/components/ui/global-loading";
import QuickAccessFAB from "@/components/ui/QuickAccessFAB";
import BackToTopButton from "@/components/ui/BackToTopButton";
import EnhancedHeader from "./EnhancedHeader";
import EnhancedFooter from "./EnhancedFooter";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Enhanced route prefetching for faster navigation
  useEffect(() => {
    // Prefetch main navigation routes
    const commonRoutes = [
      '/',
      '/anime',
      '/movies',
      '/tvshows',
      '/profile',
      '/profile/history',
      '/profile/completed',
      '/profile/watching',
      '/profile/planning',
      '/search'
    ];

    // Immediate prefetch for primary routes
    commonRoutes.forEach(route => {
      router.prefetch(route);
    });

    // Prefetch secondary routes after a short delay
    const secondaryRoutes = [
      '/about',
      '/profile/edit',
      '/watchlist'
    ];

    const timer = setTimeout(() => {
      secondaryRoutes.forEach(route => {
        router.prefetch(route);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  // Enhanced prefetching for faster navigation
  useEffect(() => {
    // Prefetch main navigation routes
    const commonRoutes = [
      '/',
      '/anime',
      '/movies',
      '/tvshows',
      '/profile',
      '/profile/history',
      '/profile/completed',
      '/profile/watching',
      '/profile/planning',
      '/search'
    ];

    // Immediate prefetch for primary routes
    commonRoutes.forEach(route => {
      router.prefetch(route);
    });

    // Prefetch secondary routes after a short delay
    const secondaryRoutes = [
      '/about',
      '/profile/edit',
      '/watchlist'
    ];

    const timer = setTimeout(() => {
      secondaryRoutes.forEach(route => {
        router.prefetch(route);
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

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

  // Generate the avatar URL if it exists, with proper path handling
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Update avatar URL when user data changes
  useEffect(() => {
    if (userData?.avatar && userData.avatar.trim() !== '') {
      try {
        // Add a timestamp to prevent caching issues
        const avatarPath = userData.avatar.startsWith('/') ? userData.avatar : `/${userData.avatar}`;

        // For local development, use relative URLs
        // This avoids issues with http vs https and localhost vs domain names
        const fullUrl = `${avatarPath}?t=${Date.now()}`;

        // Set the URL immediately
        setAvatarUrl(fullUrl);
      } catch (error) {
        console.warn("Error processing avatar URL:", error);
        setAvatarUrl(null);
      }
    } else {
      setAvatarUrl(null);
    }
  }, [userData]);

  // Check for avatar updates from other components
  useEffect(() => {
    // Function to check for avatar updates
    const checkForAvatarUpdates = async () => {
      const avatarUpdated = localStorage.getItem('avatarUpdated');
      if (avatarUpdated && session?.user?.id) {
        // Clear the flag
        localStorage.removeItem('avatarUpdated');

        // Refetch user data to get the updated avatar
        try {
          const response = await fetch(`/api/user/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);

            // Force avatar refresh with new timestamp
            if (data.avatar && data.avatar.trim() !== '') {
              try {
                const avatarPath = data.avatar.startsWith('/') ? data.avatar : `/${data.avatar}`;
                // Use relative URL to avoid protocol/domain issues
                const fullUrl = `${avatarPath}?t=${Date.now()}`;

                // Set the URL immediately
                setAvatarUrl(fullUrl);
              } catch (error) {
                console.warn("Error processing avatar URL during refresh:", error);
                setAvatarUrl(null);
              }
            }
          }
        } catch (error) {
          console.error("Failed to refresh avatar:", error);
        }
      }
    };

    // Check immediately
    checkForAvatarUpdates();

    // Also set up an interval to check periodically
    const intervalId = setInterval(checkForAvatarUpdates, 5000);

    // Clean up
    return () => clearInterval(intervalId);
  }, [session]);

  // Display name fallback chain
  const displayName = userData?.displayName || session?.user?.name || session?.user?.email?.split('@')[0] || "User";

  // First letter for avatar fallback
  const firstLetter = displayName.charAt(0).toUpperCase();

  // Determine active link
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname?.startsWith(path);
  };

  return (
    <GlobalLoadingProvider>
      {/* Enhanced header with dynamic scroll behavior */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-black/80 backdrop-blur-lg h-16 shadow-xl shadow-black/30"
            : "bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md h-20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left section with logo and animated accent */}
          <div className="flex items-center">
            {/* Animated logo with pulsing glow */}
            <Link href="/" className="group flex items-center relative">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-indigo-600/20 via-purple-600/10 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl group-hover:blur-md"></div>
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-600/40 to-purple-600/40 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md"></div>
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-indigo-500 group-hover:text-indigo-400 transition-all duration-500 relative z-10" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-2 relative z-10">
                <span className="text-2xl font-light tracking-wide relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 group-hover:from-indigo-300 group-hover:via-purple-300 group-hover:to-fuchsia-300 transition-all duration-500 font-normal">and</span>
                  <span className="text-white group-hover:text-gray-200 transition-all duration-500">watch</span>
                </span>
                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 transition-all duration-700 transform -translate-y-1"></div>
              </div>
            </Link>

            {/* Main Navigation with animated indicators */}
            <nav className="hidden lg:flex ml-12">
              <div className="flex items-center space-x-1">
                <NavLink
                  href="/"
                  isActive={pathname === '/'}
                  label="Home"
                  icon={<HomeIcon />}
                />
                <NavLink
                  href="/anime"
                  isActive={isActive('/anime')}
                  label="Anime"
                  icon={<AnimeIcon />}
                  color="from-pink-600 to-rose-500"
                />
                <NavLink
                  href="/movies"
                  isActive={isActive('/movies')}
                  label="Movies"
                  icon={<MovieIcon />}
                  color="from-amber-600 to-orange-500"
                />
                <NavLink
                  href="/tvshows"
                  isActive={isActive('/tvshows')}
                  label="TV Shows"
                  icon={<TVIcon />}
                  color="from-sky-600 to-blue-500"
                />
                <NavLink
                  href="/about"
                  isActive={isActive('/about')}
                  label="About"
                  icon={<AboutIcon />}
                />
              </div>
            </nav>
          </div>

          {/* Right section with search and user menu */}
          <div className="flex items-center space-x-5">
            {/* Enhanced Search Button with glow effects */}
            <Link href="/search" className="relative p-2 text-gray-400 hover:text-white transition-colors duration-300 group">
              <div className="absolute inset-0 rounded-full bg-gray-800/0 group-hover:bg-gray-800/70 transition-all duration-300"></div>
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-md"></div>
              </div>
              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* User Section with enhanced dropdown */}
            {status === "authenticated" ? (
              <div className="relative group z-30">
                <button
                  className="flex items-center focus:outline-none"
                  aria-label="Open user menu"
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 border border-indigo-700/50 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all duration-500 transform group-hover:scale-105 relative">
                    <div className="absolute inset-0 z-10 overflow-hidden rounded-full">
                      <AvatarImage
                        src={avatarUrl}
                        alt={displayName}
                        fallbackText={firstLetter}
                        size={40}
                      />
                    </div>
                    <div className="absolute inset-0 rounded-full ring-0 ring-indigo-500/0 group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all duration-300"></div>
                  </div>
                </button>

                {/* Enhanced Dropdown Menu with better animations */}
                <div className="absolute right-0 top-full mt-3 w-72 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100 origin-top-right">
                  <div className="relative">
                    {/* Decorative gradient background */}
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg"></div>
                    <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/40 border border-gray-800/70 overflow-hidden">
                      {/* User info section with decorative background */}
                      <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"></div>
                        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
                        <div className="py-4 px-5 relative">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 border border-indigo-700/50 flex items-center justify-center shadow-inner shadow-black/10 relative">
                              <div className="absolute inset-0 overflow-hidden">
                                <AvatarImage
                                  src={avatarUrl}
                                  alt={displayName}
                                  fallbackText={firstLetter}
                                  size={48}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{displayName}</span>
                              <span className="text-xs text-gray-400 truncate max-w-[170px]">{session?.user?.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Decorative divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <MenuLink href="/profile" label="Profile" icon={<ProfileIcon />} />
                        <MenuLink href="/profile/history" label="Watch History" icon={<HistoryIcon />} />

                        {/* Divider */}
                        <div className="my-1 mx-4 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>

                        {/* Sign out button with hover effects */}
                        <div className="px-3 pt-1 pb-2">
                          <form action="/api/auth/signout" method="post" className="w-full">
                            <button type="submit" className="w-full group flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 rounded-lg transition-all duration-300 relative overflow-hidden">
                              <span className="absolute inset-0 bg-gradient-to-r from-rose-900/0 via-rose-900/0 to-rose-900/0 group-hover:from-rose-900/10 group-hover:via-rose-900/20 group-hover:to-rose-900/10 transition-all duration-500"></span>
                              <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="relative z-10">Sign Out</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-sm px-5 py-2 rounded-full bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700/40 hover:border-indigo-500/50 text-white hover:text-white transition-all duration-300 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/10 group-hover:to-indigo-600/20 transition-all duration-500"></span>
                  <p className="text-white relative z-10">Sign In</p>
                </Link>
                <Link
                  href="/auth/signup"
                  className="hidden sm:flex text-sm px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md hover:shadow-indigo-500/30 transition-all duration-300 relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-500"></span>
                  <span className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="absolute -inset-1 bg-gradient-to-r from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/20 group-hover:to-purple-600/20 blur-xl transition-all duration-500"></span>
                  </span>
                  <p className="text-white relative z-10">Sign Up</p>
                </Link>
              </div>
            )}

            {/* Mobile menu button with animated hamburger */}
            <button
              className="lg:hidden relative z-40 p-1.5 rounded-md focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ease-out ${mobileMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ease-out ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ease-out ${mobileMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Navigation Overlay with blur effects */}
          <div
            className={`lg:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-30 transition-all duration-500 ${
              mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-16 overflow-y-auto">
              <nav className="flex-1 flex flex-col justify-center space-y-2">
                <MobileNavLink
                  href="/"
                  label="Home"
                  icon={<HomeIcon />}
                  isActive={pathname === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink
                  href="/anime"
                  label="Anime"
                  icon={<AnimeIcon />}
                  isActive={isActive('/anime')}
                  color="bg-gradient-to-r from-pink-600 to-rose-500"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink
                  href="/movies"
                  label="Movies"
                  icon={<MovieIcon />}
                  isActive={isActive('/movies')}
                  color="bg-gradient-to-r from-amber-600 to-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink
                  href="/tvshows"
                  label="TV Shows"
                  icon={<TVIcon />}
                  isActive={isActive('/tvshows')}
                  color="bg-gradient-to-r from-sky-600 to-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink
                  href="/search"
                  label="Search"
                  icon={<SearchIcon />}
                  isActive={isActive('/search')}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavLink
                  href="/about"
                  label="About"
                  icon={<AboutIcon />}
                  isActive={isActive('/about')}
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Decorative divider */}
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto my-4"></div>

                {status === "authenticated" ? (
                  <>
                    <MobileNavLink
                      href="/profile"
                      label="Profile"
                      icon={<ProfileIcon />}
                      isActive={isActive('/profile')}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <MobileNavLink
                      href="/watchlist"
                      label="My Watchlist"
                      icon={<WatchlistIcon />}
                      isActive={isActive('/watchlist')}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="pt-4">
                      <form action="/api/auth/signout" method="post" className="w-full">
                        <button
                          type="submit"
                          className="w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 bg-rose-900/20 text-rose-400"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3 pt-4">
                    <Link
                      href="/auth/signin"
                      className="w-full py-3 rounded-lg flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="w-full py-3 rounded-lg flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with padding to account for fixed header */}
      <main className="pt-20 flex-1">
        {children}
      </main>

      {/* Quick Access Floating Action Button */}
      <QuickAccessFAB />

      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Keep the original footer */}
      <footer className="border-t border-gray-900/50 bg-gradient-to-b from-black/60 to-black/90 backdrop-blur-sm py-5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/30 blur-3xl animate-blob-slow"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-500/30 blur-3xl animate-blob-slow animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-800/10 blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Logo section with animation */}
            <div className="col-span-1">
              <Link href="/" className="flex items-center mb-3 group">
                <div className="relative">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-500 mr-1.5 group-hover:text-indigo-400 transition-colors duration-300" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 text-base font-semibold group-hover:from-white group-hover:to-gray-200 transition-all duration-300">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 group-hover:from-indigo-300 group-hover:to-purple-400 transition-all duration-300">and</span>
                  <span className="group-hover:tracking-wide transition-all duration-300">watch</span>
                </span>
              </Link>
              <p className="text-gray-500 text-xs leading-relaxed hover:text-gray-400 transition-colors duration-300">Track your anime and movies beautifully. Create personal collections and discover new content.</p>

              {/* Social links with enhanced hover effects */}
              <div className="flex space-x-3 mt-3">
                <a href="https://www.instagram.com/fartenadzeluka/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://www.facebook.com/luka.fartenadze.1" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="https://github.com/SetFodi" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-400 transition-all duration-300 transform hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links with hover effect */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3 relative inline-block">
                Explore
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Home</Link></li>
                <li><Link href="/anime" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Anime</Link></li>
                <li><Link href="/movies" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Movies</Link></li>
                <li><Link href="/about" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">About</Link></li>
              </ul>
            </div>

            {/* Account Links with hover effect */}
            <div>
              <h3 className="text-white text-sm font-medium mb-3 relative inline-block">
                Account
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </h3>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/profile" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Profile</Link></li>
                <li><Link href="/auth/signin" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Sign In</Link></li>
                <li><Link href="/auth/signup" prefetch={true} className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block">Sign Up</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom copyright with subtle animation */}
          <div className="mt-6 pt-4 border-t border-gray-900/70 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-500 text-xs">© {new Date().getFullYear()} AndWatch. All rights reserved.</p>
            <p className="text-gray-600 text-xs group">
              <span className="inline-block group-hover:animate-pulse-slow">Made with</span>
              <span className="inline-block text-red-500 mx-1 transform group-hover:scale-125 transition-transform duration-300">♥</span>
              <span className="inline-block group-hover:animate-pulse-slow">for anime & movie enthusiasts</span>
            </p>
          </div>
        </div>
      </footer>
    </GlobalLoadingProvider>
  );
}

// Enhanced Desktop Navigation Link Component with animations and prefetching
function NavLink({ href, icon, label, isActive, color = "from-indigo-600 to-violet-500" }: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  color?: string;
}) {
  return (
    <Link
      href={href}
      prefetch={true} // Enable prefetching for faster navigation
      className={`relative px-4 py-2 rounded-full text-sm transition-all duration-300 mx-1 group overflow-hidden flex items-center ${
        isActive
          ? `text-white bg-gradient-to-r ${color}`
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {/* Active indicator animations */}
      {!isActive && (
        <span className="absolute inset-0 bg-gray-800/0 group-hover:bg-gray-800/60 transition-all duration-300 rounded-full"></span>
      )}
      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-1/2 transition-all duration-500"></span>
      <span className="absolute bottom-0 right-1/2 transform translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-1/2 transition-all duration-500"></span>

      {/* Icon with subtle animation */}
      <span className={`mr-2 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
        {icon}
      </span>

      <span className={`transition-all duration-300 ${isActive ? 'font-medium' : 'group-hover:font-medium'}`}>
        {label}
      </span>

      {/* Animated glow effect on hover */}
      {isActive && (
        <span className="absolute inset-0 -z-10 opacity-25 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-sm"></span>
      )}
    </Link>
  );
}

// Enhanced Mobile Navigation Link with prefetching
function MobileNavLink({
  href,
  icon,
  label,
  isActive,
  color,
  onClick
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch={true} // Enable prefetching for faster navigation
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base relative overflow-hidden transition-all duration-300 ${
        isActive
          ? `${color || 'bg-gradient-to-r from-indigo-600 to-violet-500'} text-white`
          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
      }`}
      onClick={onClick}
    >
      <span className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className={`${isActive ? 'font-medium' : ''}`}>{label}</span>

      {/* Right arrow for active item */}
      {isActive && (
        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </Link>
  );
}

// Enhanced Menu Link with prefetching
function MenuLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      prefetch={true} // Enable prefetching for faster navigation
      className="flex items-center px-4 py-2.5 mx-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/70 rounded-lg transition-all duration-300 group relative overflow-hidden"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/10 group-hover:to-indigo-600/20 transition-all duration-500"></span>
      <span className="mr-3 text-gray-400 group-hover:text-indigo-400 transition-colors duration-300 transform group-hover:scale-110">
        {icon}
      </span>
      <span className="group-hover:translate-x-1 transition-transform duration-300">
        {label}
      </span>
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

function TVIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
