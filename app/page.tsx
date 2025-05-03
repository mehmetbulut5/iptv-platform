'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tv, Film, Clapperboard, Clock, Star } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    watchHistory, 
    favorites,
    liveCategories,
    movieCategories,
    seriesCategories,
    setLiveCategories,
    setMovieCategories,
    setSeriesCategories,
    isLoadingLiveCategories,
    isLoadingMovieCategories,
    isLoadingSeriesCategories,
    setLoadingLiveCategories,
    setLoadingMovieCategories,
    setLoadingSeriesCategories
  } = useContentStore();
  
  const [activeTab, setActiveTab] = useState('recent');
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Load categories if not already loaded
    const loadCategories = async () => {
      try {
        // Load live categories
        if (liveCategories.length === 0 && !isLoadingLiveCategories) {
          setLoadingLiveCategories(true);
          const liveCats = await xtreamService.getLiveCategories();
          setLiveCategories(liveCats);
          setLoadingLiveCategories(false);
        }
        
        // Load movie categories
        if (movieCategories.length === 0 && !isLoadingMovieCategories) {
          setLoadingMovieCategories(true);
          const movieCats = await xtreamService.getMovieCategories();
          setMovieCategories(movieCats);
          setLoadingMovieCategories(false);
        }
        
        // Load series categories
        if (seriesCategories.length === 0 && !isLoadingSeriesCategories) {
          setLoadingSeriesCategories(true);
          const seriesCats = await xtreamService.getSeriesCategories();
          setSeriesCategories(seriesCats);
          setLoadingSeriesCategories(false);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, [
    checkSession, 
    router, 
    liveCategories.length, 
    movieCategories.length, 
    seriesCategories.length,
    isLoadingLiveCategories,
    isLoadingMovieCategories,
    isLoadingSeriesCategories,
    setLiveCategories,
    setMovieCategories,
    setSeriesCategories,
    setLoadingLiveCategories,
    setLoadingMovieCategories,
    setLoadingSeriesCategories
  ]);
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">Welcome to IPTV Platform</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <Clock size={16} />
              <span>Recently Watched</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Star size={16} />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-4">
            {watchHistory.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {/* Placeholder for watch history items */}
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-center text-muted-foreground">Watch history items will appear here</p>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                <p className="mb-2 text-center text-muted-foreground">No recently watched content</p>
                <p className="text-center text-sm text-muted-foreground">
                  Start watching content to see it here
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-4">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {/* Placeholder for favorites items */}
                <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-center text-muted-foreground">Favorite items will appear here</p>
                </div>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                <p className="mb-2 text-center text-muted-foreground">No favorite content</p>
                <p className="text-center text-sm text-muted-foreground">
                  Add content to favorites to see it here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Tv size={24} />
            <span>Live TV</span>
          </h2>
          
          {isLoadingLiveCategories ? (
            <div className="flex h-24 items-center justify-center">
              <p>Loading live TV categories...</p>
            </div>
          ) : liveCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {liveCategories.slice(0, 5).map((category) => (
                <Button 
                  key={category.category_id} 
                  variant="outline" 
                  className="h-24 flex-col justify-center"
                  onClick={() => router.push(`/live-tv/category/${category.category_id}`)}
                >
                  <Tv size={24} className="mb-2" />
                  <span className="text-center">{category.category_name}</span>
                </Button>
              ))}
              <Button 
                variant="outline" 
                className="h-24 flex-col justify-center"
                onClick={() => router.push('/live-tv')}
              >
                <span className="text-xl">...</span>
                <span className="text-center">View All</span>
              </Button>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-center text-muted-foreground">No live TV categories found</p>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Film size={24} />
            <span>Movies</span>
          </h2>
          
          {isLoadingMovieCategories ? (
            <div className="flex h-24 items-center justify-center">
              <p>Loading movie categories...</p>
            </div>
          ) : movieCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {movieCategories.slice(0, 5).map((category) => (
                <Button 
                  key={category.category_id} 
                  variant="outline" 
                  className="h-24 flex-col justify-center"
                  onClick={() => router.push(`/movies/category/${category.category_id}`)}
                >
                  <Film size={24} className="mb-2" />
                  <span className="text-center">{category.category_name}</span>
                </Button>
              ))}
              <Button 
                variant="outline" 
                className="h-24 flex-col justify-center"
                onClick={() => router.push('/movies')}
              >
                <span className="text-xl">...</span>
                <span className="text-center">View All</span>
              </Button>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-center text-muted-foreground">No movie categories found</p>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <Clapperboard size={24} />
            <span>Series</span>
          </h2>
          
          {isLoadingSeriesCategories ? (
            <div className="flex h-24 items-center justify-center">
              <p>Loading series categories...</p>
            </div>
          ) : seriesCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {seriesCategories.slice(0, 5).map((category) => (
                <Button 
                  key={category.category_id} 
                  variant="outline" 
                  className="h-24 flex-col justify-center"
                  onClick={() => router.push(`/series/category/${category.category_id}`)}
                >
                  <Clapperboard size={24} className="mb-2" />
                  <span className="text-center">{category.category_name}</span>
                </Button>
              ))}
              <Button 
                variant="outline" 
                className="h-24 flex-col justify-center"
                onClick={() => router.push('/series')}
              >
                <span className="text-xl">...</span>
                <span className="text-center">View All</span>
              </Button>
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
              <p className="text-center text-muted-foreground">No series categories found</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
