// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Providers from "./providers";
import ClientLayout from "@/components/layout/client-layout-new";

export const metadata = {
  title: "AndWatch | Track Movies & Anime",
  description: "Track your anime and movies beautifully. Create watchlists, rate content, and discover new favorites.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Get session on server
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white min-h-screen flex flex-col font-sans">
        <Providers session={session}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}