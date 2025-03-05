"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState({
    displayName: "",
    avatar: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserData(session.user.id);
    }
  }, [status, session, router]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      setUserData({
        displayName: data.displayName || "",
        avatar: data.avatar || "",
        bio: data.bio || "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!session?.user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      setSuccess("Profile updated successfully!");
      setTimeout(() => router.push("/profile"), 2000); // Redirect after 2 seconds
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-gray-400 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="w-full max-w-md bg-gray-900/70 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-6">
          Edit Profile
        </h1>

        {error && <div className="text-red-400 mb-4">{error}</div>}
        {success && <div className="text-green-400 mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={userData.displayName}
              onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-300">
              Avatar URL
            </label>
            <input
              type="text"
              id="avatar"
              value={userData.avatar}
              onChange={(e) => setUserData({ ...userData, avatar: e.target.value })}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter image URL (e.g., https://example.com/avatar.jpg)"
            />
            {userData.avatar && (
              <div className="mt-2 relative w-24 h-24">
                <Image
                  src={userData.avatar}
                  alt="Avatar Preview"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              value={userData.bio}
              onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg py-3 text-white font-medium hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}