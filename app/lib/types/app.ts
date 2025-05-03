// Application-specific types

import { XtreamLiveStream, XtreamMovie, XtreamSeries, XtreamEpisode } from './xtream';
import { TMDBMovie, TMDBTVShow } from './tmdb';

export type ThemeMode = 'dark' | 'light' | 'system';
export type Language = 'en' | 'tr' | 'de' | 'fr' | 'es';

export interface UserPreferences {
  theme: ThemeMode;
  language: Language;
  parentalControlEnabled: boolean;
  parentalControlPin: string;
  autoPlayNextEpisode: boolean;
  defaultSubtitleLanguage: string | null;
  defaultAudioLanguage: string | null;
  bufferSize: number; // in seconds
  sendAnonymousUsageData: boolean;
}

export interface UserSession {
  serverUrl: string;
  username: string;
  password: string;
  token?: string;
  expiresAt: string;
  isActive: boolean;
}

export interface WatchHistoryItem {
  id: string;
  type: 'movie' | 'series' | 'live';
  title: string;
  posterUrl: string;
  progress: number; // 0-100
  duration: number; // in seconds
  position: number; // in seconds
  lastWatched: string; // ISO date string
  seasonNumber?: number;
  episodeNumber?: number;
}

export interface FavoriteItem {
  id: string;
  type: 'movie' | 'series' | 'live';
  title: string;
  posterUrl: string;
  addedAt: string; // ISO date string
}

export interface EnhancedLiveStream extends XtreamLiveStream {
  currentProgram?: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    progress: number; // 0-100
  };
  nextProgram?: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
  };
  isFavorite: boolean;
}

export interface EnhancedMovie extends XtreamMovie {
  tmdbData?: TMDBMovie;
  isFavorite: boolean;
  watchProgress?: {
    position: number;
    duration: number;
    progress: number; // 0-100
    completed: boolean;
  };
}

export interface EnhancedSeries extends XtreamSeries {
  tmdbData?: TMDBTVShow;
  isFavorite: boolean;
  watchProgress?: {
    seasonsWatched: number[];
    lastWatchedSeason: number;
    lastWatchedEpisode: number;
    totalEpisodesWatched: number;
    totalEpisodes: number;
    progress: number; // 0-100
  };
}

export interface EnhancedEpisode extends XtreamEpisode {
  watchProgress?: {
    position: number;
    duration: number;
    progress: number; // 0-100
    completed: boolean;
  };
}

export interface VideoPlayerOptions {
  autoPlay: boolean;
  muted: boolean;
  volume: number; // 0-100
  quality: string; // 'auto', '720p', etc.
  playbackRate: number; // 0.5, 1, 1.5, 2
  subtitles: boolean;
  subtitleLanguage: string | null;
  audioTrack: string | null;
}