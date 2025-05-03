'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { VideoPlayer } from '@/app/(components)/player/video-player';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { tmdbService } from '@/app/lib/api/tmdb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ArrowLeft, Info, Clock, Calendar, Film } from 'lucide-react';
import { EnhancedMovie } from '@/app/lib/types/app';
import { TMDBMovieDetails } from '@/app/lib/types/tmdb';

interface MovieWatchPageProps {
  params: {
    id: string;
  };
}

export default function MovieWatchPage({ params }: MovieWatchPageProps) {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    movies, 
    addToFavorites, 
    removeFromFavorites, 
    favorites,
    watchHistory
  } = useContentStore();
  
  const [movie, setMovie] = useState<EnhancedMovie | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TMDBMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the movie is in favorites
  const isFavorite = favorites.some(
    fav => fav.id === params.id && fav.type === 'movie'
  );
  
  // Get watch progress
  const watchProgress = watchHistory.find(
    item => item.id === params.id && item.type === 'movie'
  );
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Load movie data
    const loadMovie = async () => {
      try {
        setIsLoading(true);
        
        // Check if the movie is already in the store
        const existingMovie = movies.find(
          m => m.stream_id.toString() === params.id
        );
        
        if (existingMovie) {
          setMovie(existingMovie);
          
          // Load TMDB details if available
          if (existingMovie.tmdb_id) {
            try {
              const tmdbData = await tmdbService.getMovieDetails(existingMovie.tmdb_id);
              setTmdbDetails(tmdbData);
            } catch (tmdbError) {
              console.error('Error loading TMDB details:', tmdbError);
            }
          }
        } else {
          // Fetch the movie from the API
          const movieData = await xtreamService.getMovieById(parseInt(params.id));
          
          if (movieData) {
            // Enhance with favorite status and watch progress
            const enhancedMovie: EnhancedMovie = {
              ...movieData,
              isFavorite: favorites.some(
                fav => fav.id === movieData.stream_id.toString() && fav.type === 'movie'
              ),
              watchProgress: watchHistory.find(
                item => item.id === movieData.stream_id.toString() && item.type === 'movie'
              ) || null,
            };
            
            setMovie(enhancedMovie);
            
            // Load TMDB details if available
            if (movieData.tmdb_id) {
              try {
                const tmdbData = await tmdbService.getMovieDetails(movieData.tmdb_id);
                setTmdbDetails(tmdbData);
              } catch (tmdbError) {
                console.error('Error loading TMDB details:', tmdbError);
              }
            }
          } else {
            setError('Movie not found');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading movie:', error);
        setError('Failed to load movie');
        setIsLoading(false);
      }
    };
    
    loadMovie();
  }, [checkSession, router, params.id, movies, favorites, watchHistory]);
  
  // Toggle favorite
  const toggleFavorite = () => {
    if (!movie) return;
    
    if (isFavorite) {
      removeFromFavorites(params.id);
    } else {
      addToFavorites({
        id: params.id,
        type: 'movie',
        title: movie.name,
        posterUrl: movie.cover || movie.stream_icon || '',
        addedAt: new Date().toISOString(),
      });
    }
  };
  
  // Get movie URL
  const getMovieUrl = () => {
    if (!movie) return '';
    
    return xtreamService.getMovieUrl(movie.stream_id);
  };
  
  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours}h ${mins}m`;
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
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ) : error ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/movies')}>
              Go back to Movies
            </Button>
          </div>
        ) : movie ? (
          <div className="space-y-4">
            {/* Video Player */}
            <VideoPlayer
              url={getMovieUrl()}
              title={movie.name}
              contentId={params.id}
              contentType="movie"
              posterUrl={movie.cover || movie.stream_icon || undefined}
              autoPlay={true}
            />
            
            {/* Movie Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{movie.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {movie.year && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {movie.year}
                    </span>
                  )}
                  {tmdbDetails?.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(tmdbDetails.runtime)}
                    </span>
                  )}
                  {movie.rating && (
                    <span className="flex items-center gap-1">
                      <Star size={14} />
                      {movie.rating}
                    </span>
                  )}
                  {movie.category_name && (
                    <span className="flex items-center gap-1">
                      <Film size={14} />
                      {movie.category_name}
                    </span>
                  )}
                </div>
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
                  onClick={() => router.push(`/movies/details/${params.id}`)}
                >
                  <Info size={20} />
                </Button>
              </div>
            </div>
            
            {/* Movie Description */}
            {(movie.plot || tmdbDetails?.overview) && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Overview</h2>
                <p className="text-muted-foreground">
                  {tmdbDetails?.overview || movie.plot || 'No description available.'}
                </p>
              </div>
            )}
            
            {/* Cast & Crew (if available from TMDB) */}
            {tmdbDetails?.credits?.cast && tmdbDetails.credits.cast.length > 0 && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Cast</h2>
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
            
            {/* Similar Movies (if available from TMDB) */}
            {tmdbDetails?.similar?.results && tmdbDetails.similar.results.length > 0 && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Similar Movies</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {tmdbDetails.similar.results.slice(0, 6).map((similar) => (
                    <div key={similar.id} className="flex flex-col">
                      <div className="aspect-[2/3] overflow-hidden rounded-lg">
                        {similar.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${similar.poster_path}`}
                            alt={similar.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Film size={24} />
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium line-clamp-1">{similar.title}</p>
                      <p className="text-xs text-muted-foreground">{similar.release_date?.split('-')[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">Movie not found</p>
            <Button onClick={() => router.push('/movies')}>
              Go back to Movies
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}