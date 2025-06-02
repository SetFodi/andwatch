import { NextRequest, NextResponse } from "next/server";
import { tmdbApi } from "../../../../lib/services/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'movies';
  const page = parseInt(searchParams.get('page') || '1');

  try {
    let result;
    if (type === 'movies') {
      result = await tmdbApi.getPopularMovies(page);
    } else if (type === 'tv') {
      result = await tmdbApi.getPopularTVShows(page);
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Popular content error:', error);
    return NextResponse.json({ error: 'Failed to fetch popular content' }, { status: 500 });
  }
}
