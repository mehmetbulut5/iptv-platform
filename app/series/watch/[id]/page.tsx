'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { VideoPlayer } from '@/app/(components)/player/video-player';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { usePreferencesStore } from '@/app/lib/store/preferences-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Star, 
  ArrowLeft, 
  Info, 
  SkipForward, 
  SkipBack 
} from 'lucide-react';
import { EnhancedSeries } from '@/app/lib/types/app';
import { SeriesEpisode, SeriesSeason } from '@/app/lib/types/xtream';

interface SeriesWatchPageProps {
  params: {
    id: string;
  };
}

export default function SeriesWatchPage({ params }: SeriesWatchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const { preferences } = usePreferencesStore();
  const { 
    series, 
    addToFavorites, 
    removeFromFavorites, 
    favorites,
    watchHistory
  } = useContentStore();
  
  // Get season and episode from query params
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  
  const [show, setShow] = useState<EnhancedSeries | null>(null);
  const [currentSeason, setCurrentSeason] = useState<number>(
    seasonParam ? parseInt(seasonParam) : 1
  );
  const [currentEpisode, setCurrentEpisode] = useState<number>(
    episodeParam ? parseInt(episodeParam) : 1
  );
  const [episodeData, setEpisodeData] = useState<SeriesEpisode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the series is in favorites
  const isFavorite = favorites.some(
    fav => fav.id === params.id && fav.type === 'series'
  );
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Load series data
    const loadSeries = async () => {
      try {
        setIsLoading(true);
        
        // Check if the series is already in the store
        const existingSeries = series.find(
          s => s.series_id.toString() === params.id
        );
        
        if (existingSeries) {
          setShow(existingSeries);
          
          // Find the current episode
          const season = existingSeries.seasons?.find(
            s => s.season_number === currentSeason
          );
          
          if (season) {
            const episode = season.episodes?.find(
              e => e.episode_num === currentEpisode
            );
            
            if (episode) {
              setEpisodeData(episode);
            } else {
              setError('Episode not found');
            }
          } else {
            setError('Season not found');
          }
        } else {
          // Fetch the series from the API
          const seriesData = await xtreamService.getSeriesById(parseInt(params.id));
          
          if (seriesData) {
            // Find all watch history items for this series
            const seriesWatchHistory = watchHistory.filter(
              item => item.id === seriesData.series_id.toString() && item.type === 'series'
            );
            
            // Calculate overall progress if there are watch history items
            let watchProgress = null;
            if (seriesWatchHistory.length > 0) {
              // This is a simplified calculation - in a real app, you'd need to count total episodes
              const latestWatched = seriesWatchHistory.reduce((latest, current) => {
                return new Date(current.lastWatched) > new Date(latest.lastWatched) ? current : latest;
              });
              
              watchProgress = {
                progress: latestWatched.progress,
                position: latestWatched.position,
                duration: latestWatched.duration,
                lastWatched: latestWatched.lastWatched,
                seasonNumber: latestWatched.seasonNumber,
                episodeNumber: latestWatched.episodeNumber,
              };
            }
            
            // Enhance with favorite status and watch progress
            const enhancedSeries: EnhancedSeries = {
              ...seriesData,
              isFavorite: favorites.some(
                fav => fav.id === seriesData.series_id.toString() && fav.type === 'series'
              ),
              watchProgress: watchProgress,
            };
            
            setShow(enhancedSeries);
            
            // Find the current episode
            const season = enhancedSeries.seasons?.find(
              s => s.season_number === currentSeason
            );
            
            if (season) {
              const episode = season.episodes?.find(
                e => e.episode_num === currentEpisode
              );
              
              if (episode) {
                setEpisodeData(episode);
              } else {
                setError('Episode not found');
              }
            } else {
              setError('Season not found');
            }
          } else {
            setError('Series not found');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading series:', error);
        setError('Failed to load series');
        setIsLoading(false);
      }
    };
    
    loadSeries();
  }, [checkSession, router, params.id, currentSeason, currentEpisode, series, favorites, watchHistory]);
  
  // Toggle favorite
  const toggleFavorite = () => {
    if (!show) return;
    
    if (isFavorite) {
      removeFromFavorites(params.id);
    } else {
      addToFavorites({
        id: params.id,
        type: 'series',
        title: show.name,
        posterUrl: show.cover || '',
        addedAt: new Date().toISOString(),
      });
    }
  };
  
  // Get episode URL
  const getEpisodeUrl = () => {
    if (!episodeData) return '';
    
    return xtreamService.getSeriesEpisodeUrl(
      parseInt(params.id),
      currentSeason,
      currentEpisode,
      episodeData.id
    );
  };
  
  // Navigate to previous episode
  const goToPreviousEpisode = () => {
    if (!show || !show.seasons) return;
    
    // Find current season
    const currentSeasonData = show.seasons.find(
      s => s.season_number === currentSeason
    );
    
    if (!currentSeasonData || !currentSeasonData.episodes) return;
    
    // If not the first episode of the season, go to previous episode
    if (currentEpisode > 1) {
      router.push(`/series/watch/${params.id}?season=${currentSeason}&episode=${currentEpisode - 1}`);
      setCurrentEpisode(currentEpisode - 1);
    } 
    // If first episode of the season and not the first season, go to last episode of previous season
    else if (currentSeason > 1) {
      const previousSeasonData = show.seasons.find(
        s => s.season_number === currentSeason - 1
      );
      
      if (previousSeasonData && previousSeasonData.episodes && previousSeasonData.episodes.length > 0) {
        const lastEpisodeNum = previousSeasonData.episodes.length;
        router.push(`/series/watch/${params.id}?season=${currentSeason - 1}&episode=${lastEpisodeNum}`);
        setCurrentSeason(currentSeason - 1);
        setCurrentEpisode(lastEpisodeNum);
      }
    }
  };
  
  // Navigate to next episode
  const goToNextEpisode = () => {
    if (!show || !show.seasons) return;
    
    // Find current season
    const currentSeasonData = show.seasons.find(
      s => s.season_number === currentSeason
    );
    
    if (!currentSeasonData || !currentSeasonData.episodes) return;
    
    // If not the last episode of the season, go to next episode
    if (currentEpisode < currentSeasonData.episodes.length) {
      router.push(`/series/watch/${params.id}?season=${currentSeason}&episode=${currentEpisode + 1}`);
      setCurrentEpisode(currentEpisode + 1);
    } 
    // If last episode of the season and not the last season, go to first episode of next season
    else if (currentSeason < show.seasons.length) {
      const nextSeasonData = show.seasons.find(
        s => s.season_number === currentSeason + 1
      );
      
      if (nextSeasonData && nextSeasonData.episodes && nextSeasonData.episodes.length > 0) {
        router.push(`/series/watch/${params.id}?season=${currentSeason + 1}&episode=1`);
        setCurrentSeason(currentSeason + 1);
        setCurrentEpisode(1);
      }
    }
  };
  
  // Handle video end
  const handleVideoEnd = () => {
    if (preferences.autoPlayNextEpisode) {
      goToNextEpisode();
    }
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4 gap-1"
          onClick={() => router.push(`/series/details/${params.id}`)}
        >
          <ArrowLeft size={16} />
          <span>Back to Series</span>
        </Button>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">{error}</p>
            <Button onClick={() => router.push(`/series/details/${params.id}`)}>
              Go back to Series Details
            </Button>
          </div>
        ) : show && episodeData ? (
          <div className="space-y-4">
            {/* Video Player */}
            <VideoPlayer
              url={getEpisodeUrl()}
              title={episodeData.title || `${show.name} - S${currentSeason}E${currentEpisode}`}
              contentId={params.id}
              contentType="series"
              posterUrl={show.cover || undefined}
              autoPlay={true}
              seasonNumber={currentSeason}
              episodeNumber={currentEpisode}
            />
            
            {/* Episode Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {episodeData.title || `Episode ${currentEpisode}`}
                </h1>
                <p className="text-muted-foreground">
                  {show.name} - Season {currentSeason}, Episode {currentEpisode}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFavorite}
                >
                  <Star
                    size={20}
                    className={isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}
                  />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/series/details/${params.id}`)}
                >
                  <Info size={20} />
                </Button>
              </div>
            </div>
            
            {/* Episode Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                className="gap-1"
                onClick={goToPreviousEpisode}
              >
                <SkipBack size={16} />
                <span>Previous Episode</span>
              </Button>
              
              <Button
                variant="outline"
                className="gap-1"
                onClick={goToNextEpisode}
              >
                <span>Next Episode</span>
                <SkipForward size={16} />
              </Button>
            </div>
            
            {/* Episode Description */}
            {episodeData.info?.plot && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Overview</h2>
                <p className="text-muted-foreground">
                  {episodeData.info.plot}
                </p>
              </div>
            )}
            
            {/* Episode Details */}
            {(episodeData.info?.cast || episodeData.info?.director || episodeData.info?.duration) && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Details</h2>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {episodeData.info?.duration && (
                    <>
                      <dt className="font-medium">Duration:</dt>
                      <dd className="text-muted-foreground">{episodeData.info.duration} min</dd>
                    </>
                  )}
                  {episodeData.info?.director && (
                    <>
                      <dt className="font-medium">Director:</dt>
                      <dd className="text-muted-foreground">{episodeData.info.director}</dd>
                    </>
                  )}
                  {episodeData.info?.cast && (
                    <>
                      <dt className="font-medium">Cast:</dt>
                      <dd className="text-muted-foreground">{episodeData.info.cast}</dd>
                    </>
                  )}
                  {episodeData.info?.releasedate && (
                    <>
                      <dt className="font-medium">Release Date:</dt>
                      <dd className="text-muted-foreground">{episodeData.info.releasedate}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">Episode not found</p>
            <Button onClick={() => router.push(`/series/details/${params.id}`)}>
              Go back to Series Details
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}