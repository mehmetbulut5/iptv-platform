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
import { MovieCategory, Movie } from '@/app/lib/types/xtream';
import { EnhancedMovie } from '@/app/lib/types/app';

export default function MoviesPage() {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    movieCategories, 
    movies,
    setMovieCategories,
    setMovies,
    isLoadingMovieCategories,
    isLoadingMovies,
    setLoadingMovieCategories,
    setLoadingMovies,
    favorites,
    watchHistory
  } = useContentStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filteredMovies, setFilteredMovies] = useState<EnhancedMovie[]>([]);
  
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
        if (movieCategories.length === 0 && !isLoadingMovieCategories) {
          setLoadingMovieCategories(true);
          const categories = await xtreamService.getMovieCategories();
          setMovieCategories(categories);
          setLoadingMovieCategories(false);
        }
      } catch (error) {
        console.error('Error loading movie categories:', error);
        setLoadingMovieCategories(false);
      }
    };
    
    loadCategories();
  }, [
    checkSession, 
    router, 
    movieCategories.length, 
    isLoadingMovieCategories, 
    setMovieCategories, 
    setLoadingMovieCategories
  ]);
  
  // Load movies when category changes
  useEffect(() => {
    const loadMovies = async () => {
      try {
        if (selectedCategory === 'all') {
          // Load all movies if not already loaded
          if (!movies['all'] && !isLoadingMovies) {
            setLoadingMovies(true);
            const moviesData = await xtreamService.getMovies();
            
            // Enhance movies with favorite status and watch progress
            const enhancedMovies: EnhancedMovie[] = moviesData.map(movie => {
              const watchProgress = watchHistory.find(
                item => item.id === movie.stream_id.toString() && item.type === 'movie'
              );
              
              return {
                ...movie,
                isFavorite: favorites.some(fav => 
                  fav.id === movie.stream_id.toString() && fav.type === 'movie'
                ),
                watchProgress: watchProgress || null,
              };
            });
            
            setMovies('all', enhancedMovies);
            setLoadingMovies(false);
          }
        } else {
          // Load movies for selected category
          if (!movies[selectedCategory]) {
            setLoadingMovies(true);
            const categoryId = parseInt(selectedCategory);
            const moviesData = await xtreamService.getMoviesByCategory(categoryId);
            
            // Enhance movies with favorite status and watch progress
            const enhancedMovies: EnhancedMovie[] = moviesData.map(movie => {
              const watchProgress = watchHistory.find(
                item => item.id === movie.stream_id.toString() && item.type === 'movie'
              );
              
              return {
                ...movie,
                isFavorite: favorites.some(fav => 
                  fav.id === movie.stream_id.toString() && fav.type === 'movie'
                ),
                watchProgress: watchProgress || null,
              };
            });
            
            setMovies(selectedCategory, enhancedMovies);
            setLoadingMovies(false);
          }
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        setLoadingMovies(false);
      }
    };
    
    loadMovies();
  }, [
    selectedCategory, 
    movies, 
    isLoadingMovies, 
    setMovies, 
    setLoadingMovies,
    favorites,
    watchHistory
  ]);
  
  // Filter and sort movies
  useEffect(() => {
    if (!movies[selectedCategory]) {
      setFilteredMovies([]);
      return;
    }
    
    let filtered = [...(movies[selectedCategory] as EnhancedMovie[])];
    
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
  }, [searchQuery, sortBy, sortOrder, movies, selectedCategory]);
  
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
        <h1 className="mb-6 text-3xl font-bold">Movies</h1>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-2">
            <Filter size={20} />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Movies</SelectItem>
                {movieCategories.map((category) => (
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
          title={`${selectedCategory === 'all' ? 'All Movies' : 
            movieCategories.find(c => c.category_id.toString() === selectedCategory)?.category_name || 'Movies'}`}
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