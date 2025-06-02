// app/auth/signout/page.tsx
"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function SignOut() {
  useEffect(() => {
    // Automatically sign out when the page loads
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Card with glassmorphism effect */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-md"></div>
          <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-black/40 border border-gray-800/70 overflow-hidden p-8">
            {/* Header with logo and animation */}
            <div className="text-center mb-6">
              <Link href="/" className="inline-block group">
                <div className="flex items-center justify-center">
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
                  </div>
                </div>
              </Link>
              <h1 className="mt-4 text-2xl font-light tracking-wide text-white">Signing Out</h1>
              <p className="mt-1 text-sm text-gray-400">You are being signed out...</p>
            </div>
            
            {/* Loading indicator */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center">
                <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                If you are not redirected automatically,{" "}
                <Link href="/" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium hover:underline">
                  click here to go home
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright text */}
        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} AndWatch. All rights reserved.
        </p>
      </div>
    </div>
  );
}
