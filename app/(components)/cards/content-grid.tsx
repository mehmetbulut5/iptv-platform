'use client';

import { ReactNode } from 'react';
import { ContentCard } from './content-card';
import { EnhancedLiveStream, EnhancedMovie, EnhancedSeries } from '@/app/lib/types/app';

interface ContentGridProps {
  title?: string;
  children?: ReactNode;
  liveStreams?: EnhancedLiveStream[];
  movies?: EnhancedMovie[];
  series?: EnhancedSeries[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ContentGrid({
  title,
  children,
  liveStreams,
  movies,
  series,
  isLoading = false,
  emptyMessage = 'No content found',
}: ContentGridProps) {
  // Determine if the grid is empty
  const isEmpty = 
    (!liveStreams || liveStreams.length === 0) && 
    (!movies || movies.length === 0) && 
    (!series || series.length === 0) && 
    !children;
  
  return (
    <div className="space-y-4">
      {/* Title */}
      {title && (
        <h2 className="text-xl font-bold">{title}</h2>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index} 
              className="aspect-[2/3] w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      ) : isEmpty ? (
        // Empty state
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
          <p className="text-center text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        // Content grid
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {/* Live streams */}
          {liveStreams?.map((stream) => (
            <ContentCard
              key={`live-${stream.stream_id}`}
              id={stream.stream_id.toString()}
              type="live"
              title={stream.name}
              posterUrl={stream.stream_icon || '/placeholder-channel.jpg'}
              isFavorite={stream.isFavorite}
              isLive={true}
              currentProgram={stream.currentProgram?.title}
              nextProgram={stream.nextProgram?.title}
            />
          ))}
          
          {/* Movies */}
          {movies?.map((movie) => (
            <ContentCard
              key={`movie-${movie.stream_id}`}
              id={movie.stream_id.toString()}
              type="movie"
              title={movie.name}
              posterUrl={movie.cover || movie.stream_icon || '/placeholder-movie.jpg'}
              isFavorite={movie.isFavorite}
              progress={movie.watchProgress?.progress}
              year={movie.year}
              duration={movie.episode_run_time}
              rating={movie.rating}
            />
          ))}
          
          {/* Series */}
          {series?.map((show) => (
            <ContentCard
              key={`series-${show.series_id}`}
              id={show.series_id.toString()}
              type="series"
              title={show.name}
              posterUrl={show.cover || '/placeholder-series.jpg'}
              isFavorite={show.isFavorite}
              progress={show.watchProgress?.progress}
              seasons={show.seasons?.length}
            />
          ))}
          
          {/* Custom children */}
          {children}
        </div>
      )}
    </div>
  );
}