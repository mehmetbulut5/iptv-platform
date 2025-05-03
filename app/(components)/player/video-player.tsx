'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/app/lib/store/player-store';
import { useContentStore } from '@/app/lib/store/content-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  X
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  contentId: string;
  contentType: 'live' | 'movie' | 'series';
  posterUrl?: string;
  autoPlay?: boolean;
  seasonNumber?: number;
  episodeNumber?: number;
  onClose?: () => void;
}

export function VideoPlayer({
  url,
  title,
  contentId,
  contentType,
  posterUrl,
  autoPlay = true,
  seasonNumber,
  episodeNumber,
  onClose
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Player store
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    setPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setMuted,
    setFullscreen,
    setCurrentContent,
    setCurrentEpisode,
    playerOptions,
    updatePlayerOptions
  } = usePlayerStore();
  
  // Content store
  const { addToWatchHistory } = useContentStore();
  
  // Initialize player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Set initial content info
    setCurrentContent(contentId, contentType, title, posterUrl || null, url);
    
    // Set episode info if available
    if (contentType === 'series' && seasonNumber !== undefined && episodeNumber !== undefined) {
      setCurrentEpisode(seasonNumber, episodeNumber);
    }
    
    // Initialize HLS if supported
    if (url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: playerOptions.autoPlay ? 30 : 60,
          maxMaxBufferLength: 60,
        });
        
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay || playerOptions.autoPlay) {
            video.play().catch(err => console.error('Error playing video:', err));
          }
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                // Cannot recover
                hls.destroy();
                break;
            }
          }
        });
        
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        if (autoPlay || playerOptions.autoPlay) {
          video.play().catch(err => console.error('Error playing video:', err));
        }
      }
    } else {
      // Regular video
      video.src = url;
      if (autoPlay || playerOptions.autoPlay) {
        video.play().catch(err => console.error('Error playing video:', err));
      }
    }
    
    // Set initial volume
    video.volume = playerOptions.volume / 100;
    video.muted = playerOptions.muted;
    
    // Set initial playback rate
    video.playbackRate = playerOptions.playbackRate;
    
  }, [
    url, 
    contentId, 
    contentType, 
    title, 
    posterUrl, 
    autoPlay, 
    seasonNumber, 
    episodeNumber, 
    setCurrentContent, 
    setCurrentEpisode,
    playerOptions
  ]);
  
  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume * 100);
      setMuted(video.muted);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => {
      // Add to watch history with completed status
      if (contentType !== 'live') {
        addToWatchHistory({
          id: contentId,
          type: contentType,
          title,
          posterUrl: posterUrl || '',
          progress: 100,
          duration: video.duration,
          position: video.duration,
          lastWatched: new Date().toISOString(),
          seasonNumber,
          episodeNumber,
        });
      }
    };
    
    // Add event listeners
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEnded);
    
    // Update watch history periodically (every 5 seconds)
    const historyInterval = setInterval(() => {
      if (contentType !== 'live' && video.currentTime > 0 && video.duration > 0) {
        const progress = Math.round((video.currentTime / video.duration) * 100);
        
        // Only update if watched more than 5% and not completed
        if (progress > 5 && progress < 95) {
          addToWatchHistory({
            id: contentId,
            type: contentType,
            title,
            posterUrl: posterUrl || '',
            progress,
            duration: video.duration,
            position: video.currentTime,
            lastWatched: new Date().toISOString(),
            seasonNumber,
            episodeNumber,
          });
        }
      }
    }, 5000);
    
    return () => {
      // Remove event listeners
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEnded);
      
      // Clear interval
      clearInterval(historyInterval);
    };
  }, [
    contentId, 
    contentType, 
    title, 
    posterUrl, 
    seasonNumber, 
    episodeNumber, 
    setPlaying, 
    setCurrentTime, 
    setDuration, 
    setVolume, 
    setMuted,
    addToWatchHistory
  ]);
  
  // Handle fullscreen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const onFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [setFullscreen]);
  
  // Handle controls visibility
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const showControlsTemporarily = () => {
      setShowControls(true);
      
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      
      controlsTimerRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const onMouseMove = () => showControlsTemporarily();
    const onTouchStart = () => showControlsTemporarily();
    
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchstart', onTouchStart);
    
    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchstart', onTouchStart);
      
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [isPlaying]);
  
  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => console.error('Error playing video:', err));
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    updatePlayerOptions({ muted: !video.muted });
  };
  
  // Set volume
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0];
    video.volume = newVolume / 100;
    updatePlayerOptions({ volume: newVolume });
  };
  
  // Seek
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = value[0];
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => console.error('Error entering fullscreen:', err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.error('Error exiting fullscreen:', err));
      }
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div 
      ref={containerRef} 
      className="relative aspect-video w-full overflow-hidden bg-black"
      onClick={togglePlay}
    >
      {/* Video element */}
      <video 
        ref={videoRef}
        className="h-full w-full"
        poster={posterUrl}
        playsInline
      />
      
      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      
      {/* Close button (if provided) */}
      {onClose && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4 z-10 text-white hover:bg-black/30"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X size={24} />
        </Button>
      )}
      
      {/* Controls overlay */}
      {showControls && (
        <div 
          className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 to-transparent p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title */}
          <div className="text-lg font-bold text-white">
            {title}
            {contentType === 'series' && seasonNumber !== undefined && episodeNumber !== undefined && (
              <span className="ml-2 text-sm font-normal">
                S{seasonNumber} E{episodeNumber}
              </span>
            )}
          </div>
          
          {/* Bottom controls */}
          <div className="space-y-2">
            {/* Progress bar (not for live content) */}
            {contentType !== 'live' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-white">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="flex-1"
                />
                <span className="text-xs text-white">
                  {formatTime(duration)}
                </span>
              </div>
            )}
            
            {/* Live progress indicator */}
            {contentType === 'live' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-red-500">LIVE</span>
                <Progress value={100} className="h-1 flex-1" />
              </div>
            )}
            
            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                
                {/* Skip buttons (not for live content) */}
                {contentType !== 'live' && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/10"
                      onClick={() => {
                        const video = videoRef.current;
                        if (video) {
                          video.currentTime = Math.max(0, video.currentTime - 10);
                        }
                      }}
                    >
                      <SkipBack size={20} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/10"
                      onClick={() => {
                        const video = videoRef.current;
                        if (video) {
                          video.currentTime = Math.min(video.duration, video.currentTime + 10);
                        }
                      }}
                    >
                      <SkipForward size={20} />
                    </Button>
                  </>
                )}
                
                {/* Volume controls */}
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/10"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Settings button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Show settings menu
                  }}
                >
                  <Settings size={20} />
                </Button>
                
                {/* Fullscreen button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}