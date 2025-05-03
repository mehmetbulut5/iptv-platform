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
  
  // Check for stream requests
  const streamId = searchParams.get('stream_id');
  const streamType = searchParams.get('stream_type');
  
  // Handle stream requests
  if (streamId && streamType) {
    return handleStreamRequest(streamId, streamType);
  }
  
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
      return NextResponse.json({ categories: mockLiveCategories });
      
    case 'get_live_streams':
      const liveCategoryId = searchParams.get('category_id');
      if (liveCategoryId) {
        // Filter streams by category
        const filteredStreams = mockLiveStreams.filter(
          stream => stream.category_id === liveCategoryId
        );
        return NextResponse.json({ streams: filteredStreams });
      }
      return NextResponse.json({ streams: mockLiveStreams });
      
    case 'get_vod_categories':
      return NextResponse.json({ categories: mockMovieCategories });
      
    case 'get_vod_streams':
      const movieCategoryId = searchParams.get('category_id');
      if (movieCategoryId) {
        // Filter movies by category
        const filteredMovies = mockMovies.filter(
          movie => movie.category_id === movieCategoryId
        );
        return NextResponse.json({ movies: filteredMovies });
      }
      return NextResponse.json({ movies: mockMovies });
      
    case 'get_vod_info':
      const vodId = searchParams.get('vod_id');
      const movie = mockMovies.find(m => m.stream_id.toString() === vodId);
      return NextResponse.json(movie || {});
      
    case 'get_series_categories':
      return NextResponse.json({ categories: mockSeriesCategories });
      
    case 'get_series':
      const seriesCategoryId = searchParams.get('category_id');
      if (seriesCategoryId) {
        // Filter series by category
        const filteredSeries = mockSeries.filter(
          series => series.category_id === seriesCategoryId
        );
        return NextResponse.json({ series: filteredSeries });
      }
      return NextResponse.json({ series: mockSeries });
      
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

// Handle stream requests (live, movie, series)
function handleStreamRequest(streamId: string, streamType: string) {
  console.log(`Mock API: Stream request for ${streamType} ID ${streamId}`);
  
  // For a real implementation, we would return an actual video stream
  // For now, we'll return a redirect to a sample video
  
  // Sample videos from the web
  const sampleVideos = {
    // HLS test streams
    live: [
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8'
    ],
    // Sample movies
    movie: [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ],
    // Sample series episodes
    series: [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    ]
  };
  
  // Get a deterministic but seemingly random video based on the stream ID
  const getVideoByStreamId = (videos: string[], id: string): string => {
    // Use the stream ID to select a video from the array
    // This ensures the same stream ID always gets the same video
    const index = parseInt(id.replace(/\D/g, '')) % videos.length;
    return videos[Math.abs(index)];
  };
  
  // Get the appropriate sample videos array based on stream type
  const videos = sampleVideos[streamType as keyof typeof sampleVideos] || sampleVideos.movie;
  
  // Select a video based on the stream ID
  const videoUrl = getVideoByStreamId(videos, streamId);
  
  // Return a redirect to the sample video
  return NextResponse.redirect(videoUrl);
}

// Support all HTTP methods
export const POST = GET;
export const PUT = GET;
export const DELETE = GET;
export const PATCH = GET;