// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from 'next/navigation';

export const metadata = {
  title: "AndWatch",
  description: "Track your anime and movies beautifully.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Wrap the getServerSession call in a try/catch to handle potential errors
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error fetching session:", error);
    session = null;
  }

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <nav className="p-4 bg-gray-800">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">AndWatch</Link>
            <div className="flex items-center space-x-4">
              <Link href="/anime" className="hover:text-blue-400">Anime</Link>
              <Link href="/movies" className="hover:text-blue-400">Movies</Link>
              
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link href="/profile" className="hover:text-blue-400">Profile</Link>
                  <form action="/api/auth/signout" method="post">
                    <button type="submit" className="p-2 bg-red-600 rounded hover:bg-red-700">
                      Sign Out
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/auth/signin" className="p-2 bg-blue-600 rounded hover:bg-blue-700">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}