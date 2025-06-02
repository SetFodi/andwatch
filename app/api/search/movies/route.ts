import { NextRequest, NextResponse } from "next/server";
import { tmdbApi } from "../../../../lib/services/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const result = await tmdbApi.searchMovies(query, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Movie search error:', error);
    return NextResponse.json({ error: 'Failed to search movies' }, { status: 500 });
  }
}
