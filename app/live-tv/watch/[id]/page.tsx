'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { VideoPlayer } from '@/app/(components)/player/video-player';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, ArrowLeft, Info } from 'lucide-react';
import { EnhancedLiveStream } from '@/app/lib/types/app';

interface LiveTVWatchPageProps {
  params: {
    id: string;
  };
}

export default function LiveTVWatchPage({ params }: LiveTVWatchPageProps) {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    liveStreams, 
    addToFavorites, 
    removeFromFavorites, 
    favorites 
  } = useContentStore();
  
  const [stream, setStream] = useState<EnhancedLiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the stream is in favorites
  const isFavorite = favorites.some(
    fav => fav.id === params.id && fav.type === 'live'
  );
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Load stream data
    const loadStream = async () => {
      try {
        setIsLoading(true);
        
        // Check if the stream is already in the store
        const existingStream = liveStreams.find(
          s => s.stream_id.toString() === params.id
        );
        
        if (existingStream) {
          setStream(existingStream);
        } else {
          // Fetch the stream from the API
          const streamData = await xtreamService.getLiveStreamById(parseInt(params.id));
          
          if (streamData) {
            // Enhance with favorite status
            const enhancedStream: EnhancedLiveStream = {
              ...streamData,
              isFavorite: favorites.some(
                fav => fav.id === streamData.stream_id.toString() && fav.type === 'live'
              ),
              currentProgram: null,
              nextProgram: null,
            };
            
            setStream(enhancedStream);
          } else {
            setError('Stream not found');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading stream:', error);
        setError('Failed to load stream');
        setIsLoading(false);
      }
    };
    
    loadStream();
  }, [checkSession, router, params.id, liveStreams, favorites]);
  
  // Toggle favorite
  const toggleFavorite = () => {
    if (!stream) return;
    
    if (isFavorite) {
      removeFromFavorites(params.id);
    } else {
      addToFavorites({
        id: params.id,
        type: 'live',
        title: stream.name,
        posterUrl: stream.stream_icon || '',
        addedAt: new Date().toISOString(),
      });
    }
  };
  
  // Get stream URL
  const getStreamUrl = () => {
    if (!stream) return '';
    
    return xtreamService.getLiveStreamUrl(stream.stream_id);
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
            <Button onClick={() => router.push('/live-tv')}>
              Go back to Live TV
            </Button>
          </div>
        ) : stream ? (
          <div className="space-y-4">
            {/* Video Player */}
            <VideoPlayer
              url={getStreamUrl()}
              title={stream.name}
              contentId={params.id}
              contentType="live"
              posterUrl={stream.stream_icon || undefined}
              autoPlay={true}
            />
            
            {/* Stream Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{stream.name}</h1>
                {stream.category_id && (
                  <p className="text-muted-foreground">
                    Category: {stream.category_name || 'Unknown'}
                  </p>
                )}
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
                  onClick={() => router.push(`/live-tv/details/${params.id}`)}
                >
                  <Info size={20} />
                </Button>
              </div>
            </div>
            
            {/* Current Program */}
            {stream.currentProgram && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Now Playing</h2>
                <p className="text-xl">{stream.currentProgram.title}</p>
                {stream.currentProgram.description && (
                  <p className="mt-2 text-muted-foreground">
                    {stream.currentProgram.description}
                  </p>
                )}
                {stream.currentProgram.start_timestamp && stream.currentProgram.stop_timestamp && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(stream.currentProgram.start_timestamp * 1000).toLocaleTimeString()} - 
                    {new Date(stream.currentProgram.stop_timestamp * 1000).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
            
            {/* Next Program */}
            {stream.nextProgram && (
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Up Next</h2>
                <p className="text-xl">{stream.nextProgram.title}</p>
                {stream.nextProgram.description && (
                  <p className="mt-2 text-muted-foreground">
                    {stream.nextProgram.description}
                  </p>
                )}
                {stream.nextProgram.start_timestamp && stream.nextProgram.stop_timestamp && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(stream.nextProgram.start_timestamp * 1000).toLocaleTimeString()} - 
                    {new Date(stream.nextProgram.stop_timestamp * 1000).toLocaleTimeString()}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">Stream not found</p>
            <Button onClick={() => router.push('/live-tv')}>
              Go back to Live TV
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}