'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/app/(components)/layout/main-layout';
import { useAuth } from '@/app/hooks/use-auth';
import { useContentStore } from '@/app/lib/store/content-store';
import { xtreamService } from '@/app/lib/api/xtream';
import { ContentGrid } from '@/app/(components)/cards/content-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { SeriesCategory, Series } from '@/app/lib/types/xtream';
import { EnhancedSeries } from '@/app/lib/types/app';

export default function SeriesPage() {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    seriesCategories, 
    series,
    setSeriesCategories,
    setSeries,
    isLoadingSeriesCategories,
    isLoadingSeries,
    setLoadingSeriesCategories,
    setLoadingSeries,
    favorites,
    watchHistory
  } = useContentStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredSeries, setFilteredSeries] = useState<EnhancedSeries[]>([]);
  
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
        if (seriesCategories.length === 0 && !isLoadingSeriesCategories) {
          setLoadingSeriesCategories(true);
          const categories = await xtreamService.getSeriesCategories();
          setSeriesCategories(categories);
          setLoadingSeriesCategories(false);
        }
      } catch (error) {
        console.error('Error loading series categories:', error);
        setLoadingSeriesCategories(false);
      }
    };
    
    loadCategories();
  }, [
    checkSession, 
    router, 
    seriesCategories.length, 
    isLoadingSeriesCategories, 
    setSeriesCategories, 
    setLoadingSeriesCategories
  ]);
  
  // Load series when category changes
  useEffect(() => {
    const loadSeries = async () => {
      try {
        if (selectedCategory === 'all') {
          // Load all series if not already loaded
          if (series.length === 0 && !isLoadingSeries) {
            setLoadingSeries(true);
            const seriesData = await xtreamService.getSeries();
            
            // Enhance series with favorite status and watch progress
            const enhancedSeries: EnhancedSeries[] = seriesData.map(show => {
              // Find all watch history items for this series
              const seriesWatchHistory = watchHistory.filter(
                item => item.id === show.series_id.toString() && item.type === 'series'
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
              
              return {
                ...show,
                isFavorite: favorites.some(fav => 
                  fav.id === show.series_id.toString() && fav.type === 'series'
                ),
                watchProgress: watchProgress,
              };
            });
            
            setSeries(enhancedSeries);
            setLoadingSeries(false);
          }
        } else {
          // Load series for selected category
          setLoadingSeries(true);
          const categoryId = parseInt(selectedCategory);
          const seriesData = await xtreamService.getSeriesByCategory(categoryId);
          
          // Enhance series with favorite status and watch progress
          const enhancedSeries: EnhancedSeries[] = seriesData.map(show => {
            // Find all watch history items for this series
            const seriesWatchHistory = watchHistory.filter(
              item => item.id === show.series_id.toString() && item.type === 'series'
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
            
            return {
              ...show,
              isFavorite: favorites.some(fav => 
                fav.id === show.series_id.toString() && fav.type === 'series'
              ),
              watchProgress: watchProgress,
            };
          });
          
          setSeries(enhancedSeries);
          setLoadingSeries(false);
        }
      } catch (error) {
        console.error('Error loading series:', error);
        setLoadingSeries(false);
      }
    };
    
    loadSeries();
  }, [
    selectedCategory, 
    series.length, 
    isLoadingSeries, 
    setSeries, 
    setLoadingSeries,
    favorites,
    watchHistory
  ]);
  
  // Filter and sort series
  useEffect(() => {
    let filtered = [...series];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(show => 
        show.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'year':
          const yearA = a.year ? parseInt(a.year) : 0;
          const yearB = b.year ? parseInt(b.year) : 0;
          comparison = yearA - yearB;
          break;
        case 'rating':
          const ratingA = a.rating ? parseFloat(a.rating) : 0;
          const ratingB = b.rating ? parseFloat(b.rating) : 0;
          comparison = ratingA - ratingB;
          break;
        case 'added':
          const addedA = a.last_modified ? new Date(a.last_modified).getTime() : 0;
          const addedB = b.last_modified ? new Date(b.last_modified).getTime() : 0;
          comparison = addedA - addedB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredSeries(filtered);
  }, [searchQuery, sortBy, sortOrder, series]);
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">TV Series</h1>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-2">
            <Filter size={20} />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Series</SelectItem>
                {seriesCategories.map((category) => (
                  <SelectItem 
                    key={category.category_id} 
                    value={category.category_id.toString()}
                  >
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search series..."
              className="pl-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="added">Date Added</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleSortOrder}
            >
              {sortOrder === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </Button>
          </div>
        </div>
        
        {/* Content Grid */}
        <ContentGrid
          title={`${selectedCategory === 'all' ? 'All Series' : 
            seriesCategories.find(c => c.category_id.toString() === selectedCategory)?.category_name || 'Series'}`}
          series={filteredSeries}
          isLoading={isLoadingSeries}
          emptyMessage={
            searchQuery.trim() !== '' 
              ? `No series found matching "${searchQuery}"` 
              : 'No series found in this category'
          }
        />
      </div>
    </MainLayout>
  );
}