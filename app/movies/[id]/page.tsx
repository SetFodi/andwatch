// app/movies/[id]/page.tsx
import MovieDetailsClient from "./MovieDetailsClient";

export default function Page({ params }: { params: { id: string } }) {
  // Directly pass the resolved id to the client component
  return <MovieDetailsClient id={params.id} />;
}
