import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AnimeList() {
  const session = await getServerSession(authOptions);

  // Placeholder data (replace with MongoDB fetch)
  const animeList = [
    { id: "1", title: "Naruto", synopsis: "A ninja story...", rating: 8.5 },
    { id: "2", title: "One Piece", synopsis: "Pirate adventures...", rating: 9.0 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Anime List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animeList.map((anime) => (
          <Link href={`/anime/${anime.id}`} key={anime.id}>
            <div className="p-4 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
              <h2 className="text-xl font-semibold">{anime.title}</h2>
              <p className="text-gray-400">{anime.synopsis}</p>
              <p className="mt-2">Rating: {anime.rating}/10</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}