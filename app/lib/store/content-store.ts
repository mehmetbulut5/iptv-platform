import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  XtreamLiveCategory, 
  XtreamMovieCategory, 
  XtreamSeriesCategory,
  XtreamLiveStream,
  XtreamMovie,
  XtreamSeries
} from '../types/xtream';
import { 
  EnhancedLiveStream, 
  EnhancedMovie, 
  EnhancedSeries,
  WatchHistoryItem,
  FavoriteItem
} from '../types/app';

interface ContentState {
  // Categories
  liveCategories: XtreamLiveCategory[];
  movieCategories: XtreamMovieCategory[];
  seriesCategories: XtreamSeriesCategory[];
  
  // Content
  liveStreams: Record<string, XtreamLiveStream[]>; // categoryId -> streams
  movies: Record<string, XtreamMovie[]>; // categoryId -> movies
  series: Record<string, XtreamSeries[]>; // categoryId -> series
  
  // Enhanced content with user data
  enhancedLiveStreams: Record<number, EnhancedLiveStream>; // streamId -> enhanced stream
  enhancedMovies: Record<number, EnhancedMovie>; // movieId -> enhanced movie
  enhancedSeries: Record<number, EnhancedSeries>; // seriesId -> enhanced series
  
  // User content lists
  watchHistory: WatchHistoryItem[];
  favorites: FavoriteItem[];
  
  // Loading states
  isLoadingLiveCategories: boolean;
  isLoadingMovieCategories: boolean;
  isLoadingSeriesCategories: boolean;
  isLoadingLiveStreams: boolean;
  isLoadingMovies: boolean;
  isLoadingSeries: boolean;
  
  // Actions - Categories
  setLiveCategories: (categories: XtreamLiveCategory[]) => void;
  setMovieCategories: (categories: XtreamMovieCategory[]) => void;
  setSeriesCategories: (categories: XtreamSeriesCategory[]) => void;
  
  // Actions - Content
  setLiveStreams: (categoryId: string, streams: XtreamLiveStream[]) => void;
  setMovies: (categoryId: string, movies: XtreamMovie[]) => void;
  setSeries: (categoryId: string, series: XtreamSeries[]) => void;
  
  // Actions - Enhanced content
  updateEnhancedLiveStream: (streamId: number, data: Partial<EnhancedLiveStream>) => void;
  updateEnhancedMovie: (movieId: number, data: Partial<EnhancedMovie>) => void;
  updateEnhancedSeries: (seriesId: number, data: Partial<EnhancedSeries>) => void;
  
  // Actions - User content
  addToWatchHistory: (item: WatchHistoryItem) => void;
  removeFromWatchHistory: (id: string) => void;
  clearWatchHistory: () => void;
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  clearFavorites: () => void;
  
  // Actions - Loading states
  setLoadingLiveCategories: (isLoading: boolean) => void;
  setLoadingMovieCategories: (isLoading: boolean) => void;
  setLoadingSeriesCategories: (isLoading: boolean) => void;
  setLoadingLiveStreams: (isLoading: boolean) => void;
  setLoadingMovies: (isLoading: boolean) => void;
  setLoadingSeries: (isLoading: boolean) => void;
  
  // Actions - Clear all
  clearAllContent: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      // Initial state - Categories
      liveCategories: [],
      movieCategories: [],
      seriesCategories: [],
      
      // Initial state - Content
      liveStreams: {},
      movies: {},
      series: {},
      
      // Initial state - Enhanced content
      enhancedLiveStreams: {},
      enhancedMovies: {},
      enhancedSeries: {},
      
      // Initial state - User content
      watchHistory: [],
      favorites: [],
      
      // Initial state - Loading
      isLoadingLiveCategories: false,
      isLoadingMovieCategories: false,
      isLoadingSeriesCategories: false,
      isLoadingLiveStreams: false,
      isLoadingMovies: false,
      isLoadingSeries: false,
      
      // Actions - Categories
      setLiveCategories: (categories: XtreamLiveCategory[]) => 
        set({ liveCategories: categories }),
      
      setMovieCategories: (categories: XtreamMovieCategory[]) => 
        set({ movieCategories: categories }),
      
      setSeriesCategories: (categories: XtreamSeriesCategory[]) => 
        set({ seriesCategories: categories }),
      
      // Actions - Content
      setLiveStreams: (categoryId: string, streams: XtreamLiveStream[]) => 
        set((state) => ({ 
          liveStreams: { 
            ...state.liveStreams, 
            [categoryId]: streams 
          } 
        })),
      
      setMovies: (categoryId: string, movies: XtreamMovie[]) => 
        set((state) => ({ 
          movies: { 
            ...state.movies, 
            [categoryId]: movies 
          } 
        })),
      
      setSeries: (categoryId: string, series: XtreamSeries[]) => 
        set((state) => ({ 
          series: { 
            ...state.series, 
            [categoryId]: series 
          } 
        })),
      
      // Actions - Enhanced content
      updateEnhancedLiveStream: (streamId: number, data: Partial<EnhancedLiveStream>) => 
        set((state) => {
          const current = state.enhancedLiveStreams[streamId] || {} as EnhancedLiveStream;
          return { 
            enhancedLiveStreams: { 
              ...state.enhancedLiveStreams, 
              [streamId]: { 
                ...current, 
                ...data 
              } 
            } 
          };
        }),
      
      updateEnhancedMovie: (movieId: number, data: Partial<EnhancedMovie>) => 
        set((state) => {
          const current = state.enhancedMovies[movieId] || {} as EnhancedMovie;
          return { 
            enhancedMovies: { 
              ...state.enhancedMovies, 
              [movieId]: { 
                ...current, 
                ...data 
              } 
            } 
          };
        }),
      
      updateEnhancedSeries: (seriesId: number, data: Partial<EnhancedSeries>) => 
        set((state) => {
          const current = state.enhancedSeries[seriesId] || {} as EnhancedSeries;
          return { 
            enhancedSeries: { 
              ...state.enhancedSeries, 
              [seriesId]: { 
                ...current, 
                ...data 
              } 
            } 
          };
        }),
      
      // Actions - User content
      addToWatchHistory: (item: WatchHistoryItem) => 
        set((state) => {
          // Remove if exists (to update it)
          const filtered = state.watchHistory.filter(i => i.id !== item.id);
          // Add to beginning of array (most recent first)
          return { 
            watchHistory: [item, ...filtered].slice(0, 100) // Limit to 100 items
          };
        }),
      
      removeFromWatchHistory: (id: string) => 
        set((state) => ({ 
          watchHistory: state.watchHistory.filter(item => item.id !== id) 
        })),
      
      clearWatchHistory: () => 
        set({ watchHistory: [] }),
      
      addToFavorites: (item: FavoriteItem) => 
        set((state) => {
          // Check if already exists
          if (state.favorites.some(i => i.id === item.id)) {
            return state;
          }
          // Add to beginning of array
          return { 
            favorites: [item, ...state.favorites] 
          };
        }),
      
      removeFromFavorites: (id: string) => 
        set((state) => ({ 
          favorites: state.favorites.filter(item => item.id !== id) 
        })),
      
      clearFavorites: () => 
        set({ favorites: [] }),
      
      // Actions - Loading states
      setLoadingLiveCategories: (isLoading: boolean) => 
        set({ isLoadingLiveCategories: isLoading }),
      
      setLoadingMovieCategories: (isLoading: boolean) => 
        set({ isLoadingMovieCategories: isLoading }),
      
      setLoadingSeriesCategories: (isLoading: boolean) => 
        set({ isLoadingSeriesCategories: isLoading }),
      
      setLoadingLiveStreams: (isLoading: boolean) => 
        set({ isLoadingLiveStreams: isLoading }),
      
      setLoadingMovies: (isLoading: boolean) => 
        set({ isLoadingMovies: isLoading }),
      
      setLoadingSeries: (isLoading: boolean) => 
        set({ isLoadingSeries: isLoading }),
      
      // Actions - Clear all
      clearAllContent: () => 
        set({
          liveCategories: [],
          movieCategories: [],
          seriesCategories: [],
          liveStreams: {},
          movies: {},
          series: {},
          enhancedLiveStreams: {},
          enhancedMovies: {},
          enhancedSeries: {},
        }),
    }),
    {
      name: 'content-storage',
      partialize: (state) => ({
        // Only persist user data, not the content itself
        enhancedLiveStreams: state.enhancedLiveStreams,
        enhancedMovies: state.enhancedMovies,
        enhancedSeries: state.enhancedSeries,
        watchHistory: state.watchHistory,
        favorites: state.favorites,
      }),
    }
  )
);