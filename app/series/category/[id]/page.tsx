'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
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
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { EnhancedSeries } from '@/app/lib/types/app';

export default function SeriesCategoryPage({ params }: { params: { id: string } }) {
  // Access params directly for now, but in a way that's compatible with future Next.js versions
  const categoryId = params.id;
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    seriesCategories, 
    series,
    setSeries,
    isLoadingSeries,
    setLoadingSeries,
    favorites,
    watchHistory
  } = useContentStore();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredSeries, setFilteredSeries] = useState<EnhancedSeries[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Find category name
    const category = seriesCategories.find(c => c.category_id.toString() === categoryId);
    if (category) {
      setCategoryName(category.category_name);
    }
    
    // Load series for this category
    const loadSeries = async () => {
      try {
        setLoadingSeries(true);
        const catId = parseInt(categoryId);
        const seriesData = await xtreamService.getSeriesByCategory(catId);
        
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
        
        setSeries(categoryId, enhancedSeries);
        setFilteredSeries(enhancedSeries);
        setLoadingSeries(false);
      } catch (error) {
        console.error('Error loading series for category:', error);
        setLoadingSeries(false);
      }
    };
    
    // Check if we already have series for this category
    if (!series[categoryId]) {
      loadSeries();
    } else {
      setFilteredSeries(series[categoryId] as EnhancedSeries[]);
    }
  }, [
    checkSession, 
    router, 
    categoryId, 
    seriesCategories, 
    series,
    setSeries, 
    setLoadingSeries,
    favorites,
    watchHistory
  ]);
  
  // Filter and sort series
  useEffect(() => {
    if (!series[categoryId]) return;
    
    let filtered = [...(series[categoryId] as EnhancedSeries[])];
    
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
  }, [searchQuery, sortBy, sortOrder, series, categoryId]);
  
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
        <h1 className="mb-6 text-3xl font-bold">{categoryName || 'Series Category'}</h1>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
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