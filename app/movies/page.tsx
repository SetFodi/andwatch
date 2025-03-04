// movies/page.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function MoviesList() {
  const session = await getServerSession(authOptions);
  
  // In a real app, fetch this from your MongoDB
  const moviesList = [
    { id: "1", title: "Inception", synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology...", rating: 8.8 },
    { id: "2", title: "The Shawshank Redemption", synopsis: "Two imprisoned men bond over a number of years...", rating: 9.3 },
    { id: "3", title: "The Dark Knight", synopsis: "When the menace known as the Joker wreaks havoc...", rating: 9.0 },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Movies List</h1>
        {session && (
          <Link href="/movies/add">
            <button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition">
              Add New Movie
            </button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moviesList.map((movie) => (
          <Link href={`/movies/${movie.id}`} key={movie.id}>
            <div className="p-4 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
              <h2 className="text-xl font-semibold">{movie.title}</h2>
              <p className="text-gray-400 line-clamp-2">{movie.synopsis}</p>
              <p className="mt-2">Rating: {movie.rating}/10</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}