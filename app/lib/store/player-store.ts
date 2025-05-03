import { create } from 'zustand';
import { VideoPlayerOptions } from '../types/app';

interface PlayerState {
  // Player state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPictureInPicture: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Content info
  currentContentId: string | null;
  currentContentType: 'live' | 'movie' | 'series' | null;
  currentTitle: string | null;
  currentPosterUrl: string | null;
  currentStreamUrl: string | null;
  
  // Series specific
  currentSeasonNumber: number | null;
  currentEpisodeNumber: number | null;
  
  // Player options
  playerOptions: VideoPlayerOptions;
  
  // Actions - Player state
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  setFullscreen: (isFullscreen: boolean) => void;
  setPictureInPicture: (isPictureInPicture: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Content info
  setCurrentContent: (
    id: string, 
    type: 'live' | 'movie' | 'series', 
    title: string, 
    posterUrl: string | null, 
    streamUrl: string
  ) => void;
  
  // Actions - Series specific
  setCurrentEpisode: (seasonNumber: number, episodeNumber: number) => void;
  
  // Actions - Player options
  updatePlayerOptions: (options: Partial<VideoPlayerOptions>) => void;
  resetPlayerOptions: () => void;
  
  // Actions - Reset
  resetPlayer: () => void;
}

// Default player options
const defaultPlayerOptions: VideoPlayerOptions = {
  autoPlay: true,
  muted: false,
  volume: 100,
  quality: 'auto',
  playbackRate: 1,
  subtitles: false,
  subtitleLanguage: null,
  audioTrack: null,
};

export const usePlayerStore = create<PlayerState>()((set) => ({
  // Initial state - Player state
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 100,
  isMuted: false,
  isFullscreen: false,
  isPictureInPicture: false,
  isLoading: false,
  error: null,
  
  // Initial state - Content info
  currentContentId: null,
  currentContentType: null,
  currentTitle: null,
  currentPosterUrl: null,
  currentStreamUrl: null,
  
  // Initial state - Series specific
  currentSeasonNumber: null,
  currentEpisodeNumber: null,
  
  // Initial state - Player options
  playerOptions: defaultPlayerOptions,
  
  // Actions - Player state
  setPlaying: (isPlaying: boolean) => 
    set({ isPlaying }),
  
  setCurrentTime: (currentTime: number) => 
    set({ currentTime }),
  
  setDuration: (duration: number) => 
    set({ duration }),
  
  setVolume: (volume: number) => 
    set({ volume }),
  
  setMuted: (isMuted: boolean) => 
    set({ isMuted }),
  
  setFullscreen: (isFullscreen: boolean) => 
    set({ isFullscreen }),
  
  setPictureInPicture: (isPictureInPicture: boolean) => 
    set({ isPictureInPicture }),
  
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),
  
  setError: (error: string | null) => 
    set({ error }),
  
  // Actions - Content info
  setCurrentContent: (
    id: string, 
    type: 'live' | 'movie' | 'series', 
    title: string, 
    posterUrl: string | null, 
    streamUrl: string
  ) => 
    set({
      currentContentId: id,
      currentContentType: type,
      currentTitle: title,
      currentPosterUrl: posterUrl,
      currentStreamUrl: streamUrl,
      // Reset player state
      currentTime: 0,
      duration: 0,
      isPlaying: true,
      isLoading: true,
      error: null,
    }),
  
  // Actions - Series specific
  setCurrentEpisode: (seasonNumber: number, episodeNumber: number) => 
    set({
      currentSeasonNumber: seasonNumber,
      currentEpisodeNumber: episodeNumber,
    }),
  
  // Actions - Player options
  updatePlayerOptions: (options: Partial<VideoPlayerOptions>) => 
    set((state) => ({ 
      playerOptions: { 
        ...state.playerOptions, 
        ...options 
      } 
    })),
  
  resetPlayerOptions: () => 
    set({ playerOptions: defaultPlayerOptions }),
  
  // Actions - Reset
  resetPlayer: () => 
    set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isLoading: false,
      error: null,
      currentContentId: null,
      currentContentType: null,
      currentTitle: null,
      currentPosterUrl: null,
      currentStreamUrl: null,
      currentSeasonNumber: null,
      currentEpisodeNumber: null,
    }),
}));