import { NextRequest, NextResponse } from 'next/server';
import { 
  mockUserInfo, 
  mockLiveCategories, 
  mockLiveStreams, 
  mockMovieCategories, 
  mockMovies, 
  mockSeriesCategories, 
  mockSeries, 
  mockSeriesInfo, 
  mockEPG 
} from '@/app/lib/mock/mock-data';

export async function GET(request: NextRequest) {
  // Get the URL parameters
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const action = searchParams.get('action');
  
  // Accept any credentials in development mode
  if (process.env.NODE_ENV === 'development' || (username && password)) {
    // Credentials provided or in development mode, proceed with mock data
    console.log('Mock API: Using credentials', { username: username || 'development_mode' });
  } else {
    // No credentials provided in production
    return NextResponse.json({ user_info: { auth: 0, status: 'Invalid credentials' } });
  }
  
  // Handle different API actions
  switch (action) {
    case undefined:
      // Authentication request (no action specified)
      return NextResponse.json(mockUserInfo);
      
    case 'get_live_categories':
      return NextResponse.json(mockLiveCategories);
      
    case 'get_live_streams':
      const liveCategoryId = searchParams.get('category_id');
      if (liveCategoryId) {
        // Filter streams by category
        const filteredStreams = mockLiveStreams.filter(
          stream => stream.category_id === liveCategoryId
        );
        return NextResponse.json(filteredStreams);
      }
      return NextResponse.json(mockLiveStreams);
      
    case 'get_vod_categories':
      return NextResponse.json(mockMovieCategories);
      
    case 'get_vod_streams':
      const movieCategoryId = searchParams.get('category_id');
      if (movieCategoryId) {
        // Filter movies by category
        const filteredMovies = mockMovies.filter(
          movie => movie.category_id === movieCategoryId
        );
        return NextResponse.json(filteredMovies);
      }
      return NextResponse.json(mockMovies);
      
    case 'get_vod_info':
      const vodId = searchParams.get('vod_id');
      const movie = mockMovies.find(m => m.stream_id.toString() === vodId);
      return NextResponse.json(movie || {});
      
    case 'get_series_categories':
      return NextResponse.json(mockSeriesCategories);
      
    case 'get_series':
      const seriesCategoryId = searchParams.get('category_id');
      if (seriesCategoryId) {
        // Filter series by category
        const filteredSeries = mockSeries.filter(
          series => series.category_id === seriesCategoryId
        );
        return NextResponse.json(filteredSeries);
      }
      return NextResponse.json(mockSeries);
      
    case 'get_series_info':
      const seriesId = searchParams.get('series_id');
      if (seriesId === '201') {
        return NextResponse.json(mockSeriesInfo);
      }
      return NextResponse.json({ info: {}, episodes: {} });
      
    case 'get_short_epg':
      return NextResponse.json(mockEPG);
      
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}