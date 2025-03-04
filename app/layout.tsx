import { ReactNode } from "react";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

export const metadata = {
  title: "AndWatch",
  description: "Track your anime and movies beautifully.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <nav className="p-4 bg-gray-800">
          <div className="max-w-7xl mx-auto flex justify-between">
            <a href="/" className="text-2xl font-bold">AndWatch</a>
            <div>
              {session ? (
                <>
                  <a href="/profile" className="mr-4">Profile</a>
                  <button onClick={() => fetch("/api/auth/signout")} className="p-2 bg-red-600 rounded">Sign Out</button>
                </>
              ) : (
                <a href="/auth/signin" className="p-2 bg-blue-600 rounded">Sign In</a>
              )}
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}