// lib/services/api.ts
/**
 * This file contains services for external API integrations
 * - Jikan API for anime data (unofficial MyAnimeList API)
 * - TMDB API for movie data
 */

// Base API URLs
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''; // Get from environment variables

// Anime API (Jikan/MyAnimeList)
export const animeApi = {
  // Search anime
  async searchAnime(query: string, page = 1) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    return await response.json();
  },
  
  // Get seasonal anime
  async getSeasonalAnime(year = new Date().getFullYear(), season = getCurrentSeason()) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/seasons/${year}/${season}`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Get top anime
  async getTopAnime(page = 1) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/top/anime?page=${page}&limit=20`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Get anime by ID
  async getAnimeById(id: string | number) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime/${id}/full`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Get anime by genre
  async getAnimeByGenre(genreId: number, page = 1) {
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?genres=${genreId}&page=${page}&limit=20`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
};

// Movie API (TMDB)
export const movieApi = {
  // Search movies
  async searchMovies(query: string, page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    return await response.json();
  },
  
  // Get popular movies
  async getPopularMovies(page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Get top rated movies
  async getTopRatedMovies(page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Get movie by ID
  async getMovieById(id: string | number) {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,similar,videos`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Get movies by genre
  async getMoviesByGenre(genreId: number, page = 1) {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`,
      { next: { revalidate: 86400 } } // Cache for 1 day
    );
    return await response.json();
  },
  
  // Helper function to get full image URL
  getImageUrl(path: string | null) {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}${path}`;
  }
};

// Helper function to get current season
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'fall';
}