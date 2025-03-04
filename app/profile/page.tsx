import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Profile() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Profile</h1>
      <p>Email: {session.user?.email}</p>
      <div className="mt-8">
        <h2 className="text-2xl">Watching</h2>
        {/* Fetch from DB */}
        <h2 className="text-2xl mt-4">Plan to Watch</h2>
        {/* Fetch from DB */}
        <h2 className="text-2xl mt-4">Watched</h2>
        {/* Fetch from DB */}
      </div>
    </div>
  );
}