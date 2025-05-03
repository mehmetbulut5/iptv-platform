'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { tmdbService } from '@/app/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Star, 
  ArrowLeft, 
  Play, 
  Calendar, 
  Film, 
  Clapperboard 
} from 'lucide-react';
import { EnhancedSeries } from '@/app/lib/types/app';
import { TMDBTVDetails } from '@/app/lib/types/tmdb';

interface SeriesDetailsPageProps {
  params: {
    id: string;
  };
}

export default function SeriesDetailsPage({ params }: SeriesDetailsPageProps) {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    series, 
    addToFavorites, 
    removeFromFavorites, 
    favorites,
    watchHistory
  } = useContentStore();
  
  const [show, setShow] = useState<EnhancedSeries | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TMDBTVDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  
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
          
          // Set initial selected season
          if (existingSeries.seasons && existingSeries.seasons.length > 0) {
            // Find the season with the most recent watch progress
            const watchedSeasons = watchHistory
              .filter(item => 
                item.id === params.id && 
                item.type === 'series' && 
                item.seasonNumber !== undefined
              )
              .sort((a, b) => 
                new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
              );
            
            if (watchedSeasons.length > 0 && watchedSeasons[0].seasonNumber) {
              setSelectedSeason(watchedSeasons[0].seasonNumber);
            } else {
              setSelectedSeason(existingSeries.seasons[0].season_number);
            }
          }
          
          // Load TMDB details if available
          if (existingSeries.tmdb_id) {
            try {
              const tmdbData = await tmdbService.getTVDetails(existingSeries.tmdb_id);
              setTmdbDetails(tmdbData);
            } catch (tmdbError) {
              console.error('Error loading TMDB details:', tmdbError);
            }
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
              
              // Set initial selected season to the last watched season
              if (latestWatched.seasonNumber) {
                setSelectedSeason(latestWatched.seasonNumber);
              }
            } else if (seriesData.seasons && seriesData.seasons.length > 0) {
              // If no watch history, select the first season
              setSelectedSeason(seriesData.seasons[0].season_number);
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
            
            // Load TMDB details if available
            if (seriesData.tmdb_id) {
              try {
                const tmdbData = await tmdbService.getTVDetails(seriesData.tmdb_id);
                setTmdbDetails(tmdbData);
              } catch (tmdbError) {
                console.error('Error loading TMDB details:', tmdbError);
              }
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
  }, [checkSession, router, params.id, series, favorites, watchHistory]);
  
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
  
  // Get episode watch status
  const getEpisodeWatchStatus = (seasonNumber: number, episodeNumber: number) => {
    const episodeHistory = watchHistory.find(
      item => 
        item.id === params.id && 
        item.type === 'series' && 
        item.seasonNumber === seasonNumber && 
        item.episodeNumber === episodeNumber
    );
    
    if (!episodeHistory) return null;
    
    if (episodeHistory.progress >= 95) {
      return 'completed';
    } else if (episodeHistory.progress > 0) {
      return 'in-progress';
    }
    
    return null;
  };
  
  // Play episode
  const playEpisode = (seasonNumber: number, episodeNumber: number) => {
    router.push(`/series/watch/${params.id}?season=${seasonNumber}&episode=${episodeNumber}`);
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4 gap-1"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </Button>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <Skeleton className="aspect-[2/3] h-[300px] w-[200px]" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/series')}>
              Go back to Series
            </Button>
          </div>
        ) : show ? (
          <div className="space-y-6">
            {/* Series Header */}
            <div className="flex flex-col gap-6 md:flex-row">
              {/* Poster */}
              <div className="relative aspect-[2/3] h-auto w-full max-w-[200px] overflow-hidden rounded-lg">
                <Image
                  src={show.cover || '/placeholder-poster.jpg'}
                  alt={show.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                  priority
                />
              </div>
              
              {/* Series Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{show.name}</h1>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {show.year && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {show.year}
                        </span>
                      )}
                      {show.category_name && (
                        <span className="flex items-center gap-1">
                          <Film size={14} />
                          {show.category_name}
                        </span>
                      )}
                      {show.seasons && (
                        <span className="flex items-center gap-1">
                          <Clapperboard size={14} />
                          {show.seasons.length} {show.seasons.length === 1 ? 'Season' : 'Seasons'}
                        </span>
                      )}
                      {show.rating && (
                        <span className="flex items-center gap-1">
                          <Star size={14} />
                          {show.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  
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
                </div>
                
                {/* Plot */}
                {(show.plot || tmdbDetails?.overview) && (
                  <div className="mt-4">
                    <p className="text-muted-foreground">
                      {tmdbDetails?.overview || show.plot}
                    </p>
                  </div>
                )}
                
                {/* Continue Watching */}
                {show.watchProgress && (
                  <div className="mt-4">
                    <Button
                      className="gap-2"
                      onClick={() => 
                        playEpisode(
                          show.watchProgress?.seasonNumber || 1, 
                          show.watchProgress?.episodeNumber || 1
                        )
                      }
                    >
                      <Play size={16} />
                      <span>
                        {show.watchProgress.progress >= 95
                          ? 'Watch Next Episode'
                          : 'Continue Watching'}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Cast & Crew (if available from TMDB) */}
            {tmdbDetails?.credits?.cast && tmdbDetails.credits.cast.length > 0 && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-semibold">Cast</h2>
                <div className="flex flex-wrap gap-4">
                  {tmdbDetails.credits.cast.slice(0, 6).map((person) => (
                    <div key={person.id} className="flex flex-col items-center">
                      <div className="h-16 w-16 overflow-hidden rounded-full">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                            alt={person.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            {person.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-center text-sm font-medium">{person.name}</p>
                      <p className="text-center text-xs text-muted-foreground">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Episodes */}
            {show.seasons && show.seasons.length > 0 && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-semibold">Episodes</h2>
                
                {/* Season Tabs */}
                <Tabs 
                  value={selectedSeason.toString()} 
                  onValueChange={(value) => setSelectedSeason(parseInt(value))}
                >
                  <TabsList className="mb-4 flex flex-wrap">
                    {show.seasons.map((season) => (
                      <TabsTrigger 
                        key={season.season_number} 
                        value={season.season_number.toString()}
                      >
                        Season {season.season_number}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {/* Episodes List */}
                  {show.seasons.map((season) => (
                    <TabsContent 
                      key={season.season_number} 
                      value={season.season_number.toString()}
                      className="space-y-4"
                    >
                      {season.episodes && season.episodes.length > 0 ? (
                        season.episodes.map((episode) => {
                          const watchStatus = getEpisodeWatchStatus(
                            season.season_number, 
                            episode.episode_num
                          );
                          
                          return (
                            <div 
                              key={episode.id} 
                              className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row"
                            >
                              {/* Episode Thumbnail */}
                              <div 
                                className="relative aspect-video h-auto w-full cursor-pointer sm:w-[200px]"
                                onClick={() => playEpisode(season.season_number, episode.episode_num)}
                              >
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <Play size={32} className="text-white" />
                                </div>
                                {watchStatus && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                                    <div 
                                      className={`h-full ${
                                        watchStatus === 'completed' 
                                          ? 'bg-green-500' 
                                          : 'bg-primary'
                                      }`}
                                      style={{ 
                                        width: watchStatus === 'completed' 
                                          ? '100%' 
                                          : `${watchHistory.find(
                                              item => 
                                                item.id === params.id && 
                                                item.type === 'series' && 
                                                item.seasonNumber === season.season_number && 
                                                item.episodeNumber === episode.episode_num
                                            )?.progress || 0}%` 
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              
                              {/* Episode Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold">
                                      {episode.title || `Episode ${episode.episode_num}`}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Season {season.season_number}, Episode {episode.episode_num}
                                    </p>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => playEpisode(season.season_number, episode.episode_num)}
                                  >
                                    <Play size={14} />
                                    <span>Play</span>
                                  </Button>
                                </div>
                                
                                {episode.info?.plot && (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {episode.info.plot}
                                  </p>
                                )}
                                
                                {episode.info?.duration && (
                                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock size={12} />
                                    {episode.info.duration} min
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                          <p className="text-center text-muted-foreground">
                            No episodes found for this season
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
            
            {/* Similar Series (if available from TMDB) */}
            {tmdbDetails?.similar?.results && tmdbDetails.similar.results.length > 0 && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-4 text-lg font-semibold">Similar Series</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {tmdbDetails.similar.results.slice(0, 6).map((similar) => (
                    <div key={similar.id} className="flex flex-col">
                      <div className="aspect-[2/3] overflow-hidden rounded-lg">
                        {similar.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${similar.poster_path}`}
                            alt={similar.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Clapperboard size={24} />
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium line-clamp-1">{similar.name}</p>
                      <p className="text-xs text-muted-foreground">{similar.first_air_date?.split('-')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">Series not found</p>
            <Button onClick={() => router.push('/series')}>
              Go back to Series
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}