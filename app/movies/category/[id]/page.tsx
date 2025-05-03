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
import { EnhancedMovie } from '@/app/lib/types/app';

export default function MovieCategoryPage({ params }: { params: { id: string } }) {
  // Access params directly for now, but in a way that's compatible with future Next.js versions
  const categoryId = params.id;
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    movieCategories, 
    movies,
    setMovies,
    isLoadingMovies,
    setLoadingMovies,
    favorites,
    watchHistory
  } = useContentStore();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredMovies, setFilteredMovies] = useState<EnhancedMovie[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  
  // Check if user is authenticated
  useEffect(() => {
    const isSessionValid = checkSession();
    if (!isSessionValid) {
      router.push('/auth/login');
      return;
    }
    
    // Find category name
    const category = movieCategories.find(c => c.category_id.toString() === categoryId);
    if (category) {
      setCategoryName(category.category_name);
    }
    
    // Load movies for this category
    const loadMovies = async () => {
      try {
        setLoadingMovies(true);
        const catId = parseInt(categoryId);
        const moviesData = await xtreamService.getMoviesByCategory(catId);
        
        // Enhance movies with favorite status and watch progress
        const enhancedMovies: EnhancedMovie[] = moviesData.map(movie => {
          // Find watch history for this movie
          const movieWatchHistory = watchHistory.find(
            item => item.id === movie.stream_id.toString() && item.type === 'movie'
          );
          
          return {
            ...movie,
            isFavorite: favorites.some(fav => 
              fav.id === movie.stream_id.toString() && fav.type === 'movie'
            ),
            watchProgress: movieWatchHistory ? {
              progress: movieWatchHistory.progress,
              position: movieWatchHistory.position,
              duration: movieWatchHistory.duration,
              lastWatched: movieWatchHistory.lastWatched,
            } : null,
          };
        });
        
        setMovies(categoryId, enhancedMovies);
        setFilteredMovies(enhancedMovies);
        setLoadingMovies(false);
      } catch (error) {
        console.error('Error loading movies for category:', error);
        setLoadingMovies(false);
      }
    };
    
    // Check if we already have movies for this category
    if (!movies[categoryId]) {
      loadMovies();
    } else {
      setFilteredMovies(movies[categoryId] as EnhancedMovie[]);
    }
  }, [
    checkSession, 
    router, 
    categoryId, 
    movieCategories, 
    movies,
    setMovies, 
    setLoadingMovies,
    favorites,
    watchHistory
  ]);
  
  // Filter and sort movies
  useEffect(() => {
    if (!movies[categoryId]) return;
    
    let filtered = [...(movies[categoryId] as EnhancedMovie[])];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.name.toLowerCase().includes(query)
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
          const addedA = a.added ? new Date(a.added).getTime() : 0;
          const addedB = b.added ? new Date(b.added).getTime() : 0;
          comparison = addedA - addedB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredMovies(filtered);
  }, [searchQuery, sortBy, sortOrder, movies, categoryId]);
  
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
        <h1 className="mb-6 text-3xl font-bold">{categoryName || 'Movies Category'}</h1>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
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
          movies={filteredMovies}
          isLoading={isLoadingMovies}
          emptyMessage={
            searchQuery.trim() !== '' 
              ? `No movies found matching "${searchQuery}"` 
              : 'No movies found in this category'
          }
        />
      </div>
    </MainLayout>
  );
}