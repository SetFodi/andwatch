"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState({
    displayName: "",
    avatar: "",
    bio: "",
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

      if (data.avatar) {
        // Add timestamp to prevent caching issues
        setPreviewAvatar(`${process.env.NEXT_PUBLIC_BASE_URL || ''}${data.avatar}?t=${Date.now()}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);

      console.log("Selected file:", file.name, file.size, file.type);
    } else {
      console.log("No file selected");
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

    const formData = new FormData();
    formData.append("displayName", userData.displayName);
    formData.append("bio", userData.bio);

    // Only append the file if one was selected
    if (selectedFile) {
      formData.append("avatar", selectedFile);
      console.log("Appending file to FormData:", selectedFile.name);
    }

    try {
      // Log formData to confirm contents (for debugging)
      console.log("FormData entries:", [...formData.entries()].map(([key]) => key));

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: "PUT",
        body: formData,
        // Don't set Content-Type header, the browser will set it with the boundary
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile");
      }

      setSuccess(responseData.message || "Profile updated successfully!");

      // If we got a new avatar path, update it
      if (responseData.avatar) {
        // Update the avatar with a timestamp to force refresh
        const newAvatarPath = responseData.avatar;
        setUserData(prev => ({ ...prev, avatar: newAvatarPath }));

        // Force a refresh of the avatar preview with timestamp
        setPreviewAvatar(`${process.env.NEXT_PUBLIC_BASE_URL || ''}${newAvatarPath}?t=${Date.now()}`);

        // Store a refresh flag in localStorage to tell other components to refresh the avatar
        localStorage.setItem('avatarUpdated', Date.now().toString());
      }

      // Navigate back to profile after a short delay
      setTimeout(() => {
        // Force a full page refresh to ensure all components update with the new avatar
        // Add a cache-busting parameter to ensure the browser doesn't use cached resources
        window.location.href = `/profile?refresh=${Date.now()}`;
      }, 2000);
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
              Profile Picture
            </label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {previewAvatar && (
              <div className="mt-2 relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
                <div
                  className="w-full h-full bg-cover bg-center rounded-full"
                  style={{ backgroundImage: `url(${previewAvatar})` }}
                ></div>
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