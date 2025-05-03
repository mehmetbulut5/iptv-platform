'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { ContentGrid } from '@/app/(components)/cards/content-grid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Search, X } from 'lucide-react';
import { EnhancedLiveStream, EnhancedMovie, EnhancedSeries } from '@/app/lib/types/app';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession } = useAuth();
  const { 
    liveStreams, 
    movies, 
    series,
    isLoadingLiveStreams,
    isLoadingMovies,
    isLoadingSeries,
    favorites,
    watchHistory
  } = useContentStore();
  
  // Get query from URL
  const queryParam = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  
  // Search results
  const [filteredLiveStreams, setFilteredLiveStreams] = useState<EnhancedLiveStream[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<EnhancedMovie[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<EnhancedSeries[]>([]);
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
    }
  }, [checkSession, router]);
  
  // Update search query when URL param changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);
  
  // Perform search when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLiveStreams([]);
      setFilteredMovies([]);
      setFilteredSeries([]);
      return;
    }
    
    setIsSearching(true);
    
    const query = searchQuery.toLowerCase();
    
    // Search live streams
    const matchedLiveStreams = liveStreams.filter(stream => 
      stream.name.toLowerCase().includes(query)
    );
    setFilteredLiveStreams(matchedLiveStreams);
    
    // Search movies
    const matchedMovies = movies.filter(movie => 
      movie.name.toLowerCase().includes(query)
    );
    setFilteredMovies(matchedMovies);
    
    // Search series
    const matchedSeries = series.filter(show => 
      show.name.toLowerCase().includes(query)
    );
    setFilteredSeries(matchedSeries);
    
    setIsSearching(false);
  }, [searchQuery, liveStreams, movies, series]);
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search query
    const params = new URLSearchParams(searchParams);
    params.set('q', searchQuery);
    router.push(`/search?${params.toString()}`);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    router.push('/search');
  };
  
  // Get total results count
  const totalResults = filteredLiveStreams.length + filteredMovies.length + filteredSeries.length;
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for movies, series, channels..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={clearSearch}
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </form>
        
        {/* Search Results */}
        {searchQuery ? (
          <>
            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-muted-foreground">
                {isSearching 
                  ? 'Searching...' 
                  : `Found ${totalResults} results for "${searchQuery}"`}
              </p>
            </div>
            
            {/* Results Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">
                  All ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="live">
                  Live TV ({filteredLiveStreams.length})
                </TabsTrigger>
                <TabsTrigger value="movies">
                  Movies ({filteredMovies.length})
                </TabsTrigger>
                <TabsTrigger value="series">
                  Series ({filteredSeries.length})
                </TabsTrigger>
              </TabsList>
              
              {/* All Results */}
              <TabsContent value="all">
                {totalResults > 0 ? (
                  <div className="space-y-8">
                    {/* Live TV Results */}
                    {filteredLiveStreams.length > 0 && (
                      <div>
                        <h2 className="mb-4 text-xl font-semibold">Live TV</h2>
                        <ContentGrid liveStreams={filteredLiveStreams} />
                      </div>
                    )}
                    
                    {/* Movie Results */}
                    {filteredMovies.length > 0 && (
                      <div>
                        <h2 className="mb-4 text-xl font-semibold">Movies</h2>
                        <ContentGrid movies={filteredMovies} />
                      </div>
                    )}
                    
                    {/* Series Results */}
                    {filteredSeries.length > 0 && (
                      <div>
                        <h2 className="mb-4 text-xl font-semibold">Series</h2>
                        <ContentGrid series={filteredSeries} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                    <p className="mb-2 text-center text-muted-foreground">
                      No results found for "{searchQuery}"
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                )}
              </TabsContent>
              
              {/* Live TV Results */}
              <TabsContent value="live">
                <ContentGrid
                  liveStreams={filteredLiveStreams}
                  isLoading={isSearching}
                  emptyMessage={`No live TV channels found matching "${searchQuery}"`}
                />
              </TabsContent>
              
              {/* Movie Results */}
              <TabsContent value="movies">
                <ContentGrid
                  movies={filteredMovies}
                  isLoading={isSearching}
                  emptyMessage={`No movies found matching "${searchQuery}"`}
                />
              </TabsContent>
              
              {/* Series Results */}
              <TabsContent value="series">
                <ContentGrid
                  series={filteredSeries}
                  isLoading={isSearching}
                  emptyMessage={`No series found matching "${searchQuery}"`}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
            <p className="mb-2 text-center text-muted-foreground">
              Enter a search term to find content
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Search for movies, series, or live TV channels
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}