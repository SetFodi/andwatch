'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function QuickAccessFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // Don't show FAB on these paths
  const excludedPaths = ['/auth/signin', '/auth/signup'];
  const shouldShowOnPath = !excludedPaths.some(path => pathname?.startsWith(path));

  useEffect(() => {
    const handleScroll = () => {
      // Show FAB after scrolling down 300px
      setShowFAB(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (!shouldShowOnPath) return null;

  return (
    <>
      {/* Backdrop for when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <AnimatePresence>
        {showFAB && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center relative overflow-hidden group"
              aria-label="Quick access menu"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/10 transition-all duration-300"></span>
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </motion.div>
            </button>

            {/* Quick access menu items */}
            <AnimatePresence>
              {isOpen && (
                <div className="absolute bottom-16 right-0 mb-2">
                  <div className="flex flex-col items-end space-y-2">
                    {/* Search */}
                    <QuickMenuItem 
                      href="/search" 
                      label="Search" 
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      } 
                      color="from-indigo-600 to-purple-600"
                      index={0}
                    />

                    {/* Profile or Sign In */}
                    {session ? (
                      <QuickMenuItem 
                        href="/profile" 
                        label="Profile" 
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        } 
                        color="from-blue-600 to-indigo-600"
                        index={1}
                      />
                    ) : (
                      <QuickMenuItem 
                        href="/auth/signin" 
                        label="Sign In" 
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        } 
                        color="from-blue-600 to-indigo-600"
                        index={1}
                      />
                    )}

                    {/* Completed */}
                    {session && (
                      <QuickMenuItem 
                        href="/profile/completed" 
                        label="Completed" 
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        } 
                        color="from-emerald-600 to-teal-600"
                        index={2}
                      />
                    )}

                    {/* Scroll to top */}
                    <QuickMenuItem 
                      href="#" 
                      label="Top" 
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                        </svg>
                      } 
                      color="from-gray-600 to-gray-700"
                      index={session ? 3 : 2}
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setIsOpen(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface QuickMenuItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  index: number;
  onClick?: () => void;
}

function QuickMenuItem({ href, label, icon, color, index, onClick }: QuickMenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <Link 
        href={href}
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
      >
        <span>{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    </motion.div>
  );
}
