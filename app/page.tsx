import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-8 animate-pulse">Welcome to AndWatch</h1>
      <div className="flex space-x-8">
        <Link href="/anime">
          <div className="p-6 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 cursor-pointer">
            <h2 className="text-2xl">Anime List</h2>
          </div>
        </Link>
        <Link href="/movies">
          <div className="p-6 bg-red-600 rounded-lg shadow-lg hover:bg-red-700 transition transform hover:scale-105 cursor-pointer">
            <h2 className="text-2xl">Movies List</h2>
          </div>
        </Link>
      </div>
    </div>
  );
}