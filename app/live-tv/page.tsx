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
import { Search, Filter } from 'lucide-react';
import { LiveCategory, LiveStream } from '@/app/lib/types/xtream';
import { EnhancedLiveStream } from '@/app/lib/types/app';

export default function LiveTVPage() {
  const router = useRouter();
  const { checkSession } = useAuth();
  const { 
    liveCategories, 
    liveStreams,
    setLiveCategories,
    setLiveStreams,
    isLoadingLiveCategories,
    isLoadingLiveStreams,
    setLoadingLiveCategories,
    setLoadingLiveStreams,
    favorites
  } = useContentStore();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredStreams, setFilteredStreams] = useState<EnhancedLiveStream[]>([]);
  
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
        if (liveCategories.length === 0 && !isLoadingLiveCategories) {
          setLoadingLiveCategories(true);
          const categories = await xtreamService.getLiveCategories();
          setLiveCategories(categories);
          setLoadingLiveCategories(false);
        }
      } catch (error) {
        console.error('Error loading live categories:', error);
        setLoadingLiveCategories(false);
      }
    };
    
    loadCategories();
  }, [
    checkSession, 
    router, 
    liveCategories.length, 
    isLoadingLiveCategories, 
    setLiveCategories, 
    setLoadingLiveCategories
  ]);
  
  // Load streams when category changes
  useEffect(() => {
    const loadStreams = async () => {
      try {
        if (selectedCategory === 'all') {
          // Load all streams if not already loaded
          if (!liveStreams['all'] && !isLoadingLiveStreams) {
            setLoadingLiveStreams(true);
            const streams = await xtreamService.getLiveStreams();
            
            // Enhance streams with favorite status
            const enhancedStreams: EnhancedLiveStream[] = streams.map(stream => ({
              ...stream,
              isFavorite: favorites.some(fav => 
                fav.id === stream.stream_id.toString() && fav.type === 'live'
              ),
              // We'll add EPG data later
              currentProgram: null,
              nextProgram: null,
            }));
            
            setLiveStreams('all', enhancedStreams);
            setLoadingLiveStreams(false);
          }
        } else {
          // Load streams for selected category
          if (!liveStreams[selectedCategory]) {
            setLoadingLiveStreams(true);
            const categoryId = parseInt(selectedCategory);
            const streams = await xtreamService.getLiveStreamsByCategory(categoryId);
            
            // Enhance streams with favorite status
            const enhancedStreams: EnhancedLiveStream[] = streams.map(stream => ({
              ...stream,
              isFavorite: favorites.some(fav => 
                fav.id === stream.stream_id.toString() && fav.type === 'live'
              ),
              // We'll add EPG data later
              currentProgram: null,
              nextProgram: null,
            }));
            
            setLiveStreams(selectedCategory, enhancedStreams);
            setLoadingLiveStreams(false);
          }
        }
      } catch (error) {
        console.error('Error loading live streams:', error);
        setLoadingLiveStreams(false);
      }
    };
    
    loadStreams();
  }, [
    selectedCategory, 
    liveStreams, 
    isLoadingLiveStreams, 
    setLiveStreams, 
    setLoadingLiveStreams,
    favorites
  ]);
  
  // Filter streams based on search query
  useEffect(() => {
    if (!liveStreams[selectedCategory]) {
      setFilteredStreams([]);
      return;
    }
    
    const currentStreams = liveStreams[selectedCategory] as EnhancedLiveStream[];
    
    if (searchQuery.trim() === '') {
      setFilteredStreams(currentStreams);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = currentStreams.filter(stream => 
        stream.name.toLowerCase().includes(query)
      );
      setFilteredStreams(filtered);
    }
  }, [searchQuery, liveStreams, selectedCategory]);
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="mb-6 text-3xl font-bold">Live TV</h1>
        
        {/* Filters and Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-2">
            <Filter size={20} />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {liveCategories.map((category) => (
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
              placeholder="Search channels..."
              className="pl-9"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        {/* Content Grid */}
        <ContentGrid
          title={`${selectedCategory === 'all' ? 'All Channels' : 
            liveCategories.find(c => c.category_id.toString() === selectedCategory)?.category_name || 'Channels'}`}
          liveStreams={filteredStreams}
          isLoading={isLoadingLiveStreams}
          emptyMessage={
            searchQuery.trim() !== '' 
              ? `No channels found matching "${searchQuery}"` 
              : 'No channels found in this category'
          }
        />
      </div>
    </MainLayout>
  );
}