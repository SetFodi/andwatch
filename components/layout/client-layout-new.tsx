// components/layout/client-layout-new.tsx
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

  return (
    <GlobalLoadingProvider>
      {/* Enhanced Animated Header */}
      <EnhancedHeader />

      {/* Main content with padding to account for fixed header */}
      <main className="pt-20 flex-1">
        {children}
      </main>

      {/* Quick Access Floating Action Button */}
      <QuickAccessFAB />
      
      {/* Back to Top Button */}
      <BackToTopButton />

      {/* Enhanced Animated Footer */}
      <EnhancedFooter />
    </GlobalLoadingProvider>
  );
}
