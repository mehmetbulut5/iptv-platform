import { XtreamUserInfo, XtreamLiveCategory, XtreamLiveStream, XtreamMovieCategory, XtreamMovie, XtreamSeriesCategory, XtreamSeries, XtreamSeriesInfo, XtreamEPG } from '../types/xtream';

// Mock user info response
export const mockUserInfo: XtreamUserInfo = {
  user_info: {
    username: 'testuser',
    password: 'testpass',
    message: 'Welcome to IPTV Platform',
    auth: 1,
    status: 'Active',
    exp_date: '2025-12-31',
    is_trial: '0',
    active_cons: '1',
    created_at: '2023-01-01',
    max_connections: '1',
    allowed_output_formats: ['m3u8', 'ts', 'rtmp']
  },
  server_info: {
    url: 'http://example.com:8080',
    port: '8080',
    https_port: '443',
    server_protocol: 'http',
    rtmp_port: '1935',
    timezone: 'Europe/London',
    timestamp_now: Math.floor(Date.now() / 1000).toString(),
    time_now: new Date().toISOString()
  }
};

// Mock live categories
export const mockLiveCategories: XtreamLiveCategory[] = [
  { category_id: '1', category_name: 'Sports', parent_id: 0 },
  { category_id: '2', category_name: 'News', parent_id: 0 },
  { category_id: '3', category_name: 'Entertainment', parent_id: 0 },
  { category_id: '4', category_name: 'Movies', parent_id: 0 },
  { category_id: '5', category_name: 'Kids', parent_id: 0 }
];

// Mock live streams
export const mockLiveStreams: XtreamLiveStream[] = [
  { 
    stream_id: 1, 
    name: 'Sports Channel 1', 
    stream_type: 'live', 
    stream_icon: 'https://via.placeholder.com/150',
    epg_channel_id: 'sports1.tv',
    added: '2023-01-01',
    category_id: '1',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0
  },
  { 
    stream_id: 2, 
    name: 'News 24/7', 
    stream_type: 'live', 
    stream_icon: 'https://via.placeholder.com/150',
    epg_channel_id: 'news247.tv',
    added: '2023-01-01',
    category_id: '2',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0
  },
  { 
    stream_id: 3, 
    name: 'Entertainment Now', 
    stream_type: 'live', 
    stream_icon: 'https://via.placeholder.com/150',
    epg_channel_id: 'entertainment.tv',
    added: '2023-01-01',
    category_id: '3',
    tv_archive: 0,
    direct_source: '',
    tv_archive_duration: 0
  }
];

// Mock movie categories
export const mockMovieCategories: XtreamMovieCategory[] = [
  { category_id: '10', category_name: 'Action', parent_id: 0 },
  { category_id: '11', category_name: 'Comedy', parent_id: 0 },
  { category_id: '12', category_name: 'Drama', parent_id: 0 },
  { category_id: '13', category_name: 'Horror', parent_id: 0 },
  { category_id: '14', category_name: 'Sci-Fi', parent_id: 0 }
];

// Mock movies
export const mockMovies: XtreamMovie[] = [
  {
    stream_id: 101,
    name: 'Action Movie 1',
    stream_type: 'movie',
    stream_icon: 'https://via.placeholder.com/150',
    container_extension: 'mp4',
    category_id: '10',
    rating: '8.5',
    rating_5based: 3.75,
    added: '2023-01-01',
    year: '2022',
    plot: 'An exciting action movie with lots of explosions',
    cast: 'Actor 1, Actor 2',
    director: 'Director 1',
    genre: 'Action',
    duration: '120',
    backdrop_path: [{ path: 'https://via.placeholder.com/1280x720' }],
    youtube_trailer: '',
    direct_source: ''
  },
  {
    stream_id: 102,
    name: 'Comedy Movie 1',
    stream_type: 'movie',
    stream_icon: 'https://via.placeholder.com/150',
    container_extension: 'mp4',
    category_id: '11',
    rating: '7.8',
    rating_5based: 3.9,
    added: '2023-01-01',
    year: '2022',
    plot: 'A hilarious comedy that will make you laugh',
    cast: 'Actor 3, Actor 4',
    director: 'Director 2',
    genre: 'Comedy',
    duration: '110',
    backdrop_path: [{ path: 'https://via.placeholder.com/1280x720' }],
    youtube_trailer: '',
    direct_source: ''
  }
];

// Mock series categories
export const mockSeriesCategories: XtreamSeriesCategory[] = [
  { category_id: '20', category_name: 'Drama Series', parent_id: 0 },
  { category_id: '21', category_name: 'Comedy Series', parent_id: 0 },
  { category_id: '22', category_name: 'Crime Series', parent_id: 0 },
  { category_id: '23', category_name: 'Sci-Fi Series', parent_id: 0 }
];

// Mock series
export const mockSeries: XtreamSeries[] = [
  {
    series_id: 201,
    name: 'Drama Series 1',
    cover: 'https://via.placeholder.com/150',
    category_id: '20',
    rating: '8.7',
    rating_5based: 4.35,
    added: '2023-01-01',
    year: '2022',
    plot: 'An intense drama series with complex characters',
    cast: 'Actor 5, Actor 6',
    director: 'Director 3',
    genre: 'Drama',
    episode_run_time: '45',
    backdrop_path: [{ path: 'https://via.placeholder.com/1280x720' }],
    youtube_trailer: '',
    direct_source: ''
  },
  {
    series_id: 202,
    name: 'Comedy Series 1',
    cover: 'https://via.placeholder.com/150',
    category_id: '21',
    rating: '8.2',
    rating_5based: 4.1,
    added: '2023-01-01',
    year: '2022',
    plot: 'A funny comedy series that will brighten your day',
    cast: 'Actor 7, Actor 8',
    director: 'Director 4',
    genre: 'Comedy',
    episode_run_time: '30',
    backdrop_path: [{ path: 'https://via.placeholder.com/1280x720' }],
    youtube_trailer: '',
    direct_source: ''
  }
];

// Mock series info
export const mockSeriesInfo: XtreamSeriesInfo = {
  info: {
    name: 'Drama Series 1',
    cover: 'https://via.placeholder.com/150',
    plot: 'An intense drama series with complex characters',
    cast: 'Actor 5, Actor 6',
    director: 'Director 3',
    genre: 'Drama',
    releaseDate: '2022-01-01',
    last_modified: '2023-01-01',
    rating: '8.7',
    rating_5based: 4.35,
    backdrop_path: [{ path: 'https://via.placeholder.com/1280x720' }],
    youtube_trailer: '',
    episode_run_time: '45',
    category_id: '20'
  },
  episodes: {
    '1': [
      {
        id: '201-1-1',
        episode_num: 1,
        title: 'Pilot',
        container_extension: 'mp4',
        info: {
          plot: 'The first episode of the series',
          duration_secs: 2700,
          duration: '45:00',
          movie_image: 'https://via.placeholder.com/300x200',
          releasedate: '2022-01-01'
        }
      },
      {
        id: '201-1-2',
        episode_num: 2,
        title: 'The Beginning',
        container_extension: 'mp4',
        info: {
          plot: 'The story continues',
          duration_secs: 2700,
          duration: '45:00',
          movie_image: 'https://via.placeholder.com/300x200',
          releasedate: '2022-01-08'
        }
      }
    ],
    '2': [
      {
        id: '201-2-1',
        episode_num: 1,
        title: 'New Season',
        container_extension: 'mp4',
        info: {
          plot: 'The second season begins',
          duration_secs: 2700,
          duration: '45:00',
          movie_image: 'https://via.placeholder.com/300x200',
          releasedate: '2023-01-01'
        }
      }
    ]
  },
  seasons: [1, 2]
};

// Mock EPG
export const mockEPG: XtreamEPG = {
  epg_listings: [
    {
      id: '1001',
      title: 'Sports News',
      lang: 'en',
      start: '2023-01-01 12:00:00',
      end: '2023-01-01 13:00:00',
      description: 'Latest sports news and updates',
      channel_id: 'sports1.tv',
      start_timestamp: 1672574400,
      stop_timestamp: 1672578000
    },
    {
      id: '1002',
      title: 'Football Match',
      lang: 'en',
      start: '2023-01-01 13:00:00',
      end: '2023-01-01 15:00:00',
      description: 'Live football match',
      channel_id: 'sports1.tv',
      start_timestamp: 1672578000,
      stop_timestamp: 1672585200
    }
  ]
};