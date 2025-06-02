/**
 * This file contains services for external API integrations
 * - Jikan API for anime data (unofficial MyAnimeList API)
 * - TMDB API for movie and TV show data
 */

// Base API URLs
const JIKAN_BASE_URL = "https://api.jikan.moe/v4";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.warn("Warning: TMDB_API_KEY is not defined. Movie and TV show features may not work properly.");
}

// Anime API (Jikan/MyAnimeList)
export const animeApi = {
  async searchAnime(query: string, page = 1) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    return await response.json();
  },

  async getSeasonalAnime(year = new Date().getFullYear(), season = getCurrentSeason()) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/seasons/${year}/${season}`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },

  async getTopAnime(page = 1) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/top/anime?page=${page}&limit=20`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },

  async getAnimeById(id: string | number) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime/${id}/full`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },

  async getAnimeByGenre(genreId: number, page = 1) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?genres=${genreId}&page=${page}&limit=20`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
};

// TMDB API (Movies and TV Shows)
export const tmdbApi = {
  // Movies
  async getMovieById(id: string | number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,similar,videos`,
        { next: { revalidate: 86400 } }
      );
      if (!response.ok) throw new Error(`Failed to fetch movie: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching movie details:", error);
      return null;
    }
  },

  async getMovieExternalIds(id: string | number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${id}/external_ids?api_key=${TMDB_API_KEY}`,
        { next: { revalidate: 86400 } }
      );
      if (!response.ok) throw new Error(`Failed to fetch external IDs: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching external IDs:", error);
      return null;
    }
  },

  async getPopularMovies(page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    return await response.json();
  },

  async getTopRatedMovies(page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    return await response.json();
  },

  async getMoviesByGenre(genreId: number, page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    return await response.json();
  },

  async searchMovies(query: string, page = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
        { next: { revalidate: 3600 } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("TMDB searchMovies error:", error);
      return { results: [], page: 1, total_pages: 1 };
    }
  },

  // TV Shows
  async getTVShowById(id: string | number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,similar,videos`,
        { next: { revalidate: 86400 } }
      );
      if (!response.ok) throw new Error(`Failed to fetch TV show: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      return null;
    }
  },

  async getTVShowExternalIds(id: string | number) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/tv/${id}/external_ids?api_key=${TMDB_API_KEY}`,
        { next: { revalidate: 86400 } }
      );
      if (!response.ok) throw new Error(`Failed to fetch external IDs: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching external IDs:", error);
      return null;
    }
  },

  async getPopularTVShows(page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    return await response.json();
  },

  async getTopRatedTVShows(page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    return await response.json();
  },

  async getTVShowsByGenre(genreId: number, page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`,
      { next: { revalidate: 86400 } }
    );
    return await response.json();
  },

  async searchTVShows(query: string, page = 1) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
        { next: { revalidate: 3600 } }
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("TMDB searchTVShows error:", error);
      return { results: [], page: 1, total_pages: 1 };
    }
  },

  // Helper function for image URLs
  getImageUrl(path: string | null) {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  },
};

// Helper function to get current season
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "fall";
}