'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useContentStore } from '@/app/lib/store/content-store';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Info, 
  Star, 
  Clock, 
  Tv, 
  Film, 
  Clapperboard 
} from 'lucide-react';

interface ContentCardProps {
  id: string;
  type: 'live' | 'movie' | 'series';
  title: string;
  posterUrl: string;
  isFavorite?: boolean;
  progress?: number;
  onClick?: () => void;
  onPlayClick?: () => void;
  onInfoClick?: () => void;
  onFavoriteToggle?: () => void;
  // Live specific
  isLive?: boolean;
  currentProgram?: string;
  nextProgram?: string;
  // Movie specific
  year?: string;
  duration?: string;
  rating?: string;
  // Series specific
  seasons?: number;
  episodes?: number;
}

export function ContentCard({
  id,
  type,
  title,
  posterUrl,
  isFavorite = false,
  progress = 0,
  onClick,
  onPlayClick,
  onInfoClick,
  onFavoriteToggle,
  // Live specific
  isLive,
  currentProgram,
  nextProgram,
  // Movie specific
  year,
  duration,
  rating,
  // Series specific
  seasons,
  episodes,
}: ContentCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const { addToFavorites, removeFromFavorites } = useContentStore();
  
  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle();
    } else {
      if (isFavorite) {
        removeFromFavorites(id);
      } else {
        addToFavorites({
          id,
          type,
          title,
          posterUrl,
          addedAt: new Date().toISOString(),
        });
      }
    }
  };
  
  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation based on content type
      switch (type) {
        case 'live':
          router.push(`/live-tv/watch/${id}`);
          break;
        case 'movie':
          router.push(`/movies/watch/${id}`);
          break;
        case 'series':
          router.push(`/series/details/${id}`);
          break;
      }
    }
  };
  
  // Handle play click
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayClick) {
      onPlayClick();
    } else {
      // Default play action based on content type
      switch (type) {
        case 'live':
          router.push(`/live-tv/watch/${id}`);
          break;
        case 'movie':
          router.push(`/movies/watch/${id}`);
          break;
        case 'series':
          router.push(`/series/watch/${id}`);
          break;
      }
    }
  };
  
  // Handle info click
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfoClick) {
      onInfoClick();
    } else {
      // Default info action based on content type
      switch (type) {
        case 'live':
          router.push(`/live-tv/details/${id}`);
          break;
        case 'movie':
          router.push(`/movies/details/${id}`);
          break;
        case 'series':
          router.push(`/series/details/${id}`);
          break;
      }
    }
  };
  
  // Get content type icon
  const getTypeIcon = () => {
    switch (type) {
      case 'live':
        return <Tv size={16} />;
      case 'movie':
        return <Film size={16} />;
      case 'series':
        return <Clapperboard size={16} />;
    }
  };
  
  return (
    <motion.div
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted shadow-md transition-all"
      whileHover={{ scale: 1.05, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Poster Image */}
      <div className="relative h-full w-full">
        <Image
          src={posterUrl && (posterUrl.startsWith('http://') || posterUrl.startsWith('https://')) 
            ? posterUrl 
            : '/placeholder-poster.jpg'}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          priority={false}
          unoptimized={true} // Disable image optimization for external URLs
        />
        
        {/* Overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
        
        {/* Content type badge */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
          {getTypeIcon()}
          <span>
            {type === 'live' ? 'Live TV' : type === 'movie' ? 'Movie' : 'Series'}
          </span>
        </div>
        
        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-white opacity-0 transition-opacity hover:bg-black/30 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle();
          }}
        >
          <Star
            size={20}
            className={isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}
          />
        </Button>
        
        {/* Progress bar (if has progress) */}
        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Content info on hover */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-3 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
        >
          <h3 className="text-sm font-bold line-clamp-2">{title}</h3>
          
          {/* Content specific info */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {/* Live TV info */}
            {type === 'live' && isLive && (
              <span className="flex items-center gap-1 text-red-500">
                <Clock size={12} />
                LIVE
              </span>
            )}
            {type === 'live' && currentProgram && (
              <span className="line-clamp-1">Now: {currentProgram}</span>
            )}
            {type === 'live' && nextProgram && (
              <span className="line-clamp-1">Next: {nextProgram}</span>
            )}
            
            {/* Movie info */}
            {type === 'movie' && year && (
              <span>{year}</span>
            )}
            {type === 'movie' && duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {duration}
              </span>
            )}
            {type === 'movie' && rating && (
              <span className="flex items-center gap-1">
                <Star size={12} />
                {rating}
              </span>
            )}
            
            {/* Series info */}
            {type === 'series' && seasons && (
              <span>{seasons} {seasons === 1 ? 'Season' : 'Seasons'}</span>
            )}
            {type === 'series' && episodes && (
              <span>{episodes} {episodes === 1 ? 'Episode' : 'Episodes'}</span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={handlePlayClick}
            >
              <Play size={16} />
              <span>{type === 'live' ? 'Watch' : 'Play'}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-black/50 hover:bg-black/70"
              onClick={handleInfoClick}
            >
              <Info size={16} />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}