'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarImage from '@/components/ui/AvatarImage';

export default function EnhancedHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ avatar?: string; displayName?: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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

            // Process avatar URL
            if (data.avatar && data.avatar.trim() !== '') {
              const avatarPath = data.avatar.startsWith('/') ? data.avatar : `/${data.avatar}`;
              const fullUrl = `${avatarPath}?t=${Date.now()}`;
              setAvatarUrl(fullUrl);
            }
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

  // Check for avatar updates
  useEffect(() => {
    const checkForAvatarUpdates = () => {
      const avatarUpdated = localStorage.getItem('avatarUpdated');
      if (avatarUpdated && session?.user?.id) {
        localStorage.removeItem('avatarUpdated');
        // Refetch user data
        fetchUserData();
      }
    };

    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/user/${session.user.id}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);

            if (data.avatar && data.avatar.trim() !== '') {
              const avatarPath = data.avatar.startsWith('/') ? data.avatar : `/${data.avatar}`;
              const fullUrl = `${avatarPath}?t=${Date.now()}`;
              setAvatarUrl(fullUrl);
            }
          }
        } catch (error) {
          console.error("Failed to refresh avatar:", error);
        }
      }
    };

    // Check immediately
    checkForAvatarUpdates();

    // Set up interval to check periodically
    const intervalId = setInterval(checkForAvatarUpdates, 5000);
    return () => clearInterval(intervalId);
  }, [session]);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Navigation items with dropdown menus
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Discover',
      dropdown: 'discover',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      items: [
        { name: 'Anime', path: '/anime' },
        { name: 'Movies', path: '/movies' },
        { name: 'TV Shows', path: '/tvshows' },
        { name: 'Search', path: '/search' },
      ],
    },
    {
      name: 'Profile',
      dropdown: 'profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      items: [
        { name: 'My Profile', path: '/profile' },
        { name: 'Watching', path: '/profile/watching' },
        { name: 'Completed', path: '/profile/completed' },
        { name: 'Planning', path: '/profile/planning' },
      ],
    },
  ];

  // Toggle dropdown menu
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Check if a path is active
  const isActivePath = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-lg shadow-lg'
          : 'bg-gradient-to-b from-black/90 to-black/0'
      }`}
    >
      {/* Animated top accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          animate={{
            x: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 8,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-lg">A</span>
            </motion.div>
            <motion.span
              className="text-white font-bold text-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Andwatch
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.path ? (
                  <Link
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActivePath(item.path)
                        ? 'text-white bg-gray-800/50'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleDropdown(item.dropdown!)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeDropdown === item.dropdown || pathname?.includes(`/${item.dropdown}`)
                        ? 'text-white bg-gray-800/50'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                    }`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    <span>{item.name}</span>
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.dropdown ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.dropdown && (
                  <AnimatePresence>
                    {activeDropdown === item.dropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-1 w-48 rounded-xl bg-gray-900/90 backdrop-blur-lg shadow-xl border border-gray-800/50 overflow-hidden z-50"
                      >
                        <div className="py-1">
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.path}
                              className={`block px-4 py-2 text-sm ${
                                isActivePath(subItem.path)
                                  ? 'text-white bg-indigo-600/20'
                                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative w-8 h-8 rounded-full border-2 border-indigo-500/50 overflow-hidden"
                  >
                    <AvatarImage
                      src={avatarUrl || session.user?.image || null}
                      alt={userData?.displayName || session.user?.name || "User"}
                      fallbackText={(userData?.displayName || session.user?.name || "U").charAt(0).toUpperCase()}
                      size={32}
                      className="rounded-full"
                    />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-gray-900/90 backdrop-blur-lg shadow-xl border border-gray-800/50 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-800/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/30">
                            <AvatarImage
                              src={avatarUrl || session.user?.image || null}
                              alt={userData?.displayName || session.user?.name || "User"}
                              fallbackText={(userData?.displayName || session.user?.name || "U").charAt(0).toUpperCase()}
                              size={40}
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium truncate">{userData?.displayName || session.user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        >
                          Your Profile
                        </Link>
                        <Link
                          href="/profile/edit"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white"
                        >
                          Settings
                        </Link>
                        <Link
                          href="/auth/signout"
                          className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-800/50 hover:text-red-300"
                        >
                          Sign out
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="px-3 py-1.5 text-sm text-white bg-gray-800/50 hover:bg-gray-800/80 rounded-lg transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/20"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-4 md:hidden text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-800/50"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.path ? (
                    <Link
                      href={item.path}
                      className={`flex items-center px-3 py-2 rounded-lg text-base font-medium ${
                        isActivePath(item.path)
                          ? 'text-white bg-gray-800/70'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.dropdown!)}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-base font-medium ${
                          activeDropdown === item.dropdown
                            ? 'text-white bg-gray-800/70'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.name}</span>
                        </div>
                        <svg
                          className={`w-5 h-5 transition-transform duration-200 ${
                            activeDropdown === item.dropdown ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      <AnimatePresence>
                        {activeDropdown === item.dropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-1 pl-10 space-y-1"
                          >
                            {item.items?.map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.path}
                                className={`block px-3 py-2 rounded-lg text-sm ${
                                  isActivePath(subItem.path)
                                    ? 'text-white bg-indigo-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                }`}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
