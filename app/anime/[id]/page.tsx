"use client";
import { useSession } from "next-auth/react";

export default function AnimeDetails({ params }: { params: { id: string } }) {
  const { data: session } = useSession();

  // Placeholder data (fetch from MongoDB in real app)
  const anime = { id: params.id, title: "Naruto", synopsis: "A ninja story...", rating: 8.5 };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>
      <p className="text-gray-400 mb-4">{anime.synopsis}</p>
      <p>Rating: {anime.rating}/10</p>
      {session && (
        <div className="mt-4 space-x-2">
          <button className="p-2 bg-green-600 rounded hover:bg-green-700">Watching</button>
          <button className="p-2 bg-yellow-600 rounded hover:bg-yellow-700">Plan to Watch</button>
          <button className="p-2 bg-blue-600 rounded hover:bg-blue-700">Watched</button>
        </div>
      )}
    </div>
  );
}