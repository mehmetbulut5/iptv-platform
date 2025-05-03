import axios from 'axios';
import { 
  XtreamCredentials, 
  XtreamUserInfo, 
  XtreamLiveCategory,
  XtreamMovieCategory,
  XtreamSeriesCategory,
  XtreamLiveStream,
  XtreamMovie,
  XtreamSeries,
  XtreamSeriesInfo,
  XtreamEPG
} from '../types/xtream';

class XtreamService {
  private baseUrl: string = '';
  private username: string = '';
  private password: string = '';

  constructor() {}
  
  /**
   * Helper method to create a proxy URL for API requests
   */
  private createProxyUrl(action?: string, params?: Record<string, any>): string {
    // Start with the base parameters
    const queryParams = new URLSearchParams({
      username: this.username,
      password: this.password,
      ...(action ? { action } : {}),
      ...(params || {})
    });
    
    // Create the target URL
    const targetUrl = `${this.baseUrl}/player_api.php?${queryParams.toString()}`;
    
    // Return the proxied URL
    return `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
  }

  /**
   * Set the credentials for the Xtream Codes API
   */
  setCredentials(credentials: XtreamCredentials): void {
    const { serverUrl, username, password } = credentials;
    
    // In development mode, use our mock API
    if (process.env.NODE_ENV === 'development' && 
        (serverUrl === 'http://example.com:8080' || serverUrl.includes('localhost'))) {
      this.baseUrl = '/api/mock';
    } else {
      // Remove trailing slash if present
      this.baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
    }
    
    this.username = username;
    this.password = password;
  }

  /**
   * Get the base URL for the Xtream Codes API
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check if credentials are set
   */
  hasCredentials(): boolean {
    return !!(this.baseUrl && this.username && this.password);
  }

  /**
   * Authenticate with the Xtream Codes API
   */
  async authenticate(): Promise<XtreamUserInfo> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl();
      console.log('Authentication URL:', proxyUrl);
      
      const response = await axios.get<XtreamUserInfo>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Failed to authenticate with Xtream Codes API');
    }
  }

  /**
   * Get live stream categories
   */
  async getLiveCategories(): Promise<XtreamLiveCategory[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_live_categories');
      const response = await axios.get<XtreamLiveCategory[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching live categories:', error);
      throw new Error('Failed to fetch live categories');
    }
  }

  /**
   * Get live streams by category
   */
  async getLiveStreamsByCategory(categoryId: number | string): Promise<XtreamLiveStream[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_live_streams', { category_id: categoryId });
      const response = await axios.get<XtreamLiveStream[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching live streams for category ${categoryId}:`, error);
      throw new Error(`Failed to fetch live streams for category ${categoryId}`);
    }
  }

  /**
   * Get all live streams
   */
  async getLiveStreams(): Promise<XtreamLiveStream[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_live_streams');
      const response = await axios.get<XtreamLiveStream[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching all live streams:', error);
      throw new Error('Failed to fetch all live streams');
    }
  }

  /**
   * Get movie categories
   */
  async getMovieCategories(): Promise<XtreamMovieCategory[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_vod_categories');
      const response = await axios.get<XtreamMovieCategory[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie categories:', error);
      throw new Error('Failed to fetch movie categories');
    }
  }

  /**
   * Get movies by category
   */
  async getMoviesByCategory(categoryId: string): Promise<XtreamMovie[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_vod_streams', { category_id: categoryId });
      const response = await axios.get<XtreamMovie[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movies for category ${categoryId}:`, error);
      throw new Error(`Failed to fetch movies for category ${categoryId}`);
    }
  }

  /**
   * Get all movies
   */
  async getMovies(): Promise<XtreamMovie[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_vod_streams');
      const response = await axios.get<XtreamMovie[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw new Error('Failed to fetch all movies');
    }
  }

  /**
   * Get movie info
   */
  async getMovieInfo(movieId: number): Promise<XtreamMovie> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_vod_info', { vod_id: movieId });
      const response = await axios.get<XtreamMovie>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching movie info for ID ${movieId}:`, error);
      throw new Error(`Failed to fetch movie info for ID ${movieId}`);
    }
  }

  /**
   * Get series categories
   */
  async getSeriesCategories(): Promise<XtreamSeriesCategory[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_series_categories');
      const response = await axios.get<XtreamSeriesCategory[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching series categories:', error);
      throw new Error('Failed to fetch series categories');
    }
  }

  /**
   * Get series by category
   */
  async getSeriesByCategory(categoryId: string): Promise<XtreamSeries[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_series', { category_id: categoryId });
      const response = await axios.get<XtreamSeries[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching series for category ${categoryId}:`, error);
      throw new Error(`Failed to fetch series for category ${categoryId}`);
    }
  }

  /**
   * Get all series
   */
  async getSeries(): Promise<XtreamSeries[]> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_series');
      const response = await axios.get<XtreamSeries[]>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching all series:', error);
      throw new Error('Failed to fetch all series');
    }
  }

  /**
   * Get series info
   */
  async getSeriesInfo(seriesId: number): Promise<XtreamSeriesInfo> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_series_info', { series_id: seriesId });
      const response = await axios.get<XtreamSeriesInfo>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching series info for ID ${seriesId}:`, error);
      throw new Error(`Failed to fetch series info for ID ${seriesId}`);
    }
  }

  /**
   * Get EPG for a specific channel
   */
  async getEPG(streamId: number): Promise<XtreamEPG> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_short_epg', { stream_id: streamId });
      const response = await axios.get<XtreamEPG>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching EPG for stream ID ${streamId}:`, error);
      throw new Error(`Failed to fetch EPG for stream ID ${streamId}`);
    }
  }

  /**
   * Get EPG for a specific channel for a specific time period
   */
  async getEPGForPeriod(streamId: number, limit: number): Promise<XtreamEPG> {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    try {
      const proxyUrl = this.createProxyUrl('get_short_epg', { 
        stream_id: streamId,
        limit: limit 
      });
      const response = await axios.get<XtreamEPG>(proxyUrl);
      return response.data;
    } catch (error) {
      console.error(`Error fetching EPG for stream ID ${streamId} with limit ${limit}:`, error);
      throw new Error(`Failed to fetch EPG for stream ID ${streamId} with limit ${limit}`);
    }
  }

  /**
   * Get the URL for a live stream
   */
  getLiveStreamUrl(streamId: number): string {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    const directUrl = `${this.baseUrl}/live/${this.username}/${this.password}/${streamId}.m3u8`;
    return `/api/proxy?url=${encodeURIComponent(directUrl)}`;
  }

  /**
   * Get the URL for a movie
   */
  getMovieUrl(movieId: number, extension: string = 'mp4'): string {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    const directUrl = `${this.baseUrl}/movie/${this.username}/${this.password}/${movieId}.${extension}`;
    return `/api/proxy?url=${encodeURIComponent(directUrl)}`;
  }

  /**
   * Get the URL for a series episode
   */
  getSeriesUrl(episodeId: string, extension: string = 'mp4'): string {
    if (!this.hasCredentials()) {
      throw new Error('Credentials not set');
    }

    const directUrl = `${this.baseUrl}/series/${this.username}/${this.password}/${episodeId}.${extension}`;
    return `/api/proxy?url=${encodeURIComponent(directUrl)}`;
  }
}

// Export a singleton instance
export const xtreamService = new XtreamService();