import axios from 'axios';
import { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBSeason, 
  TMDBCredits, 
  TMDBSearchResult 
} from '../types/tmdb';

// TMDB API configuration
const TMDB_API_KEY = '42125c682636b68d10d70b487c692685';
const TMDB_API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0MjEyNWM2ODI2MzZiNjhkMTBkNzBiNDg3YzY5MjY4NSIsIm5iZiI6MS42NDM4MjA2NjA2OTUwMDAyZSs5LCJzdWIiOiI2MWZhYjY3NGI3YWJiNTAwNjY1YWQ4MzAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.e06dzH5trScMiz7obFbCFip5dO1XQp-bUC3lecJ8sxU';
const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance with default config
const tmdbAxios = axios.create({
  baseURL: TMDB_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TMDB_API_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8',
  },
});

class TMDBService {
  /**
   * Get movie details by TMDB ID
   */
  async getMovie(movieId: string | number): Promise<TMDBMovie> {
    try {
      const response = await tmdbAxios.get<TMDBMovie>(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie with ID ${movieId}:`, error);
      throw new Error(`Failed to fetch movie with ID ${movieId}`);
    }
  }

  /**
   * Get movie credits (cast and crew) by TMDB ID
   */
  async getMovieCredits(movieId: string | number): Promise<TMDBCredits> {
    try {
      const response = await tmdbAxios.get<TMDBCredits>(`/movie/${movieId}/credits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching credits for movie with ID ${movieId}:`, error);
      throw new Error(`Failed to fetch credits for movie with ID ${movieId}`);
    }
  }

  /**
   * Get similar movies by TMDB ID
   */
  async getSimilarMovies(movieId: string | number): Promise<TMDBSearchResult<TMDBMovie>> {
    try {
      const response = await tmdbAxios.get<TMDBSearchResult<TMDBMovie>>(`/movie/${movieId}/similar`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching similar movies for ID ${movieId}:`, error);
      throw new Error(`Failed to fetch similar movies for ID ${movieId}`);
    }
  }

  /**
   * Get TV show details by TMDB ID
   */
  async getTVShow(tvId: string | number): Promise<TMDBTVShow> {
    try {
      const response = await tmdbAxios.get<TMDBTVShow>(`/tv/${tvId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching TV show with ID ${tvId}:`, error);
      throw new Error(`Failed to fetch TV show with ID ${tvId}`);
    }
  }

  /**
   * Get TV show credits (cast and crew) by TMDB ID
   */
  async getTVShowCredits(tvId: string | number): Promise<TMDBCredits> {
    try {
      const response = await tmdbAxios.get<TMDBCredits>(`/tv/${tvId}/credits`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching credits for TV show with ID ${tvId}:`, error);
      throw new Error(`Failed to fetch credits for TV show with ID ${tvId}`);
    }
  }

  /**
   * Get TV show season details by TMDB ID and season number
   */
  async getTVSeason(tvId: string | number, seasonNumber: number): Promise<TMDBSeason> {
    try {
      const response = await tmdbAxios.get<TMDBSeason>(`/tv/${tvId}/season/${seasonNumber}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching season ${seasonNumber} for TV show with ID ${tvId}:`, error);
      throw new Error(`Failed to fetch season ${seasonNumber} for TV show with ID ${tvId}`);
    }
  }

  /**
   * Get similar TV shows by TMDB ID
   */
  async getSimilarTVShows(tvId: string | number): Promise<TMDBSearchResult<TMDBTVShow>> {
    try {
      const response = await tmdbAxios.get<TMDBSearchResult<TMDBTVShow>>(`/tv/${tvId}/similar`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching similar TV shows for ID ${tvId}:`, error);
      throw new Error(`Failed to fetch similar TV shows for ID ${tvId}`);
    }
  }

  /**
   * Search for movies by title
   */
  async searchMovies(query: string, page: number = 1): Promise<TMDBSearchResult<TMDBMovie>> {
    try {
      const response = await tmdbAxios.get<TMDBSearchResult<TMDBMovie>>('/search/movie', {
        params: {
          query,
          page,
          include_adult: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching for movies with query "${query}":`, error);
      throw new Error(`Failed to search for movies with query "${query}"`);
    }
  }

  /**
   * Search for TV shows by title
   */
  async searchTVShows(query: string, page: number = 1): Promise<TMDBSearchResult<TMDBTVShow>> {
    try {
      const response = await tmdbAxios.get<TMDBSearchResult<TMDBTVShow>>('/search/tv', {
        params: {
          query,
          page,
          include_adult: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching for TV shows with query "${query}":`, error);
      throw new Error(`Failed to search for TV shows with query "${query}"`);
    }
  }

  /**
   * Get the full image URL for a poster or backdrop
   */
  getImageUrl(path: string | null, size: 'original' | 'w500' | 'w780' | 'w1280' = 'w500'): string | null {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }

  /**
   * Find a movie or TV show by external ID (e.g., IMDB ID)
   */
  async findByExternalId(externalId: string, externalSource: 'imdb_id' | 'tvdb_id' | 'freebase_mid' | 'freebase_id' | 'tvrage_id') {
    try {
      const response = await tmdbAxios.get('/find/' + externalId, {
        params: {
          external_source: externalSource,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error finding content with external ID ${externalId}:`, error);
      throw new Error(`Failed to find content with external ID ${externalId}`);
    }
  }
}

// Export a singleton instance
export const tmdbService = new TMDBService();